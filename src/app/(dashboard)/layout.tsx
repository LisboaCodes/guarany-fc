'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { LogOut, Shield } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#006437] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground font-semibold text-lg">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const userInitials = session.user.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'GF'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#006437] to-[#0A6938] p-2 rounded-xl shadow-md">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-[#006437] to-[#0A6938] bg-clip-text text-transparent">
                GUARANY FC
              </h1>
              <p className="text-xs text-muted-foreground font-medium">Sistema de Sócio Torcedor</p>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg border bg-card">
              <Avatar className="h-8 w-8 border-2 border-[#006437]">
                <AvatarFallback className="bg-[#006437] text-white font-bold text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold leading-none">{session.user.name}</p>
                <Badge variant="outline" className="mt-1 text-xs bg-[#006437]/10 text-[#006437] border-[#006437]/20">
                  {session.user.role}
                </Badge>
              </div>
            </div>
            <Button
              onClick={() => signOut({ callbackUrl: '/login' })}
              variant="outline"
              size="icon"
              className="hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
