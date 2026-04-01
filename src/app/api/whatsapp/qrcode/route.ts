import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/whatsapp/qrcode - Fetch QR code from Evolution API
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
      return NextResponse.json({ error: 'Evolution API nao configurada' }, { status: 400 })
    }

    const baseUrl = apiUrl.replace(/\/$/, '')

    // Try to get QR code (connect endpoint)
    const res = await fetch(`${baseUrl}/instance/connect/${instance}`, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
      },
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('[WhatsApp QR] Error:', res.status, errorText)

      // If instance doesn't exist, try to create it
      if (res.status === 404) {
        const createRes = await fetch(`${baseUrl}/instance/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': apiKey,
          },
          body: JSON.stringify({
            instanceName: instance,
            qrcode: true,
            integration: 'WHATSAPP-BAILEYS',
          }),
        })

        if (createRes.ok) {
          const createData = await createRes.json()
          return NextResponse.json({
            status: 'qrcode',
            qrcode: createData.qrcode?.base64 || createData.base64 || null,
            pairingCode: createData.qrcode?.pairingCode || null,
          })
        }

        return NextResponse.json({ error: 'Falha ao criar instancia' }, { status: 500 })
      }

      return NextResponse.json({ error: `Erro Evolution API: ${res.status}` }, { status: 500 })
    }

    const data = await res.json()

    return NextResponse.json({
      status: 'qrcode',
      qrcode: data.base64 || data.qrcode?.base64 || null,
      pairingCode: data.pairingCode || data.qrcode?.pairingCode || null,
    })
  } catch (error: any) {
    console.error('[WhatsApp QR] Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
