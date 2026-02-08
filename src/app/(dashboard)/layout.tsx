'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#004D29] via-[#006437] to-[#0A6938]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FFD700] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-white font-semibold text-lg">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#006437] to-[#0A6938] shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-[#FFD700] to-[#F4C430] p-3 rounded-xl shadow-lg">
                <svg className="w-8 h-8 text-[#006437]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 10a2 2 0 114 0 2 2 0 01-4 0z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  GUARANY FC
                </h1>
                <p className="text-sm text-green-100 font-semibold">Sistema de Sócio Torcedor</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                <p className="text-sm font-bold text-white">{session.user.name}</p>
                <p className="text-xs text-green-100 font-semibold">{session.user.role}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="px-5 py-2.5 text-sm font-bold text-[#006437] bg-gradient-to-r from-[#FFD700] to-[#F4C430] rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
