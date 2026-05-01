import { prisma } from './prisma'

interface SendMessageParams {
  phone: string
  message: string
  memberId?: string
  type: 'BIRTHDAY' | 'PAYMENT_REMINDER' | 'PAYMENT_OVERDUE' | 'WELCOME'
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('55')) return digits
  return `55${digits}`
}

async function getEvolutionConfig() {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 'singleton' }
  })

  const apiUrl = settings?.evolutionApiUrl || process.env.EVOLUTION_API_URL
  const apiKey = settings?.evolutionApiKey || process.env.EVOLUTION_API_KEY
  const instance = settings?.evolutionInstance || process.env.EVOLUTION_INSTANCE

  if (!apiUrl || !apiKey || !instance) {
    throw new Error('Evolution API não configurada')
  }

  return { apiUrl: apiUrl.replace(/\/$/, ''), apiKey, instance }
}

export async function sendWhatsAppMessage({ phone, message, memberId, type }: SendMessageParams) {
  const log = await prisma.notificationLog.create({
    data: {
      type,
      status: 'PENDING',
      message,
      phone,
      memberId: memberId || null,
    }
  })

  try {
    const { apiUrl, apiKey, instance } = await getEvolutionConfig()
    const formattedPhone = formatPhone(phone)

    const res = await fetch(`${apiUrl}/message/sendText/${instance}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: JSON.stringify({
        number: formattedPhone,
        text: message,
      })
    })

    if (!res.ok) {
      const errorData = await res.text()
      throw new Error(`Evolution API error ${res.status}: ${errorData}`)
    }

    await prisma.notificationLog.update({
      where: { id: log.id },
      data: { status: 'SENT', sentAt: new Date() }
    })

    console.log(`[WhatsApp] ${type} enviado para ${formattedPhone}`)
    return { success: true, logId: log.id }
  } catch (error: any) {
    console.error(`[WhatsApp] Erro ao enviar ${type}:`, error.message)

    await prisma.notificationLog.update({
      where: { id: log.id },
      data: { status: 'FAILED', errorMessage: error.message }
    })

    return { success: false, error: error.message, logId: log.id }
  }
}

export async function sendPaymentNotification(
  member: { id: string; name: string; phone: string },
  payment: { amount: number; referenceMonth: number; referenceYear: number; status: string; dueDate: Date }
) {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  const monthName = months[payment.referenceMonth - 1]
  const dueFormatted = payment.dueDate.toLocaleDateString('pt-BR')
  const amount = Number(payment.amount).toFixed(2).replace('.', ',')

  let message: string
  let type: SendMessageParams['type']

  if (payment.status === 'PAID') {
    type = 'PAYMENT_REMINDER'
    message = `✅ *Pagamento Confirmado!*\n\nOlá, *${member.name}*!\n\nSeu pagamento da mensalidade de *${monthName}/${payment.referenceYear}* no valor de *R$ ${amount}* foi registrado com sucesso.\n\nObrigado por ser Sócio Torcedor! 🟢⚪⚽\n_AA Guarany FC_`
  } else {
    type = 'PAYMENT_REMINDER'
    message = `📋 *Cobrança de Mensalidade*\n\nOlá, *${member.name}*!\n\nSua mensalidade de *${monthName}/${payment.referenceYear}* no valor de *R$ ${amount}* está com vencimento em *${dueFormatted}*.\n\nContamos com você! 🟢⚪⚽\n_AA Guarany FC_`
  }

  return sendWhatsAppMessage({
    phone: member.phone,
    message,
    memberId: member.id,
    type,
  })
}

export async function sendPixChargeMessage(
  member: { id: string; name: string; phone: string },
  payment: { amount: number; referenceMonth: number; referenceYear: number; dueDate: Date },
  pix: { qrCode: string; ticketUrl: string | null },
) {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  const monthName = months[payment.referenceMonth - 1]
  const amount = Number(payment.amount).toFixed(2).replace('.', ',')
  const dueFormatted = payment.dueDate.toLocaleDateString('pt-BR')

  const ticketLine = pix.ticketUrl ? `\n\n🔗 Ou pague pelo link:\n${pix.ticketUrl}` : ''

  const message = `💚 *Cobrança PIX — AA Guarany FC*\n\nOlá, *${member.name}*!\n\nSegue o PIX da sua mensalidade de *${monthName}/${payment.referenceYear}*.\n\n💰 Valor: *R$ ${amount}*\n📅 Vencimento: ${dueFormatted}\n\n*Copia e cola PIX:*\n\`\`\`${pix.qrCode}\`\`\`${ticketLine}\n\n_Após o pagamento a confirmação é automática._\n\n🟢⚪⚽ _AA Guarany FC_`

  return sendWhatsAppMessage({
    phone: member.phone,
    message,
    memberId: member.id,
    type: 'PAYMENT_REMINDER',
  })
}

export async function sendBoletoChargeMessage(
  member: { id: string; name: string; phone: string },
  payment: { amount: number; referenceMonth: number; referenceYear: number; dueDate: Date },
  boleto: { ticketUrl: string; barcode: string | null },
) {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  const monthName = months[payment.referenceMonth - 1]
  const amount = Number(payment.amount).toFixed(2).replace('.', ',')
  const dueFormatted = payment.dueDate.toLocaleDateString('pt-BR')
  const barcodeLine = boleto.barcode ? `\n\n*Código de barras:*\n\`\`\`${boleto.barcode}\`\`\`` : ''

  const message = `📄 *Boleto — AA Guarany FC*\n\nOlá, *${member.name}*!\n\nSegue o boleto da sua mensalidade de *${monthName}/${payment.referenceYear}*.\n\n💰 Valor: *R$ ${amount}*\n📅 Vencimento: ${dueFormatted}\n\n🔗 Acesse o boleto:\n${boleto.ticketUrl}${barcodeLine}\n\n_A confirmação do pagamento é automática (1-2 dias úteis)._\n\n🟢⚪⚽ _AA Guarany FC_`

  return sendWhatsAppMessage({
    phone: member.phone,
    message,
    memberId: member.id,
    type: 'PAYMENT_REMINDER',
  })
}

export async function sendBirthdayMessage(member: { id: string; name: string; phone: string }) {
  const message = `🎉 *Feliz Aniversário, ${member.name}!* 🎂\n\nToda a família *AA Guarany FC* deseja a você um dia muito especial! 🟢⚪\n\nObrigado por fazer parte do nosso time! ⚽\n\nUm grande abraço!\n_Diretoria AA Guarany FC_`

  return sendWhatsAppMessage({
    phone: member.phone,
    message,
    memberId: member.id,
    type: 'BIRTHDAY',
  })
}

export async function checkAndSendBirthdayMessages() {
  try {
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'singleton' }
    })

    if (!settings?.birthdayMessageEnabled) {
      console.log('[Birthday] Mensagens de aniversário desativadas')
      return
    }

    const today = new Date()
    const currentDay = today.getDate()
    const currentMonth = today.getMonth() + 1

    const members = await prisma.member.findMany({
      where: {
        active: true,
      }
    })

    const birthdayMembers = members.filter(m => {
      const bd = new Date(m.birthDate)
      return bd.getDate() === currentDay && (bd.getMonth() + 1) === currentMonth
    })

    console.log(`[Birthday] ${birthdayMembers.length} aniversariante(s) hoje`)

    for (const member of birthdayMembers) {
      const alreadySent = await prisma.notificationLog.findFirst({
        where: {
          memberId: member.id,
          type: 'BIRTHDAY',
          status: 'SENT',
          createdAt: {
            gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          }
        }
      })

      if (alreadySent) {
        console.log(`[Birthday] Já enviado para ${member.name} hoje`)
        continue
      }

      await sendBirthdayMessage(member)
    }
  } catch (error) {
    console.error('[Birthday] Erro ao processar aniversários:', error)
  }
}

export async function checkAndSendPaymentReminders() {
  try {
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'singleton' }
    })

    if (!settings?.reminderMessageEnabled) {
      console.log('[Reminder] Lembretes de pagamento desativados')
      return
    }

    const today = new Date()
    const reminderDate = new Date(today)
    reminderDate.setDate(reminderDate.getDate() + (settings.reminderDaysBeforeDue || 5))

    const pendingPayments = await prisma.payment.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lte: reminderDate,
          gte: today,
        }
      },
      include: {
        member: {
          select: { id: true, name: true, phone: true }
        }
      }
    })

    console.log(`[Reminder] ${pendingPayments.length} pagamento(s) próximo(s) do vencimento`)

    for (const payment of pendingPayments) {
      const alreadySent = await prisma.notificationLog.findFirst({
        where: {
          memberId: payment.member.id,
          type: 'PAYMENT_REMINDER',
          status: 'SENT',
          createdAt: {
            gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          }
        }
      })

      if (alreadySent) continue

      await sendPaymentNotification(payment.member, {
        amount: Number(payment.amount),
        referenceMonth: payment.referenceMonth,
        referenceYear: payment.referenceYear,
        status: 'PENDING',
        dueDate: payment.dueDate,
      })
    }

    // Check overdue
    const overduePayments = await prisma.payment.findMany({
      where: {
        status: 'PENDING',
        dueDate: { lt: today }
      },
      include: {
        member: {
          select: { id: true, name: true, phone: true }
        }
      }
    })

    for (const payment of overduePayments) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'OVERDUE' }
      })

      const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ]
      const amount = Number(payment.amount).toFixed(2).replace('.', ',')

      await sendWhatsAppMessage({
        phone: payment.member.phone,
        message: `⚠️ *Pagamento em Atraso*\n\nOlá, *${payment.member.name}*!\n\nSua mensalidade de *${months[payment.referenceMonth - 1]}/${payment.referenceYear}* no valor de *R$ ${amount}* está vencida.\n\nPor favor, regularize sua situação para continuar aproveitando os benefícios do Sócio Torcedor! 🟢⚪\n\n_AA Guarany FC_`,
        memberId: payment.member.id,
        type: 'PAYMENT_OVERDUE',
      })
    }
  } catch (error) {
    console.error('[Reminder] Erro ao processar lembretes:', error)
  }
}
