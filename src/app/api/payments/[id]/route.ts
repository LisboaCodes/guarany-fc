import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PUT /api/payments/[id] - Update payment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()
    const { amount, method, status, dueDate, paidAt, notes } = data

    // Get current payment for audit log
    const currentPayment = await prisma.payment.findUnique({
      where: { id }
    })

    if (!currentPayment) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })
    }

    const updateData: any = {}
    if (amount !== undefined) updateData.amount = parseFloat(amount)
    if (method) updateData.method = method
    if (status) updateData.status = status
    if (dueDate) updateData.dueDate = new Date(dueDate)
    if (paidAt !== undefined) updateData.paidAt = paidAt ? new Date(paidAt) : null
    if (notes !== undefined) updateData.notes = notes || null

    // If marking as paid and no paidAt date, set it to now
    if (status === 'PAID' && !paidAt && !currentPayment.paidAt) {
      updateData.paidAt = new Date()
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        member: {
          select: { name: true }
        },
        registeredBy: {
          select: { name: true }
        }
      }
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_PAYMENT',
        entityType: 'Payment',
        entityId: payment.id,
        changes: {
          before: currentPayment,
          after: payment
        },
        userId: session.user.id
      }
    })

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar pagamento' },
      { status: 500 }
    )
  }
}

// DELETE /api/payments/[id] - Cancel payment
export async function DELETE(
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
      where: { id }
    })

    if (!payment) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 })
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: { status: 'CANCELLED' }
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: 'CANCEL_PAYMENT',
        entityType: 'Payment',
        entityId: payment.id,
        changes: { payment },
        userId: session.user.id
      }
    })

    return NextResponse.json({
      message: 'Pagamento cancelado com sucesso',
      payment: updatedPayment
    })
  } catch (error) {
    console.error('Error cancelling payment:', error)
    return NextResponse.json(
      { error: 'Erro ao cancelar pagamento' },
      { status: 500 }
    )
  }
}
