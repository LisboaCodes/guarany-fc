import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ensureDbSchema } from '@/lib/db-migrate'

let migrationRan = false

// GET - Buscar configurações do sistema
export async function GET(request: NextRequest) {
  if (!migrationRan) {
    await ensureDbSchema()
    migrationRan = true
  }
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar ou criar configurações
    let settings = await prisma.systemSettings.findUnique({
      where: { id: 'singleton' }
    })

    if (!settings) {
      // Criar configurações padrão se não existir
      settings = await prisma.systemSettings.create({
        data: {
          id: 'singleton',
          membershipValue: 50.00,
          paymentDueDayOfMonth: 10,
          birthdayMessageEnabled: true,
          reminderMessageEnabled: true,
          reminderDaysBeforeDue: 5,
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar configurações do sistema
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Apenas ADMIN pode alterar configurações
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores podem alterar configurações' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      membershipValue,
      paymentDueDayOfMonth,
      evolutionApiUrl,
      evolutionApiKey,
      evolutionInstance,
      birthdayMessageEnabled,
      birthdayMessageTemplate,
      reminderMessageEnabled,
      reminderMessageTemplate,
      reminderDaysBeforeDue,
      mpAccessToken,
      mpWebhookSecret,
      mpEnabled,
    } = body

    // Validações
    if (membershipValue !== undefined) {
      if (typeof membershipValue !== 'number' || membershipValue <= 0) {
        return NextResponse.json(
          { error: 'Valor da mensalidade inválido' },
          { status: 400 }
        )
      }
    }

    if (paymentDueDayOfMonth !== undefined) {
      if (typeof paymentDueDayOfMonth !== 'number' || paymentDueDayOfMonth < 1 || paymentDueDayOfMonth > 31) {
        return NextResponse.json(
          { error: 'Dia de vencimento deve estar entre 1 e 31' },
          { status: 400 }
        )
      }
    }

    // Atualizar configurações
    const settings = await prisma.systemSettings.upsert({
      where: { id: 'singleton' },
      update: {
        ...(membershipValue !== undefined && { membershipValue }),
        ...(paymentDueDayOfMonth !== undefined && { paymentDueDayOfMonth }),
        ...(evolutionApiUrl !== undefined && { evolutionApiUrl }),
        ...(evolutionApiKey !== undefined && { evolutionApiKey }),
        ...(evolutionInstance !== undefined && { evolutionInstance }),
        ...(birthdayMessageEnabled !== undefined && { birthdayMessageEnabled }),
        ...(birthdayMessageTemplate !== undefined && { birthdayMessageTemplate }),
        ...(reminderMessageEnabled !== undefined && { reminderMessageEnabled }),
        ...(reminderMessageTemplate !== undefined && { reminderMessageTemplate }),
        ...(reminderDaysBeforeDue !== undefined && { reminderDaysBeforeDue }),
        ...(mpAccessToken !== undefined && { mpAccessToken }),
        ...(mpWebhookSecret !== undefined && { mpWebhookSecret }),
        ...(mpEnabled !== undefined && { mpEnabled }),
      },
      create: {
        id: 'singleton',
        membershipValue: membershipValue || 50.00,
        paymentDueDayOfMonth: paymentDueDayOfMonth || 10,
        evolutionApiUrl,
        evolutionApiKey,
        evolutionInstance,
        birthdayMessageEnabled: birthdayMessageEnabled ?? true,
        birthdayMessageTemplate,
        reminderMessageEnabled: reminderMessageEnabled ?? true,
        reminderMessageTemplate,
        reminderDaysBeforeDue: reminderDaysBeforeDue || 5,
        mpAccessToken,
        mpWebhookSecret,
        mpEnabled: mpEnabled ?? false,
      }
    })

    // Registrar auditoria (mascarando segredos)
    const safeChanges = { ...body }
    if (safeChanges.mpAccessToken) safeChanges.mpAccessToken = '***'
    if (safeChanges.mpWebhookSecret) safeChanges.mpWebhookSecret = '***'
    if (safeChanges.evolutionApiKey) safeChanges.evolutionApiKey = '***'

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'SystemSettings',
        entityId: settings.id,
        changes: safeChanges,
        userId: session.user.id,
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    )
  }
}
