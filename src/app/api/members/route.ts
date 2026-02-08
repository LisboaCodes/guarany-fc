import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/members - List all members with optional filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const active = searchParams.get('active')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search } },
        { phone: { contains: search } },
      ]
    }

    if (active !== null && active !== undefined) {
      where.active = active === 'true'
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { name: true }
          },
          payments: {
            where: { status: 'PENDING' },
            select: { id: true }
          }
        }
      }),
      prisma.member.count({ where })
    ])

    return NextResponse.json({
      members,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json({ error: 'Erro ao buscar sócios' }, { status: 500 })
  }
}

// POST /api/members - Create new member
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()
    const { name, cpf, birthDate, phone, email, address } = data

    // Validations
    if (!name || !cpf || !birthDate || !phone) {
      return NextResponse.json(
        { error: 'Nome, CPF, data de nascimento e telefone são obrigatórios' },
        { status: 400 }
      )
    }

    // Check if CPF already exists
    const existingMember = await prisma.member.findUnique({
      where: { cpf }
    })

    if (existingMember) {
      return NextResponse.json(
        { error: 'CPF já cadastrado' },
        { status: 400 }
      )
    }

    const member = await prisma.member.create({
      data: {
        name,
        cpf,
        birthDate: new Date(birthDate),
        phone,
        email: email || null,
        address: address || null,
        createdById: session.user.id
      },
      include: {
        createdBy: {
          select: { name: true }
        }
      }
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: 'CREATE_MEMBER',
        entityType: 'Member',
        entityId: member.id,
        changes: { data: member },
        userId: session.user.id
      }
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error: any) {
    console.error('Error creating member:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'CPF já cadastrado' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao criar sócio' },
      { status: 500 }
    )
  }
}
