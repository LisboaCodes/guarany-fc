import { MercadoPagoConfig, Payment } from 'mercadopago'
import crypto from 'crypto'
import { prisma } from './prisma'

async function getMpConfig() {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 'singleton' },
  })
  return {
    accessToken: settings?.mpAccessToken || process.env.MERCADOPAGO_ACCESS_TOKEN || null,
    webhookSecret: settings?.mpWebhookSecret || process.env.MERCADOPAGO_WEBHOOK_SECRET || null,
    enabled: settings?.mpEnabled ?? !!process.env.MERCADOPAGO_ACCESS_TOKEN,
  }
}

async function getClient() {
  const { accessToken } = await getMpConfig()
  if (!accessToken) {
    throw new Error('Mercado Pago não configurado — preencha o Access Token em Configurações')
  }
  return new MercadoPagoConfig({
    accessToken,
    options: { timeout: 10000 },
  })
}

export interface CreatePixChargeInput {
  paymentId: string
  amount: number
  description: string
  payer: {
    email: string
    firstName: string
    lastName?: string
    cpf: string
  }
  expiresInMinutes?: number
}

export interface PixChargeResult {
  mpPaymentId: string
  qrCode: string
  qrCodeBase64: string
  ticketUrl: string | null
  expiresAt: Date
  status: string
}

export async function createPixCharge(input: CreatePixChargeInput): Promise<PixChargeResult> {
  const client = await getClient()
  const payment = new Payment(client)

  const expiresInMinutes = input.expiresInMinutes ?? 60 * 24
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)

  const result = await payment.create({
    body: {
      transaction_amount: Number(input.amount.toFixed(2)),
      description: input.description,
      payment_method_id: 'pix',
      date_of_expiration: expiresAt.toISOString(),
      external_reference: input.paymentId,
      notification_url: `${process.env.NEXTAUTH_URL}/api/webhooks/mercadopago`,
      payer: {
        email: input.payer.email,
        first_name: input.payer.firstName,
        last_name: input.payer.lastName || '',
        identification: {
          type: 'CPF',
          number: input.payer.cpf.replace(/\D/g, ''),
        },
      },
    },
    requestOptions: {
      idempotencyKey: `payment-${input.paymentId}-${Date.now()}`,
    },
  })

  const txData = result.point_of_interaction?.transaction_data
  if (!result.id || !txData?.qr_code || !txData?.qr_code_base64) {
    throw new Error('Resposta inválida do Mercado Pago: QR Code ausente')
  }

  return {
    mpPaymentId: String(result.id),
    qrCode: txData.qr_code,
    qrCodeBase64: txData.qr_code_base64,
    ticketUrl: txData.ticket_url || null,
    expiresAt,
    status: result.status || 'pending',
  }
}

export async function getMpPayment(mpPaymentId: string) {
  const client = await getClient()
  const payment = new Payment(client)
  return payment.get({ id: mpPaymentId })
}

export interface CreateBoletoChargeInput {
  paymentId: string
  amount: number
  description: string
  payer: {
    email: string
    firstName: string
    lastName?: string
    cpf: string
    address?: {
      zipCode: string
      streetName: string
      streetNumber: string
      neighborhood: string
      city: string
      federalUnit: string
    }
  }
  expiresAt: Date
}

export interface BoletoChargeResult {
  mpPaymentId: string
  ticketUrl: string
  barcode: string | null
  expiresAt: Date
  status: string
}

export async function createBoletoCharge(input: CreateBoletoChargeInput): Promise<BoletoChargeResult> {
  const client = await getClient()
  const payment = new Payment(client)

  const result = await payment.create({
    body: {
      transaction_amount: Number(input.amount.toFixed(2)),
      description: input.description,
      payment_method_id: 'bolbradesco',
      date_of_expiration: input.expiresAt.toISOString(),
      external_reference: input.paymentId,
      notification_url: `${process.env.NEXTAUTH_URL}/api/webhooks/mercadopago`,
      payer: {
        email: input.payer.email,
        first_name: input.payer.firstName,
        last_name: input.payer.lastName || '',
        identification: {
          type: 'CPF',
          number: input.payer.cpf.replace(/\D/g, ''),
        },
        ...(input.payer.address && {
          address: {
            zip_code: input.payer.address.zipCode.replace(/\D/g, ''),
            street_name: input.payer.address.streetName,
            street_number: input.payer.address.streetNumber,
            neighborhood: input.payer.address.neighborhood,
            city: input.payer.address.city,
            federal_unit: input.payer.address.federalUnit,
          },
        }),
      },
    },
    requestOptions: {
      idempotencyKey: `boleto-${input.paymentId}-${Date.now()}`,
    },
  })

  const txData = result.transaction_details
  const ticketUrl = txData?.external_resource_url
  if (!result.id || !ticketUrl) {
    throw new Error('Resposta inválida do Mercado Pago: boleto não gerado')
  }

  return {
    mpPaymentId: String(result.id),
    ticketUrl,
    barcode: result.barcode?.content || null,
    expiresAt: input.expiresAt,
    status: result.status || 'pending',
  }
}

export function mapMpStatusToInternal(mpStatus: string): 'PAID' | 'PENDING' | 'CANCELLED' | null {
  switch (mpStatus) {
    case 'approved':
      return 'PAID'
    case 'pending':
    case 'in_process':
    case 'authorized':
      return 'PENDING'
    case 'rejected':
    case 'cancelled':
    case 'refunded':
    case 'charged_back':
      return 'CANCELLED'
    default:
      return null
  }
}

export async function verifyWebhookSignature(
  signatureHeader: string | null,
  requestId: string | null,
  dataId: string,
): Promise<boolean> {
  const { webhookSecret } = await getMpConfig()
  if (!webhookSecret) {
    console.warn('[MP] Webhook secret não configurado — pulando verificação')
    return true
  }
  const secret = webhookSecret
  if (!signatureHeader || !requestId) return false

  const parts = signatureHeader.split(',').reduce<Record<string, string>>((acc, pair) => {
    const [k, v] = pair.split('=').map(s => s.trim())
    if (k && v) acc[k] = v
    return acc
  }, {})

  const ts = parts.ts
  const v1 = parts.v1
  if (!ts || !v1) return false

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`
  const hmac = crypto.createHmac('sha256', secret).update(manifest).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(v1))
}
