import { prisma } from './prisma'

export async function ensureDbSchema() {
  try {
    // Add new enum values if they don't exist
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'SUPER_ADMIN' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')) THEN
          ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN' BEFORE 'ADMIN';
        END IF;
      END $$;
    `).catch(() => {})

    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'FINANCIAL' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')) THEN
          ALTER TYPE "UserRole" ADD VALUE 'FINANCIAL' BEFORE 'OPERATOR';
        END IF;
      END $$;
    `).catch(() => {})

    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ATTENDANT' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'UserRole')) THEN
          ALTER TYPE "UserRole" ADD VALUE 'ATTENDANT' BEFORE 'OPERATOR';
        END IF;
      END $$;
    `).catch(() => {})

    // Add action index to audit_logs if not exists
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs"("action");
    `).catch(() => {})

    // Add Mercado Pago columns to payments
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "payments"
        ADD COLUMN IF NOT EXISTS "mpPaymentId" TEXT,
        ADD COLUMN IF NOT EXISTS "mpQrCode" TEXT,
        ADD COLUMN IF NOT EXISTS "mpQrCodeBase64" TEXT,
        ADD COLUMN IF NOT EXISTS "mpTicketUrl" TEXT,
        ADD COLUMN IF NOT EXISTS "mpStatus" TEXT,
        ADD COLUMN IF NOT EXISTS "mpExpiresAt" TIMESTAMP(3);
    `).catch(() => {})

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "payments_mpPaymentId_key" ON "payments"("mpPaymentId");
    `).catch(() => {})

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "payments_mpPaymentId_idx" ON "payments"("mpPaymentId");
    `).catch(() => {})

    // Add Mercado Pago credentials to system_settings
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "system_settings"
        ADD COLUMN IF NOT EXISTS "mpAccessToken" TEXT,
        ADD COLUMN IF NOT EXISTS "mpWebhookSecret" TEXT,
        ADD COLUMN IF NOT EXISTS "mpEnabled" BOOLEAN NOT NULL DEFAULT false;
    `).catch(() => {})

    console.log('[DB] Schema migration check completed')
  } catch (error) {
    console.error('[DB] Schema migration error:', error)
  }
}
