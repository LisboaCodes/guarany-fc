import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/payments - List payments with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')
    const status = searchParams.get('status')
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {}

    if (memberId) where.memberId = memberId
    if (status) where.status = status
    if (month) where.referenceMonth = parseInt(month)
    if (year) where.referenceYear = parseInt(year)

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { referenceYear: 'desc' },
          { referenceMonth: 'desc' }
        ],
        include: {
          member: {
            select: {
              id: true,
              name: true,
              cpf: true,
              phone: true
            }
          },
          registeredBy: {
            select: { name: true }
          }
        }
      }),
      prisma.payment.count({ where })
    ])

    return NextResponse.json({
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Erro ao buscar pagamentos' }, { status: 500 })
  }
}

// POST /api/payments - Register new payment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()
    const {
      memberId,
      amount,
      method,
      status,
      referenceMonth,
      referenceYear,
      dueDate,
      paidAt,
      notes
    } = data

    // Validations
    if (!memberId || !amount || !method || !referenceMonth || !referenceYear || !dueDate) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    // Check if payment already exists for this month/year
    const existingPayment = await prisma.payment.findUnique({
      where: {
        memberId_referenceMonth_referenceYear: {
          memberId,
          referenceMonth: parseInt(referenceMonth),
          referenceYear: parseInt(referenceYear)
        }
      }
    })

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Já existe pagamento registrado para este mês/ano' },
        { status: 400 }
      )
    }

    const payment = await prisma.payment.create({
      data: {
        memberId,
        amount: parseFloat(amount),
        method,
        status: status || 'PENDING',
        referenceMonth: parseInt(referenceMonth),
        referenceYear: parseInt(referenceYear),
        dueDate: new Date(dueDate),
        paidAt: paidAt ? new Date(paidAt) : null,
        notes: notes || null,
        registeredById: session.user.id
      },
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
        action: 'CREATE_PAYMENT',
        entityType: 'Payment',
        entityId: payment.id,
        changes: { data: payment },
        userId: session.user.id
      }
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error: any) {
    console.error('Error creating payment:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe pagamento registrado para este mês/ano' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar pagamento' },
      { status: 500 }
    )
  }
}
