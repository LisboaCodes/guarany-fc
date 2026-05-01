import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createBoletoCharge } from '@/lib/mercadopago'
import { sendBoletoChargeMessage } from '@/lib/whatsapp'

// POST /api/payments/[id]/boleto - Gera boleto via Mercado Pago
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

    const member = payment.member

    if (!member.email) {
      return NextResponse.json(
        { error: 'Sócio sem email cadastrado — obrigatório para gerar boleto' },
        { status: 400 }
      )
    }

    const [firstName, ...rest] = member.name.split(' ')

    const expiresAt = new Date(payment.dueDate)
    expiresAt.setHours(23, 59, 59, 999)
    if (expiresAt < new Date()) {
      const fallback = new Date()
      fallback.setDate(fallback.getDate() + 3)
      expiresAt.setTime(fallback.getTime())
    }

    const boleto = await createBoletoCharge({
      paymentId: payment.id,
      amount: Number(payment.amount),
      description: `Mensalidade AA Guarany FC - ${String(payment.referenceMonth).padStart(2, '0')}/${payment.referenceYear}`,
      expiresAt,
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
        method: 'BOLETO',
        mpPaymentId: boleto.mpPaymentId,
        mpTicketUrl: boleto.ticketUrl,
        mpStatus: boleto.status,
        mpExpiresAt: boleto.expiresAt,
        mpQrCode: boleto.barcode,
      },
    })

    await prisma.auditLog.create({
      data: {
        action: 'CREATE_MP_BOLETO',
        entityType: 'Payment',
        entityId: payment.id,
        changes: { mpPaymentId: boleto.mpPaymentId, amount: Number(payment.amount) },
        userId: session.user.id,
      },
    })

    if (member.phone) {
      sendBoletoChargeMessage(
        { id: member.id, name: member.name, phone: member.phone },
        {
          amount: Number(payment.amount),
          referenceMonth: payment.referenceMonth,
          referenceYear: payment.referenceYear,
          dueDate: payment.dueDate,
        },
        { ticketUrl: boleto.ticketUrl, barcode: boleto.barcode },
      ).catch(err => console.error('[MP] Erro ao enviar boleto por WhatsApp:', err))
    }

    return NextResponse.json({
      message: 'Boleto gerado com sucesso',
      mpPaymentId: boleto.mpPaymentId,
      ticketUrl: boleto.ticketUrl,
      barcode: boleto.barcode,
      expiresAt: boleto.expiresAt,
      payment: updated,
    })
  } catch (error: any) {
    console.error('[MP] Erro ao criar boleto:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro ao gerar boleto no Mercado Pago' },
      { status: 500 }
    )
  }
}
