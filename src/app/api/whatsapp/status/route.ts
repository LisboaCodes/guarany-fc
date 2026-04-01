import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/whatsapp/status - Check WhatsApp connection status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'singleton' }
    })

    const apiUrl = settings?.evolutionApiUrl || process.env.EVOLUTION_API_URL
    const apiKey = settings?.evolutionApiKey || process.env.EVOLUTION_API_KEY
    const instance = settings?.evolutionInstance || process.env.EVOLUTION_INSTANCE

    if (!apiUrl || !apiKey || !instance) {
      return NextResponse.json({
        connected: false,
        state: 'not_configured',
        message: 'Evolution API nao configurada',
      })
    }

    const baseUrl = apiUrl.replace(/\/$/, '')

    const res = await fetch(`${baseUrl}/instance/connectionState/${instance}`, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
      },
    })

    if (!res.ok) {
      return NextResponse.json({
        connected: false,
        state: 'error',
        message: `Erro ao verificar: ${res.status}`,
      })
    }

    const data = await res.json()
    const state = data.instance?.state || data.state || 'unknown'
    const connected = state === 'open' || state === 'connected'

    return NextResponse.json({
      connected,
      state,
      instance: data.instance?.instanceName || instance,
    })
  } catch (error: any) {
    console.error('[WhatsApp Status] Error:', error.message)
    return NextResponse.json({
      connected: false,
      state: 'error',
      message: error.message,
    })
  }
}
