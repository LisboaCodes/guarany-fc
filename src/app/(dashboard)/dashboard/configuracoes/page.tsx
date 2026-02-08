'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Settings, DollarSign, MessageSquare, Calendar } from 'lucide-react'

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie as configurações do sistema
        </p>
      </div>

      {/* Settings Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Financial Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-[#006437]/10 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-[#006437]" />
              </div>
              <div>
                <CardTitle>Configurações Financeiras</CardTitle>
                <CardDescription>Valores e datas de pagamento</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Valor da Mensalidade</p>
              <p className="text-2xl font-bold">R$ 50,00</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dia de Vencimento</p>
              <p className="text-2xl font-bold">Dia 10</p>
            </div>
            <Badge variant="outline" className="mt-4">
              Em Desenvolvimento
            </Badge>
          </CardContent>
        </Card>

        {/* WhatsApp Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-3 rounded-lg">
                <MessageSquare className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <CardTitle>WhatsApp (Evolution API)</CardTitle>
                <CardDescription>Integração para notificações</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="secondary">Não Configurado</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure a Evolution API para enviar lembretes de pagamento e mensagens de aniversário automaticamente.
            </p>
            <Badge variant="outline" className="mt-4">
              Em Desenvolvimento
            </Badge>
          </CardContent>
        </Card>

        {/* Birthday Messages */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-[#FFD700]/20 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-[#F4C430]" />
              </div>
              <div>
                <CardTitle>Mensagens de Aniversário</CardTitle>
                <CardDescription>Configurações de mensagens automáticas</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="secondary">Desabilitado</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Envie mensagens automáticas de aniversário para os sócios via WhatsApp.
            </p>
            <Badge variant="outline" className="mt-4">
              Em Desenvolvimento
            </Badge>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="bg-slate-500/10 p-3 rounded-lg">
                <Settings className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>Preferências gerais</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Versão</p>
              <p className="font-medium">1.0.0</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ambiente</p>
              <p className="font-medium">Produção</p>
            </div>
            <Badge variant="outline" className="mt-4">
              Em Desenvolvimento
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">🚧 Página em Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800">
            As funcionalidades de configuração estão sendo desenvolvidas e estarão disponíveis em breve.
            Por enquanto, os valores padrão estão sendo utilizados.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
