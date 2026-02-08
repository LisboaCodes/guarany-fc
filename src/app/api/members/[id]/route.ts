import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/members/[id] - Get single member
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const member = await prisma.member.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: { name: true, email: true }
        },
        payments: {
          orderBy: { referenceYear: 'desc' },
          include: {
            registeredBy: {
              select: { name: true }
            }
          }
        }
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Sócio não encontrado' }, { status: 404 })
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error fetching member:', error)
    return NextResponse.json({ error: 'Erro ao buscar sócio' }, { status: 500 })
  }
}

// PUT /api/members/[id] - Update member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()
    const { name, cpf, birthDate, phone, email, address, active } = data

    // Get current member for audit log
    const currentMember = await prisma.member.findUnique({
      where: { id: params.id }
    })

    if (!currentMember) {
      return NextResponse.json({ error: 'Sócio não encontrado' }, { status: 404 })
    }

    // Check if CPF is being changed and if it's already in use
    if (cpf && cpf !== currentMember.cpf) {
      const existingMember = await prisma.member.findUnique({
        where: { cpf }
      })

      if (existingMember) {
        return NextResponse.json(
          { error: 'CPF já cadastrado' },
          { status: 400 }
        )
      }
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (cpf) updateData.cpf = cpf
    if (birthDate) updateData.birthDate = new Date(birthDate)
    if (phone) updateData.phone = phone
    if (email !== undefined) updateData.email = email || null
    if (address !== undefined) updateData.address = address || null
    if (active !== undefined) updateData.active = active

    const member = await prisma.member.update({
      where: { id: params.id },
      data: updateData,
      include: {
        createdBy: {
          select: { name: true }
        }
      }
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_MEMBER',
        entityType: 'Member',
        entityId: member.id,
        changes: {
          before: currentMember,
          after: member
        },
        userId: session.user.id
      }
    })

    return NextResponse.json(member)
  } catch (error: any) {
    console.error('Error updating member:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'CPF já cadastrado' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar sócio' },
      { status: 500 }
    )
  }
}

// DELETE /api/members/[id] - Delete member (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const member = await prisma.member.findUnique({
      where: { id: params.id }
    })

    if (!member) {
      return NextResponse.json({ error: 'Sócio não encontrado' }, { status: 404 })
    }

    // Soft delete by setting active to false
    const updatedMember = await prisma.member.update({
      where: { id: params.id },
      data: { active: false }
    })

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: 'DELETE_MEMBER',
        entityType: 'Member',
        entityId: member.id,
        changes: { member },
        userId: session.user.id
      }
    })

    return NextResponse.json({ message: 'Sócio desativado com sucesso', member: updatedMember })
  } catch (error) {
    console.error('Error deleting member:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar sócio' },
      { status: 500 }
    )
  }
}
