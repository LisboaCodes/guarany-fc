'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  UserPlus,
  FileText,
  CheckCircle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react'

interface DashboardStats {
  activeMembers: { value: number; change: string; trend: 'up' | 'down' }
  monthlyRevenue: { value: number; change: string; trend: 'up' | 'down' }
  paymentRate: { value: number; change: string; trend: 'up' | 'down' }
  overduePayments: { value: number; change: number; trend: 'up' | 'down' }
}

interface Activity {
  action: string
  user: string
  time: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [filterDays, setFilterDays] = useState(30)

  useEffect(() => {
    fetchDashboardData()
  }, [filterDays])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/stats?days=${filterDays}`)
      const data = await res.json()

      if (res.ok) {
        setStats(data.stats)
        setRecentActivity(data.recentActivities)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const statsConfig = [
    {
      title: 'Sócios Ativos',
      key: 'activeMembers' as const,
      icon: Users,
      color: 'text-[#006437]',
      bgColor: 'bg-[#006437]/10',
      format: (value: number) => value.toString()
    },
    {
      title: 'Receita Mensal',
      key: 'monthlyRevenue' as const,
      icon: DollarSign,
      color: 'text-[#FFD700]',
      bgColor: 'bg-[#FFD700]/10',
      format: (value: number) => formatCurrency(value)
    },
    {
      title: 'Taxa de Pagamento',
      key: 'paymentRate' as const,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-600/10',
      format: (value: number) => `${value.toFixed(1)}%`
    },
    {
      title: 'Pagamentos Atrasados',
      key: 'overduePayments' as const,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-600/10',
      format: (value: number) => value.toString()
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#006437]" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#006437] to-[#0A6938] bg-clip-text text-transparent">
          Bem-vindo de volta!
        </h1>
        <p className="text-muted-foreground mt-2">
          Olá, {session?.user?.name}! Aqui está o resumo do seu sistema hoje.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((config, index) => {
          const Icon = config.icon
          const statData = stats?.[config.key]

          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {config.title}
                </CardTitle>
                <div className={`${config.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statData ? config.format(statData.value) : '-'}
                </div>
                {statData && (
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    {statData.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-600 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span className={statData.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}>
                      {statData.change}
                    </span>
                    <span className="ml-1">vs. mês anterior</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>Últimas ações no sistema</CardDescription>
              </div>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {[7, 15, 30, 90, 120, 365].map((days) => (
                <Button
                  key={days}
                  variant={filterDays === days ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterDays(days)}
                  className={filterDays === days ? 'bg-[#006437] hover:bg-[#005030]' : ''}
                >
                  {days === 365 ? '1 ano' : `${days} dias`}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma atividade recente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="bg-[#006437]/10 p-2 rounded-full">
                        <CheckCircle className="h-4 w-4 text-[#006437]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.user}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesso rápido às funcionalidades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/socios/novo" className="block">
              <Button className="w-full justify-start bg-gradient-to-r from-[#006437] to-[#0A6938] hover:from-[#005030] hover:to-[#006437]" size="lg">
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Sócio
              </Button>
            </Link>
            <Link href="/dashboard/pagamentos" className="block">
              <Button className="w-full justify-start" variant="outline" size="lg">
                <DollarSign className="mr-2 h-4 w-4" />
                Registrar Pagamento
              </Button>
            </Link>
            <Button
              className="w-full justify-start"
              variant="outline"
              size="lg"
              onClick={() => alert('Funcionalidade em desenvolvimento')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Gerar Relatório
            </Button>
            <Link href="/dashboard/socios" className="block">
              <Button className="w-full justify-start" variant="outline" size="lg">
                <Users className="mr-2 h-4 w-4" />
                Ver Todos os Sócios
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Status do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Status do Sistema</CardTitle>
          <CardDescription>Monitoramento em tempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-emerald-600">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
                <div>
                  <p className="text-sm font-medium text-white">Autenticação</p>
                  <p className="text-xs text-emerald-100">Sistema ativo</p>
                </div>
              </div>
              <Badge className="bg-white text-emerald-600 hover:bg-white/90">
                Ativo
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-blue-600">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
                <div>
                  <p className="text-sm font-medium text-white">Banco de Dados</p>
                  <p className="text-xs text-blue-100">Conectado</p>
                </div>
              </div>
              <Badge className="bg-white text-blue-600 hover:bg-white/90">
                Online
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-slate-600">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-white/60"></div>
                <div>
                  <p className="text-sm font-medium text-white">API WhatsApp</p>
                  <p className="text-xs text-slate-100">Aguardando config</p>
                </div>
              </div>
              <Badge className="bg-white text-slate-600 hover:bg-white/90">
                Pendente
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
