'use client'

import { useSession } from 'next-auth/react'
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
  ArrowDownRight
} from 'lucide-react'

export default function DashboardPage() {
  const { data: session } = useSession()

  const stats = [
    {
      title: 'Sócios Ativos',
      value: '1,234',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: 'text-[#006437]',
      bgColor: 'bg-[#006437]/10'
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 45.231',
      change: '+8.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-[#FFD700]',
      bgColor: 'bg-[#FFD700]/10'
    },
    {
      title: 'Taxa de Pagamento',
      value: '94.8%',
      change: '+2.4%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-600/10'
    },
    {
      title: 'Pagamentos Pendentes',
      value: '23',
      change: '-5.1%',
      trend: 'down',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-600/10'
    }
  ]

  const recentActivity = [
    { action: 'Novo sócio cadastrado', user: 'João Silva', time: 'Há 5 minutos' },
    { action: 'Pagamento confirmado', user: 'Maria Santos', time: 'Há 12 minutos' },
    { action: 'Plano atualizado', user: 'Pedro Costa', time: 'Há 1 hora' },
    { action: 'Novo sócio cadastrado', user: 'Ana Oliveira', time: 'Há 2 horas' }
  ]

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
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-4 w-4 text-emerald-600 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}>
                    {stat.change}
                  </span>
                  <span className="ml-1">vs. mês anterior</span>
                </div>
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
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesso rápido às funcionalidades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start bg-gradient-to-r from-[#006437] to-[#0A6938] hover:from-[#005030] hover:to-[#006437]" size="lg">
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Sócio
            </Button>
            <Button className="w-full justify-start" variant="outline" size="lg">
              <DollarSign className="mr-2 h-4 w-4" />
              Registrar Pagamento
            </Button>
            <Button className="w-full justify-start" variant="outline" size="lg">
              <FileText className="mr-2 h-4 w-4" />
              Gerar Relatório
            </Button>
            <Button className="w-full justify-start" variant="outline" size="lg">
              <Users className="mr-2 h-4 w-4" />
              Ver Todos os Sócios
            </Button>
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
