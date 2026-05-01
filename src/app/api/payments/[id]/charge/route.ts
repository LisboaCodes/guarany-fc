import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPixCharge } from '@/lib/mercadopago'
import { sendPixChargeMessage } from '@/lib/whatsapp'

// POST /api/payments/[id]/charge - Gera cobranca PIX no Mercado Pago
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { member: true },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })
    }

    if (payment.status === 'PAID') {
      return NextResponse.json({ error: 'Pagamento já foi quitado' }, { status: 400 })
    }

    if (payment.mpPaymentId && payment.mpQrCode && payment.mpExpiresAt && payment.mpExpiresAt > new Date()) {
      return NextResponse.json({
        message: 'Cobrança já existe e está válida',
        mpPaymentId: payment.mpPaymentId,
        qrCode: payment.mpQrCode,
        qrCodeBase64: payment.mpQrCodeBase64,
        ticketUrl: payment.mpTicketUrl,
        expiresAt: payment.mpExpiresAt,
        reused: true,
      })
    }

    const member = payment.member
    const [firstName, ...rest] = member.name.split(' ')

    if (!member.email) {
      return NextResponse.json(
        { error: 'Sócio sem email cadastrado — obrigatório para gerar PIX no MP' },
        { status: 400 }
      )
    }

    const charge = await createPixCharge({
      paymentId: payment.id,
      amount: Number(payment.amount),
      description: `Mensalidade AA Guarany FC - ${String(payment.referenceMonth).padStart(2, '0')}/${payment.referenceYear}`,
      payer: {
        email: member.email,
        firstName,
        lastName: rest.join(' '),
        cpf: member.cpf,
      },
    })

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        method: 'PIX',
        mpPaymentId: charge.mpPaymentId,
        mpQrCode: charge.qrCode,
        mpQrCodeBase64: charge.qrCodeBase64,
        mpTicketUrl: charge.ticketUrl,
        mpStatus: charge.status,
        mpExpiresAt: charge.expiresAt,
      },
    })

    await prisma.auditLog.create({
      data: {
        action: 'CREATE_MP_CHARGE',
        entityType: 'Payment',
        entityId: payment.id,
        changes: { mpPaymentId: charge.mpPaymentId, amount: Number(payment.amount) },
        userId: session.user.id,
      },
    })

    if (member.phone) {
      sendPixChargeMessage(
        { id: member.id, name: member.name, phone: member.phone },
        {
          amount: Number(payment.amount),
          referenceMonth: payment.referenceMonth,
          referenceYear: payment.referenceYear,
          dueDate: payment.dueDate,
        },
        { qrCode: charge.qrCode, ticketUrl: charge.ticketUrl },
      ).catch(err => console.error('[MP] Erro ao enviar PIX por WhatsApp:', err))
    }

    return NextResponse.json({
      message: 'Cobrança gerada com sucesso',
      mpPaymentId: charge.mpPaymentId,
      qrCode: charge.qrCode,
      qrCodeBase64: charge.qrCodeBase64,
      ticketUrl: charge.ticketUrl,
      expiresAt: charge.expiresAt,
      payment: updated,
    })
  } catch (error: any) {
    console.error('[MP] Erro ao criar cobrança:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro ao gerar cobrança no Mercado Pago' },
      { status: 500 }
    )
  }
}
