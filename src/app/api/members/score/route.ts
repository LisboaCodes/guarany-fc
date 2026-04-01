import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/members/score - Score de inadimplencia de todos os membros
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const members = await prisma.member.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        cpf: true,
        phone: true,
        joinDate: true,
        payments: {
          select: {
            status: true,
            referenceMonth: true,
            referenceYear: true,
            dueDate: true,
            paidAt: true,
          },
          orderBy: [
            { referenceYear: 'desc' },
            { referenceMonth: 'desc' }
          ]
        }
      },
      orderBy: { name: 'asc' }
    })

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    const scores = members.map(member => {
      const payments = member.payments
      const totalPayments = payments.length

      // Count statuses
      const paid = payments.filter(p => p.status === 'PAID').length
      const overdue = payments.filter(p => p.status === 'OVERDUE').length
      const pending = payments.filter(p => p.status === 'PENDING').length
      const cancelled = payments.filter(p => p.status === 'CANCELLED').length

      // Calculate months since join
      const joinDate = new Date(member.joinDate)
      const joinMonth = joinDate.getMonth() + 1
      const joinYear = joinDate.getFullYear()
      const monthsSinceJoin = (currentYear - joinYear) * 12 + (currentMonth - joinMonth) + 1

      // Expected payments = months since join (capped at actual months)
      const expectedPayments = Math.max(monthsSinceJoin, 0)

      // Missing payments (expected - actual records, not counting cancelled)
      const activePayments = totalPayments - cancelled
      const missingPayments = Math.max(expectedPayments - activePayments, 0)

      // Late payment rate (how many were/are overdue vs total expected)
      const lateCount = overdue + missingPayments
      const lateRate = expectedPayments > 0 ? lateCount / expectedPayments : 0

      // Payment regularity (paid on time vs total)
      const onTimeRate = expectedPayments > 0 ? paid / expectedPayments : 0

      // Calculate score (0-100, higher = better)
      let score = 100

      // Deduct for overdue payments (-15 each)
      score -= overdue * 15

      // Deduct for missing payments (-20 each)
      score -= missingPayments * 20

      // Deduct for pending (-5 each)
      score -= pending * 5

      // Bonus for consistent payments (+2 each paid)
      score += paid * 2

      // Cap between 0 and 100
      score = Math.max(0, Math.min(100, score))

      // Classify
      let classification: string
      let risk: string
      if (score >= 70) {
        classification = 'Bom Pagador'
        risk = 'LOW'
      } else if (score >= 40) {
        classification = 'Risco Medio'
        risk = 'MEDIUM'
      } else {
        classification = 'Alto Risco'
        risk = 'HIGH'
      }

      // Consecutive payments streak
      let streak = 0
      for (const p of payments) {
        if (p.status === 'PAID') streak++
        else break
      }

      return {
        memberId: member.id,
        memberName: member.name,
        memberCpf: member.cpf,
        memberPhone: member.phone,
        joinDate: member.joinDate,
        score,
        classification,
        risk,
        stats: {
          totalPayments,
          paid,
          overdue,
          pending,
          cancelled,
          missing: missingPayments,
          expectedPayments,
          onTimeRate: Math.round(onTimeRate * 100),
          lateRate: Math.round(lateRate * 100),
          consecutivePaid: streak,
          monthsSinceJoin,
        }
      }
    })

    // Sort by score ascending (worst first)
    scores.sort((a, b) => a.score - b.score)

    // Summary
    const summary = {
      total: scores.length,
      goodPayers: scores.filter(s => s.risk === 'LOW').length,
      mediumRisk: scores.filter(s => s.risk === 'MEDIUM').length,
      highRisk: scores.filter(s => s.risk === 'HIGH').length,
      averageScore: scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
        : 0,
    }

    return NextResponse.json({ scores, summary })
  } catch (error) {
    console.error('Error calculating scores:', error)
    return NextResponse.json({ error: 'Erro ao calcular scores' }, { status: 500 })
  }
}
