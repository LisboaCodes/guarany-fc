import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    const { id } = await params
    const { name, email, password, role, active } = await request.json()

    // Only SUPER_ADMIN can change roles to ADMIN/SUPER_ADMIN
    if (['ADMIN', 'SUPER_ADMIN'].includes(role) && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Apenas Super Admin pode definir este nivel' }, { status: 403 })
    }

    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (role) updateData.role = role
    if (active !== undefined) updateData.active = active
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      }
    })

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_USER',
        entityType: 'User',
        entityId: user.id,
        changes: { ...updateData, password: password ? '[REDACTED]' : undefined },
        userId: session.user.id,
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Erro ao atualizar usuario' }, { status: 500 })
  }
}
