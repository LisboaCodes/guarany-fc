import { NextRequest, NextResponse } from 'next/server'
import { checkAndSendBirthdayMessages, checkAndSendPaymentReminders } from '@/lib/whatsapp'

// GET /api/cron - Run daily checks (birthday + payment reminders)
// Call this endpoint daily via external cron (e.g., cron-job.org)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[Cron] Iniciando verificações diárias...')

    await checkAndSendBirthdayMessages()
    await checkAndSendPaymentReminders()

    console.log('[Cron] Verificações concluídas!')

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Verificações de aniversário e pagamentos concluídas'
    })
  } catch (error: any) {
    console.error('[Cron] Erro:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
