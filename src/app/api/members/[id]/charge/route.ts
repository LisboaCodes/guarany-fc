import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { chargeMember, ChargeMethod } from '@/lib/auto-charge'

// POST /api/members/[id]/charge - Gera cobranca MP (PIX/BOLETO) para o socio
// e dispara link via WhatsApp. Cria o Payment do mes se ainda nao existir.
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
    const body = await request.json().catch(() => ({}))

    const method: ChargeMethod = body.method === 'BOLETO' ? 'BOLETO' : 'PIX'
    const referenceMonth = body.referenceMonth ? Number(body.referenceMonth) : undefined
    const referenceYear = body.referenceYear ? Number(body.referenceYear) : undefined
    const amount = body.amount ? Number(body.amount) : undefined
    const notifyWhatsApp = body.notifyWhatsApp !== false

    const result = await chargeMember({
      memberId: id,
      method,
      referenceMonth,
      referenceYear,
      amount,
      registeredById: session.user.id,
      notifyWhatsApp,
    })

    await prisma.auditLog.create({
      data: {
        action: method === 'PIX' ? 'CREATE_MP_CHARGE' : 'CREATE_MP_BOLETO',
        entityType: 'Payment',
        entityId: result.paymentId,
        changes: {
          mpPaymentId: result.mpPaymentId,
          memberId: id,
          amount: result.amount,
          method,
          source: 'member_button',
          reused: result.reused,
        },
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      message: result.reused
        ? 'Cobrança existente reutilizada'
        : 'Cobrança gerada com sucesso',
      method: result.method,
      mpPaymentId: result.mpPaymentId,
      qrCode: result.qrCode,
      qrCodeBase64: result.qrCodeBase64,
      ticketUrl: result.ticketUrl,
      barcode: result.barcode,
      expiresAt: result.expiresAt,
      paymentId: result.paymentId,
      amount: result.amount,
      referenceMonth: result.referenceMonth,
      referenceYear: result.referenceYear,
      dueDate: result.dueDate,
      reused: result.reused,
    })
  } catch (error: any) {
    console.error('[MP] Erro ao cobrar sócio:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro ao gerar cobrança no Mercado Pago' },
      { status: 500 }
    )
  }
}
