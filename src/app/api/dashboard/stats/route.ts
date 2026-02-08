import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear

    // 1. Total de Sócios Ativos
    const [activeMembersCount, lastMonthActiveMembersCount] = await Promise.all([
      prisma.member.count({ where: { active: true } }),
      prisma.member.count({
        where: {
          active: true,
          createdAt: { lt: new Date(currentYear, currentMonth - 1, 1) }
        }
      })
    ])

    const membersChange = lastMonthActiveMembersCount > 0
      ? (((activeMembersCount - lastMonthActiveMembersCount) / lastMonthActiveMembersCount) * 100).toFixed(1)
      : '0.0'

    // 2. Receita Mensal (pagamentos pagos do mês atual)
    const [currentMonthRevenue, lastMonthRevenue] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          status: 'PAID',
          referenceMonth: currentMonth,
          referenceYear: currentYear
        },
        _sum: { amount: true }
      }),
      prisma.payment.aggregate({
        where: {
          status: 'PAID',
          referenceMonth: lastMonth,
          referenceYear: lastMonthYear
        },
        _sum: { amount: true }
      })
    ])

    const currentRevenue = Number(currentMonthRevenue._sum.amount || 0)
    const lastRevenue = Number(lastMonthRevenue._sum.amount || 0)
    const revenueChange = lastRevenue > 0
      ? (((currentRevenue - lastRevenue) / lastRevenue) * 100).toFixed(1)
      : currentRevenue > 0 ? '100.0' : '0.0'

    // 3. Taxa de Pagamento (% de pagamentos pagos vs total esperado)
    const [paidPayments, totalExpectedPayments] = await Promise.all([
      prisma.payment.count({
        where: {
          referenceMonth: currentMonth,
          referenceYear: currentYear,
          status: 'PAID'
        }
      }),
      // Total esperado = número de sócios ativos
      prisma.member.count({ where: { active: true } })
    ])

    const paymentRate = totalExpectedPayments > 0
      ? ((paidPayments / totalExpectedPayments) * 100).toFixed(1)
      : '0.0'

    // Taxa do mês anterior para comparação
    const [lastMonthPaidPayments, lastMonthExpectedPayments] = await Promise.all([
      prisma.payment.count({
        where: {
          referenceMonth: lastMonth,
          referenceYear: lastMonthYear,
          status: 'PAID'
        }
      }),
      lastMonthActiveMembersCount
    ])

    const lastMonthPaymentRate = lastMonthExpectedPayments > 0
      ? (lastMonthPaidPayments / lastMonthExpectedPayments) * 100
      : 0

    const currentPaymentRate = parseFloat(paymentRate)
    const paymentRateChange = lastMonthPaymentRate > 0
      ? ((currentPaymentRate - lastMonthPaymentRate)).toFixed(1)
      : '0.0'

    // 4. Pagamentos Atrasados (OVERDUE ou PENDING com vencimento passado)
    const overdueCount = await prisma.payment.count({
      where: {
        OR: [
          { status: 'OVERDUE' },
          {
            status: 'PENDING',
            dueDate: { lt: now }
          }
        ]
      }
    })

    const lastMonthOverdueCount = await prisma.payment.count({
      where: {
        OR: [
          { status: 'OVERDUE' },
          {
            status: 'PENDING',
            dueDate: { lt: new Date(currentYear, currentMonth - 1, 1) }
          }
        ],
        referenceMonth: lastMonth,
        referenceYear: lastMonthYear
      }
    })

    const overdueChange = overdueCount - lastMonthOverdueCount

    // 5. Atividades Recentes (últimas ações de audit log)
    const recentActivities = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true }
        }
      }
    })

    const formattedActivities = recentActivities.map(log => {
      const timeDiff = now.getTime() - new Date(log.createdAt).getTime()
      const minutes = Math.floor(timeDiff / 60000)
      const hours = Math.floor(timeDiff / 3600000)
      const days = Math.floor(timeDiff / 86400000)

      let timeAgo = ''
      if (days > 0) timeAgo = `Há ${days} dia${days > 1 ? 's' : ''}`
      else if (hours > 0) timeAgo = `Há ${hours} hora${hours > 1 ? 's' : ''}`
      else if (minutes > 0) timeAgo = `Há ${minutes} minuto${minutes > 1 ? 's' : ''}`
      else timeAgo = 'Agora mesmo'

      const actionLabels: Record<string, string> = {
        CREATE_MEMBER: 'Novo sócio cadastrado',
        UPDATE_MEMBER: 'Sócio atualizado',
        DELETE_MEMBER: 'Sócio desativado',
        CREATE_PAYMENT: 'Pagamento registrado',
        UPDATE_PAYMENT: 'Pagamento atualizado',
        CANCEL_PAYMENT: 'Pagamento cancelado'
      }

      return {
        action: actionLabels[log.action] || log.action,
        user: log.user.name,
        time: timeAgo
      }
    })

    return NextResponse.json({
      stats: {
        activeMembers: {
          value: activeMembersCount,
          change: `${parseFloat(membersChange) >= 0 ? '+' : ''}${membersChange}%`,
          trend: parseFloat(membersChange) >= 0 ? 'up' : 'down'
        },
        monthlyRevenue: {
          value: currentRevenue,
          change: `${parseFloat(revenueChange) >= 0 ? '+' : ''}${revenueChange}%`,
          trend: parseFloat(revenueChange) >= 0 ? 'up' : 'down'
        },
        paymentRate: {
          value: parseFloat(paymentRate),
          change: `${parseFloat(paymentRateChange) >= 0 ? '+' : ''}${paymentRateChange}%`,
          trend: parseFloat(paymentRateChange) >= 0 ? 'up' : 'down'
        },
        overduePayments: {
          value: overdueCount,
          change: overdueChange,
          trend: overdueChange <= 0 ? 'up' : 'down' // Less overdue is good
        }
      },
      recentActivities: formattedActivities
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
}
