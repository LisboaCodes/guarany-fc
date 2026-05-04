import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getMpPayment, mapMpStatusToInternal, verifyWebhookSignature } from '@/lib/mercadopago'
import { sendPaymentNotification } from '@/lib/whatsapp'

// POST /api/webhooks/mercadopago - Recebe notificacoes do Mercado Pago
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { searchParams } = new URL(request.url)

    const topic = body.type || body.topic || searchParams.get('type') || searchParams.get('topic')
    const dataId =
      body.data?.id?.toString() ||
      searchParams.get('data.id') ||
      searchParams.get('id')

    if (!dataId) {
      return NextResponse.json({ received: true, ignored: 'no data.id' })
    }

    if (topic && !['payment', 'payment.updated', 'payment.created'].includes(topic)) {
      return NextResponse.json({ received: true, ignored: `topic ${topic}` })
    }

    const signatureHeader = request.headers.get('x-signature')
    const requestId = request.headers.get('x-request-id')

    const validSignature = await verifyWebhookSignature(signatureHeader, requestId, dataId)
    if (!validSignature) {
      console.warn('[MP Webhook] Assinatura inválida')
      return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
    }

    let mpPayment: any
    try {
      mpPayment = await getMpPayment(dataId)
    } catch (fetchErr: any) {
      // Pagamento não existe no MP (simulação do painel envia id 123456,
      // ou pagamento foi excluído). Responde 200 para o MP não retentar
      // e o simulador não marcar como falha.
      console.warn(`[MP Webhook] getMpPayment falhou para ${dataId}:`, fetchErr?.message || fetchErr)
      return NextResponse.json({
        received: true,
        ignored: 'payment not found in mercadopago',
        dataId,
      })
    }

    const externalReference = mpPayment.external_reference
    const mpStatus = mpPayment.status || 'pending'

    const payment = externalReference
      ? await prisma.payment.findUnique({ where: { id: externalReference } })
      : await prisma.payment.findUnique({ where: { mpPaymentId: dataId } })

    if (!payment) {
      console.warn(`[MP Webhook] Payment não encontrado para ${dataId} (ref=${externalReference})`)
      return NextResponse.json({ received: true, ignored: 'payment not found' })
    }

    const internalStatus = mapMpStatusToInternal(mpStatus)
    const previousStatus = payment.status

    const updateData: any = {
      mpStatus,
      mpPaymentId: String(dataId),
    }

    if (internalStatus === 'PAID' && payment.status !== 'PAID') {
      updateData.status = 'PAID'
      updateData.paidAt = mpPayment.date_approved ? new Date(mpPayment.date_approved) : new Date()
    } else if (internalStatus === 'CANCELLED' && payment.status !== 'PAID') {
      updateData.status = 'CANCELLED'
    }

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: updateData,
      include: { member: true },
    })

    await prisma.auditLog.create({
      data: {
        action: 'MP_WEBHOOK',
        entityType: 'Payment',
        entityId: payment.id,
        changes: { mpPaymentId: dataId, mpStatus, previousStatus, newStatus: updated.status },
        userId: payment.registeredById,
      },
    })

    if (internalStatus === 'PAID' && previousStatus !== 'PAID' && updated.member.phone) {
      sendPaymentNotification(
        { id: updated.member.id, name: updated.member.name, phone: updated.member.phone },
        {
          amount: Number(updated.amount),
          referenceMonth: updated.referenceMonth,
          referenceYear: updated.referenceYear,
          status: 'PAID',
          dueDate: updated.dueDate,
        },
      ).catch(err => console.error('[MP Webhook] Erro ao notificar pagamento:', err))
    }

    return NextResponse.json({ received: true, status: updated.status })
  } catch (error: any) {
    console.error('[MP Webhook] Erro:', error)
    return NextResponse.json({ error: error?.message || 'webhook error' }, { status: 500 })
  }
}

// GET para verificacao de healthcheck do MP
export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'mercadopago webhook' })
}
