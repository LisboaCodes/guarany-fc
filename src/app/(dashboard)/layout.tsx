'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  LogOut,
  Shield,
  LayoutDashboard,
  Users,
  DollarSign,
  Settings,
  Menu,
  User,
  ChevronDown,
  BarChart3,
  FileText,
  UserCog,
  MessageSquare,
  HelpCircle,
  X,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Socios', href: '/dashboard/socios', icon: Users },
  { name: 'Pagamentos', href: '/dashboard/pagamentos', icon: DollarSign },
  { name: 'Score', href: '/dashboard/score', icon: BarChart3 },
  { name: 'WhatsApp', href: '/dashboard/whatsapp', icon: MessageSquare },
  { name: 'Logs', href: '/dashboard/logs', icon: FileText, adminOnly: true },
  { name: 'Usuarios', href: '/dashboard/usuarios', icon: UserCog, adminOnly: true },
  { name: 'Config', href: '/dashboard/configuracoes', icon: Settings },
  { name: 'Suporte', href: '/dashboard/suporte', icon: HelpCircle },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

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

  const filteredNav = navigation.filter(
    item => !item.adminOnly || ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
          collapsed ? "w-[72px]" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center h-16 border-b border-gray-200 flex-shrink-0",
          collapsed ? "justify-center px-2" : "px-4 gap-3"
        )}>
          <div className="bg-gradient-to-br from-[#006437] to-[#0A6938] p-2 rounded-xl shadow-md flex-shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-lg font-black bg-gradient-to-r from-[#006437] to-[#0A6938] bg-clip-text text-transparent truncate">
                AA GUARANY
              </h1>
              <p className="text-[10px] text-gray-500 font-medium">Socio Torcedor</p>
            </div>
          )}
          {/* Close button mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto p-1 rounded-md hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg transition-all duration-200 font-medium",
                  collapsed ? "justify-center px-2 py-3" : "px-3 py-2.5",
                  isActive
                    ? "bg-[#006437] text-white shadow-md"
                    : "text-gray-600 hover:bg-[#006437]/10 hover:text-[#006437]"
                )}
              >
                <Icon className={cn("flex-shrink-0", collapsed ? "h-5 w-5" : "h-5 w-5")} />
                {!collapsed && <span className="text-sm">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:block border-t border-gray-200 p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft className={cn("h-5 w-5 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>

        {/* User info at bottom */}
        <div className={cn(
          "border-t border-gray-200 p-3 flex-shrink-0",
          collapsed && "flex justify-center"
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "flex items-center gap-3 w-full rounded-lg hover:bg-gray-100 transition-colors",
                collapsed ? "justify-center p-2" : "px-3 py-2"
              )}>
                <Avatar className="h-9 w-9 border-2 border-[#006437] flex-shrink-0">
                  <AvatarFallback className="bg-[#006437] text-white font-bold text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <>
                    <div className="text-left min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-none truncate">{session.user.name}</p>
                      <Badge variant="outline" className="mt-1 text-[10px] bg-[#006437]/10 text-[#006437] border-[#006437]/20">
                        {session.user.role}
                      </Badge>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={collapsed ? "center" : "end"} side="top" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/perfil" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Meu Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-red-600 focus:text-red-600 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn(
        "transition-all duration-300",
        collapsed ? "lg:ml-[72px]" : "lg:ml-64"
      )}>
        {/* Top bar (mobile header + optional desktop bar) */}
        <header className="sticky top-0 z-30 h-16 border-b bg-white/95 backdrop-blur flex items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>

          {/* Page title area - mobile shows logo, desktop shows breadcrumb-like title */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="bg-gradient-to-br from-[#006437] to-[#0A6938] p-1.5 rounded-lg">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#006437]">AA GUARANY</span>
          </div>
          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-gray-700">
              {filteredNav.find(item => item.href === pathname)?.name || 'Dashboard'}
            </h2>
          </div>

          {/* Right side - user menu for mobile */}
          <div className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1">
                  <Avatar className="h-8 w-8 border-2 border-[#006437]">
                    <AvatarFallback className="bg-[#006437] text-white font-bold text-xs">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{session.user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/perfil" className="flex items-center cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop right side - empty or notifications later */}
          <div className="hidden lg:block" />
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
