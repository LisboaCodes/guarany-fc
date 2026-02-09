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

    // Get filter from query params (default: 30 days)
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const now = new Date()
    const filterDate = new Date()
    filterDate.setDate(filterDate.getDate() - days)

    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    // 1. Active Members
    const activeMembersCount = await prisma.member.count({
      where: { active: true }
    })

    const lastMonthActiveMembersCount = await prisma.member.count({
      where: {
        active: true,
        createdAt: {
          lt: new Date(currentYear, currentMonth - 1, 1)
        }
      }
    })

    const membersChange = lastMonthActiveMembersCount === 0
      ? '0'
      : (((activeMembersCount - lastMonthActiveMembersCount) / lastMonthActiveMembersCount) * 100).toFixed(1)

    // 2. Monthly Revenue
    const currentMonthRevenue = await prisma.payment.aggregate({
      where: {
        status: 'PAID',
        referenceMonth: currentMonth,
        referenceYear: currentYear
      },
      _sum: { amount: true }
    })

    const lastMonthRevenue = await prisma.payment.aggregate({
      where: {
        status: 'PAID',
        referenceMonth: currentMonth === 1 ? 12 : currentMonth - 1,
        referenceYear: currentMonth === 1 ? currentYear - 1 : currentYear
      },
      _sum: { amount: true }
    })

    const currentRevenue = currentMonthRevenue._sum.amount?.toNumber() || 0
    const lastRevenue = lastMonthRevenue._sum.amount?.toNumber() || 0

    const revenueChange = lastRevenue === 0
      ? '0'
      : (((currentRevenue - lastRevenue) / lastRevenue) * 100).toFixed(1)

    // 3. Payment Rate
    const totalActiveMembers = activeMembersCount
    const paidPaymentsCount = await prisma.payment.count({
      where: {
        status: 'PAID',
        referenceMonth: currentMonth,
        referenceYear: currentYear
      }
    })

    const paymentRate = totalActiveMembers === 0
      ? '0'
      : ((paidPaymentsCount / totalActiveMembers) * 100).toFixed(1)

    // Last month payment rate
    const lastMonthPaidPayments = await prisma.payment.count({
      where: {
        status: 'PAID',
        referenceMonth: currentMonth === 1 ? 12 : currentMonth - 1,
        referenceYear: currentMonth === 1 ? currentYear - 1 : currentYear
      }
    })

    const lastMonthRate = lastMonthActiveMembersCount === 0
      ? 0
      : (lastMonthPaidPayments / lastMonthActiveMembersCount) * 100

    const paymentRateChange = lastMonthRate === 0
      ? '0'
      : (((parseFloat(paymentRate) - lastMonthRate) / lastMonthRate) * 100).toFixed(1)

    // 4. Overdue Payments
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

    const lastWeekOverdueCount = await prisma.payment.count({
      where: {
        OR: [
          { status: 'OVERDUE' },
          {
            status: 'PENDING',
            dueDate: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        ]
      }
    })

    const overdueChange = overdueCount - lastWeekOverdueCount

    // 5. Recent Activities (with filter)
    const recentActivities = await prisma.auditLog.findMany({
      where: {
        createdAt: { gte: filterDate }
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true }
        }
      }
    })

    // Format activities with member names
    const formattedActivities = await Promise.all(
      recentActivities.map(async (log) => {
        const timeDiff = now.getTime() - new Date(log.createdAt).getTime()
        const minutes = Math.floor(timeDiff / 60000)
        const hours = Math.floor(timeDiff / 3600000)
        const days = Math.floor(timeDiff / 86400000)

        let timeAgo = ''
        if (days > 0) timeAgo = `Há ${days} dia${days > 1 ? 's' : ''}`
        else if (hours > 0) timeAgo = `Há ${hours} hora${hours > 1 ? 's' : ''}`
        else if (minutes > 0) timeAgo = `Há ${minutes} minuto${minutes > 1 ? 's' : ''}`
        else timeAgo = 'Agora mesmo'

        // Get member name if action is related to member
        let displayName = log.user.name
        let description = ''

        if (log.action === 'CREATE' && log.entityType === 'Member' && log.entityId) {
          try {
            const member = await prisma.member.findUnique({
              where: { id: log.entityId },
              select: { name: true }
            })
            if (member) {
              displayName = member.name
              description = 'Novo sócio cadastrado'
            }
          } catch (e) {
            // If member not found, use default
            description = 'Novo sócio cadastrado'
          }
        } else {
          // Map all actions to Portuguese
          const actionMap: Record<string, Record<string, string>> = {
            'CREATE': {
              'Member': 'Novo sócio cadastrado',
              'Payment': 'Novo pagamento registrado',
              'User': 'Novo usuário criado'
            },
            'UPDATE': {
              'Member': 'Sócio atualizado',
              'Payment': 'Pagamento atualizado',
              'User': 'Usuário atualizado',
              'SystemSettings': 'Configurações atualizadas'
            },
            'DELETE': {
              'Member': 'Sócio removido',
              'Payment': 'Pagamento excluído',
              'User': 'Usuário removido'
            },
            'UPDATE_PASSWORD': {
              'User': 'Senha alterada'
            }
          }

          // Get description from map
          if (actionMap[log.action] && actionMap[log.action][log.entityType]) {
            description = actionMap[log.action][log.entityType]
          } else {
            // Fallback to generic description
            const actionTranslation: Record<string, string> = {
              'CREATE': 'Criado',
              'UPDATE': 'Atualizado',
              'DELETE': 'Excluído',
              'CANCEL': 'Cancelado'
            }
            const entityTranslation: Record<string, string> = {
              'Member': 'Sócio',
              'Payment': 'Pagamento',
              'User': 'Usuário',
              'SystemSettings': 'Configurações'
            }
            const actionText = actionTranslation[log.action] || log.action
            const entityText = entityTranslation[log.entityType] || log.entityType
            description = `${entityText} ${actionText.toLowerCase()}`
          }
        }

        return {
          action: description,
          user: displayName,
          time: timeAgo,
          entityType: log.entityType,
          createdAt: log.createdAt
        }
      })
    )

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
          trend: overdueChange <= 0 ? 'up' : 'down'
        }
      },
      recentActivities: formattedActivities,
      filterDays: days
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
}
