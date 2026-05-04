import { prisma } from './prisma'
import { createPixCharge, createBoletoCharge } from './mercadopago'
import { sendPixChargeMessage, sendBoletoChargeMessage } from './whatsapp'

export type ChargeMethod = 'PIX' | 'BOLETO'

export interface BoletoAddress {
  zipCode: string
  streetName: string
  streetNumber: string
  neighborhood: string
  city: string
  federalUnit: string
}

export interface MemberChargeOptions {
  memberId: string
  method?: ChargeMethod
  referenceMonth?: number
  referenceYear?: number
  amount?: number
  dueDate?: Date
  registeredById: string
  notifyWhatsApp?: boolean
  // Quando true, ignora cobrança existente e gera nova no MP.
  // Use para acionamento manual; o cron deixa false para nao duplicar.
  force?: boolean
  // Obrigatorio quando method=BOLETO (MP exige endereco estruturado).
  address?: BoletoAddress
}

export interface MemberChargeResult {
  paymentId: string
  method: ChargeMethod
  reused: boolean
  mpPaymentId: string
  qrCode: string | null
  qrCodeBase64: string | null
  ticketUrl: string | null
  barcode: string | null
  expiresAt: Date | null
  amount: number
  referenceMonth: number
  referenceYear: number
  dueDate: Date
}

export async function chargeMember(opts: MemberChargeOptions): Promise<MemberChargeResult> {
  const member = await prisma.member.findUnique({ where: { id: opts.memberId } })
  if (!member) throw new Error('Sócio não encontrado')
  if (!member.active) throw new Error('Sócio inativo — não é possível gerar cobrança')
  if (!member.email) throw new Error('Sócio sem email cadastrado — obrigatório para cobrança no Mercado Pago')

  const settings = await prisma.systemSettings.findUnique({ where: { id: 'singleton' } })
  const now = new Date()
  const refMonth = opts.referenceMonth ?? (now.getMonth() + 1)
  const refYear = opts.referenceYear ?? now.getFullYear()
  const amount = opts.amount ?? Number(settings?.membershipValue ?? 50)
  const dueDay = settings?.paymentDueDayOfMonth ?? 10
  const dueDate = opts.dueDate ?? new Date(refYear, refMonth - 1, dueDay)
  const method: ChargeMethod = opts.method ?? 'PIX'

  let payment = await prisma.payment.findUnique({
    where: {
      memberId_referenceMonth_referenceYear: {
        memberId: opts.memberId,
        referenceMonth: refMonth,
        referenceYear: refYear,
      },
    },
  })

  if (payment?.status === 'PAID') {
    throw new Error('Pagamento já foi quitado para este mês')
  }

  if (!payment) {
    payment = await prisma.payment.create({
      data: {
        memberId: opts.memberId,
        amount,
        method,
        status: 'PENDING',
        referenceMonth: refMonth,
        referenceYear: refYear,
        dueDate,
        registeredById: opts.registeredById,
      },
    })
  }

  if (
    !opts.force &&
    payment.mpPaymentId &&
    payment.mpExpiresAt &&
    payment.mpExpiresAt > new Date() &&
    payment.method === method
  ) {
    return {
      paymentId: payment.id,
      method,
      reused: true,
      mpPaymentId: payment.mpPaymentId,
      qrCode: payment.mpQrCode,
      qrCodeBase64: payment.mpQrCodeBase64,
      ticketUrl: payment.mpTicketUrl,
      barcode: method === 'BOLETO' ? payment.mpQrCode : null,
      expiresAt: payment.mpExpiresAt,
      amount: Number(payment.amount),
      referenceMonth: refMonth,
      referenceYear: refYear,
      dueDate: payment.dueDate,
    }
  }

  const [firstName, ...rest] = member.name.split(' ')

  if (method === 'PIX') {
    const charge = await createPixCharge({
      paymentId: payment.id,
      amount: Number(payment.amount),
      description: `Mensalidade AA Guarany FC - ${String(refMonth).padStart(2, '0')}/${refYear}`,
      payer: {
        email: member.email,
        firstName,
        lastName: rest.join(' '),
        cpf: member.cpf,
      },
    })

    payment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        method: 'PIX',
        mpPaymentId: charge.mpPaymentId,
        mpQrCode: charge.qrCode,
        mpQrCodeBase64: charge.qrCodeBase64,
        mpTicketUrl: charge.ticketUrl,
        mpStatus: charge.status,
        mpExpiresAt: charge.expiresAt,
      },
    })

    if (opts.notifyWhatsApp !== false && member.phone) {
      sendPixChargeMessage(
        { id: member.id, name: member.name, phone: member.phone },
        {
          amount: Number(payment.amount),
          referenceMonth: refMonth,
          referenceYear: refYear,
          dueDate: payment.dueDate,
        },
        { qrCode: charge.qrCode, ticketUrl: charge.ticketUrl },
      ).catch(err => console.error('[AutoCharge] Erro ao enviar PIX por WhatsApp:', err))
    }

    return {
      paymentId: payment.id,
      method: 'PIX',
      reused: false,
      mpPaymentId: charge.mpPaymentId,
      qrCode: charge.qrCode,
      qrCodeBase64: charge.qrCodeBase64,
      ticketUrl: charge.ticketUrl,
      barcode: null,
      expiresAt: charge.expiresAt,
      amount: Number(payment.amount),
      referenceMonth: refMonth,
      referenceYear: refYear,
      dueDate: payment.dueDate,
    }
  }

  if (!opts.address) {
    throw new Error(
      'Boleto exige endereço (CEP, rua, número, bairro, cidade, UF) — preencha no dialog de cobrança',
    )
  }

  const expiresAt = new Date(payment.dueDate)
  expiresAt.setHours(23, 59, 59, 999)
  if (expiresAt < new Date()) {
    const fallback = new Date()
    fallback.setDate(fallback.getDate() + 3)
    expiresAt.setTime(fallback.getTime())
  }

  const boleto = await createBoletoCharge({
    paymentId: payment.id,
    amount: Number(payment.amount),
    description: `Mensalidade AA Guarany FC - ${String(refMonth).padStart(2, '0')}/${refYear}`,
    expiresAt,
    payer: {
      email: member.email,
      firstName,
      lastName: rest.join(' '),
      cpf: member.cpf,
      address: opts.address,
    },
  })

  payment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      method: 'BOLETO',
      mpPaymentId: boleto.mpPaymentId,
      mpTicketUrl: boleto.ticketUrl,
      mpStatus: boleto.status,
      mpExpiresAt: boleto.expiresAt,
      mpQrCode: boleto.barcode,
    },
  })

  if (opts.notifyWhatsApp !== false && member.phone) {
    sendBoletoChargeMessage(
      { id: member.id, name: member.name, phone: member.phone },
      {
        amount: Number(payment.amount),
        referenceMonth: refMonth,
        referenceYear: refYear,
        dueDate: payment.dueDate,
      },
      { ticketUrl: boleto.ticketUrl, barcode: boleto.barcode },
    ).catch(err => console.error('[AutoCharge] Erro ao enviar Boleto por WhatsApp:', err))
  }

  return {
    paymentId: payment.id,
    method: 'BOLETO',
    reused: false,
    mpPaymentId: boleto.mpPaymentId,
    qrCode: null,
    qrCodeBase64: null,
    ticketUrl: boleto.ticketUrl,
    barcode: boleto.barcode,
    expiresAt: boleto.expiresAt,
    amount: Number(payment.amount),
    referenceMonth: refMonth,
    referenceYear: refYear,
    dueDate: payment.dueDate,
  }
}

export interface AutoChargeReport {
  skipped?: boolean
  reason?: string
  success?: number
  alreadyCharged?: number
  failed?: number
  errors?: Array<{ memberId: string; name: string; error: string }>
  refMonth?: number
  refYear?: number
}

// Roda diariamente; quando hoje é o dia de vencimento (paymentDueDayOfMonth),
// gera cobrança PIX no Mercado Pago para cada sócio ativo que ainda não tem
// cobrança válida no mês corrente, e dispara o link via WhatsApp.
export async function autoChargeOnDueDay(): Promise<AutoChargeReport> {
  const settings = await prisma.systemSettings.findUnique({ where: { id: 'singleton' } })
  if (!settings?.mpEnabled) {
    console.log('[AutoCharge] Mercado Pago desativado — pulando cobrança automática')
    return { skipped: true, reason: 'mp_disabled' }
  }

  const now = new Date()
  const today = now.getDate()
  const dueDay = settings.paymentDueDayOfMonth ?? 10

  if (today !== dueDay) {
    return { skipped: true, reason: `today=${today} dueDay=${dueDay}` }
  }

  const refMonth = now.getMonth() + 1
  const refYear = now.getFullYear()

  const adminUser =
    (await prisma.user.findFirst({
      where: { active: true, role: { in: ['SUPER_ADMIN', 'ADMIN', 'FINANCIAL'] } },
      orderBy: { createdAt: 'asc' },
    })) || (await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } }))

  if (!adminUser) {
    console.log('[AutoCharge] Nenhum usuário admin disponível para registrar')
    return { skipped: true, reason: 'no_admin_user' }
  }

  const members = await prisma.member.findMany({
    where: { active: true, email: { not: null } },
  })

  let success = 0
  let alreadyCharged = 0
  let failed = 0
  const errors: Array<{ memberId: string; name: string; error: string }> = []

  for (const m of members) {
    try {
      const existing = await prisma.payment.findUnique({
        where: {
          memberId_referenceMonth_referenceYear: {
            memberId: m.id,
            referenceMonth: refMonth,
            referenceYear: refYear,
          },
        },
      })
      if (existing?.status === 'PAID') {
        alreadyCharged++
        continue
      }
      if (existing?.mpPaymentId && existing.mpExpiresAt && existing.mpExpiresAt > now) {
        alreadyCharged++
        continue
      }

      const result = await chargeMember({
        memberId: m.id,
        method: 'PIX',
        referenceMonth: refMonth,
        referenceYear: refYear,
        registeredById: adminUser.id,
        notifyWhatsApp: true,
      })

      await prisma.auditLog.create({
        data: {
          action: 'AUTO_CHARGE_DUE_DAY',
          entityType: 'Payment',
          entityId: result.paymentId,
          changes: {
            mpPaymentId: result.mpPaymentId,
            memberId: m.id,
            amount: result.amount,
            referenceMonth: refMonth,
            referenceYear: refYear,
          },
          userId: adminUser.id,
        },
      })

      success++
    } catch (err: any) {
      failed++
      errors.push({ memberId: m.id, name: m.name, error: err.message || String(err) })
      console.error(`[AutoCharge] Falha ao cobrar ${m.name}:`, err.message || err)
    }
  }

  console.log(
    `[AutoCharge] dia ${today}/${refMonth}/${refYear} — ${success} cobranças geradas, ${alreadyCharged} já existentes, ${failed} falharam`,
  )

  return { success, alreadyCharged, failed, errors, refMonth, refYear }
}
