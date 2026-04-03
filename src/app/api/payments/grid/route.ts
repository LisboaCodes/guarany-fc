import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/payments/grid?year=2026 - Full payment grid for all members
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const memberSearch = searchParams.get('search') || ''

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    // Get settings for membership value and due day
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'singleton' }
    })
    const membershipValue = settings ? Number(settings.membershipValue) : 50.00
    const dueDay = settings?.paymentDueDayOfMonth || 10

    // Get all active members
    const whereMembers: any = { active: true }
    if (memberSearch) {
      whereMembers.OR = [
        { name: { contains: memberSearch, mode: 'insensitive' } },
        { cpf: { contains: memberSearch.replace(/\D/g, '') } },
      ]
    }

    const members = await prisma.member.findMany({
      where: whereMembers,
      select: {
        id: true,
        name: true,
        cpf: true,
        phone: true,
        joinDate: true,
      },
      orderBy: { name: 'asc' }
    })

    // Get all payments for the selected year
    const payments = await prisma.payment.findMany({
      where: {
        referenceYear: year,
        memberId: { in: members.map(m => m.id) }
      },
      include: {
        registeredBy: {
          select: { name: true }
        }
      }
    })

    // Build a lookup: memberId -> month -> payment
    const paymentMap: Record<string, Record<number, any>> = {}
    for (const p of payments) {
      if (!paymentMap[p.memberId]) paymentMap[p.memberId] = {}
      paymentMap[p.memberId][p.referenceMonth] = p
    }

    // Build the full grid
    const grid: any[] = []

    for (const member of members) {
      const joinDate = new Date(member.joinDate)
      const joinMonth = joinDate.getMonth() + 1
      const joinYear = joinDate.getFullYear()

      // Determine which months to show for this member in this year
      const startMonth = (joinYear === year) ? joinMonth : 1
      const endMonth = (year === currentYear) ? currentMonth : (year < currentYear ? 12 : 0)

      if (endMonth === 0) continue // Future year, skip

      for (let month = startMonth; month <= endMonth; month++) {
        const existingPayment = paymentMap[member.id]?.[month]

        if (existingPayment) {
          grid.push({
            id: existingPayment.id,
            memberId: member.id,
            memberName: member.name,
            memberCpf: member.cpf,
            memberPhone: member.phone,
            referenceMonth: month,
            referenceYear: year,
            amount: Number(existingPayment.amount),
            method: existingPayment.method,
            status: existingPayment.status,
            dueDate: existingPayment.dueDate,
            paidAt: existingPayment.paidAt,
            notes: existingPayment.notes,
            registeredBy: existingPayment.registeredBy?.name || null,
            isVirtual: false,
          })
        } else {
          // Virtual entry - no payment record exists
          const dueDate = new Date(year, month - 1, dueDay)
          const isOverdue = dueDate < now

          grid.push({
            id: null,
            memberId: member.id,
            memberName: member.name,
            memberCpf: member.cpf,
            memberPhone: member.phone,
            referenceMonth: month,
            referenceYear: year,
            amount: membershipValue,
            method: null,
            status: isOverdue ? 'OVERDUE' : 'PENDING',
            dueDate: dueDate.toISOString(),
            paidAt: null,
            notes: null,
            registeredBy: null,
            isVirtual: true,
          })
        }
      }
    }

    // Sort: by member name, then month desc
    grid.sort((a, b) => {
      const nameCompare = a.memberName.localeCompare(b.memberName)
      if (nameCompare !== 0) return nameCompare
      return b.referenceMonth - a.referenceMonth
    })

    const response = NextResponse.json({
      grid,
      year,
      membershipValue,
      dueDay,
      totalMembers: members.length,
      totalEntries: grid.length,
    })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return response
  } catch (error) {
    console.error('Error building payment grid:', error)
    return NextResponse.json({ error: 'Erro ao carregar grade de pagamentos' }, { status: 500 })
  }
}
