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

    console.log('[DB] Schema migration check completed')
  } catch (error) {
    console.error('[DB] Schema migration error:', error)
  }
}
