import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/whatsapp/disconnect - Disconnect WhatsApp instance
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 })
    }

    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'singleton' }
    })

    const apiUrl = settings?.evolutionApiUrl || process.env.EVOLUTION_API_URL
    const apiKey = settings?.evolutionApiKey || process.env.EVOLUTION_API_KEY
    const instance = settings?.evolutionInstance || process.env.EVOLUTION_INSTANCE

    if (!apiUrl || !apiKey || !instance) {
      return NextResponse.json({ error: 'Evolution API nao configurada' }, { status: 400 })
    }

    const baseUrl = apiUrl.replace(/\/$/, '')

    const res = await fetch(`${baseUrl}/instance/logout/${instance}`, {
      method: 'DELETE',
      headers: {
        'apikey': apiKey,
      },
    })

    if (!res.ok) {
      const errorText = await res.text()
      return NextResponse.json({ error: `Erro: ${errorText}` }, { status: 500 })
    }

    await prisma.auditLog.create({
      data: {
        action: 'WHATSAPP_DISCONNECT',
        entityType: 'WhatsApp',
        entityId: instance,
        changes: { instance },
        userId: session.user.id,
      }
    })

    return NextResponse.json({ success: true, message: 'WhatsApp desconectado' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
