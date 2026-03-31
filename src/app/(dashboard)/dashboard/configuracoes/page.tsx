'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Settings,
  DollarSign,
  MessageSquare,
  Calendar,
  Save,
  Loader2,
  FileText,
  BarChart3,
  Award,
  Gift,
  Download,
  CreditCard,
  CheckCircle2,
  Package,
  Sparkles
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface SystemSettings {
  id: string
  membershipValue: number
  paymentDueDayOfMonth: number
  evolutionApiUrl?: string
  evolutionApiKey?: string
  evolutionInstance?: string
  birthdayMessageEnabled: boolean
  reminderMessageEnabled: boolean
}

interface Module {
  id: string
  name: string
  description: string
  price: number
  icon: any
  status: 'available' | 'coming_soon' | 'active'
  features: string[]
}

export default function ConfiguracoesPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editedValue, setEditedValue] = useState('')
  const [editedDay, setEditedDay] = useState('')

  const modules: Module[] = [
    {
      id: 'hosting',
      name: 'Hospedagem do Sistema',
      description: 'Hospedagem completa do sistema em servidor dedicado com alta disponibilidade',
      price: 39.90,
      icon: Settings,
      status: 'active',
      features: [
        'Servidor dedicado',
        'Backup automático diário',
        'SSL/HTTPS incluso',
        'Suporte técnico'
      ]
    },
    {
      id: 'subdomain',
      name: 'Subdomínio Personalizado',
      description: 'Subdomínio exclusivo para acesso ao sistema (ex: guarany.creativenext.com.br)',
      price: 9.90,
      icon: Package,
      status: 'active',
      features: [
        'Subdomínio exclusivo',
        'Certificado SSL automático',
        'DNS gerenciado',
        'Redirecionamento automático'
      ]
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp (Evolution API)',
      description: 'Integração completa com WhatsApp para envio automático de notificações',
      price: 29.90,
      icon: MessageSquare,
      status: 'active',
      features: [
        'Envio automático de mensagens',
        'Templates personalizáveis',
        'Logs de envio',
        'Integração com Evolution API'
      ]
    },
    {
      id: 'birthday',
      name: 'Mensagens de Aniversário',
      description: 'Envio automático de mensagens de parabéns via WhatsApp',
      price: 19.90,
      icon: Calendar,
      status: 'active',
      features: [
        'Detecção automática de aniversariantes',
        'Mensagens personalizadas',
        'Agendamento de envio',
        'Relatório de mensagens enviadas'
      ]
    },
    {
      id: 'payment_reminders',
      name: 'Lembretes de Pagamento',
      description: 'Notificações automáticas de vencimento e atraso',
      price: 19.90,
      icon: DollarSign,
      status: 'active',
      features: [
        'Lembretes X dias antes do vencimento',
        'Notificações de atraso',
        'Mensagens configuráveis',
        'Histórico de lembretes'
      ]
    },
    {
      id: 'pdf_reports',
      name: 'Relatórios em PDF',
      description: 'Geração de relatórios financeiros e de sócios em PDF',
      price: 19.90,
      icon: FileText,
      status: 'coming_soon',
      features: [
        'Relatório de inadimplência',
        'Relatório de receitas',
        'Lista de sócios',
        'Exportação personalizada'
      ]
    },
    {
      id: 'advanced_analytics',
      name: 'Dashboard Analytics Avançado',
      description: 'Gráficos e métricas detalhadas com análise de tendências',
      price: 19.90,
      icon: BarChart3,
      status: 'coming_soon',
      features: [
        'Gráficos interativos (Recharts)',
        'Análise de crescimento',
        'Previsão de receitas',
        'Métricas de retenção'
      ]
    },
    {
      id: 'membership_plans',
      name: 'Planos Diferenciados',
      description: 'Sistema de planos Bronze, Prata e Ouro com valores distintos',
      price: 19.90,
      icon: Award,
      status: 'coming_soon',
      features: [
        'Múltiplos planos de sócio',
        'Valores personalizados por plano',
        'Benefícios exclusivos',
        'Upgrade/downgrade de planos'
      ]
    },
    {
      id: 'benefits',
      name: 'Gestão de Benefícios',
      description: 'Controle de benefícios e vantagens para sócios',
      price: 19.90,
      icon: Gift,
      status: 'coming_soon',
      features: [
        'Cadastro de benefícios',
        'Controle de utilização',
        'Descontos em parceiros',
        'Relatório de uso'
      ]
    },
    {
      id: 'export',
      name: 'Exportação de Dados',
      description: 'Exportar dados de sócios e pagamentos em Excel/CSV',
      price: 19.90,
      icon: Download,
      status: 'coming_soon',
      features: [
        'Exportação em Excel',
        'Exportação em CSV',
        'Filtros customizáveis',
        'Agendamento de relatórios'
      ]
    },
    {
      id: 'payment_gateway',
      name: 'Gateway de Pagamento',
      description: 'Integração com PIX automático e cartão de crédito',
      price: 29.90,
      icon: CreditCard,
      status: 'coming_soon',
      features: [
        'PIX automático (Mercado Pago/Asaas)',
        'Cobrança recorrente',
        'Cartão de crédito',
        'Conciliação automática'
      ]
    },
    {
      id: 'event_checkin',
      name: 'Check-in em Eventos',
      description: 'Sistema de presença e check-in para jogos e eventos',
      price: 19.90,
      icon: CheckCircle2,
      status: 'coming_soon',
      features: [
        'QR Code para check-in',
        'Controle de presença',
        'Lista de confirmados',
        'Estatísticas de eventos'
      ]
    },
  ]

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
        setEditedValue(data.membershipValue.toString())
        setEditedDay(data.paymentDueDayOfMonth.toString())
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveFinancial = async () => {
    setSaving(true)
    try {
      const membershipValue = parseFloat(editedValue)
      const paymentDueDayOfMonth = parseInt(editedDay)

      if (isNaN(membershipValue) || membershipValue <= 0) {
        toast({
          title: 'Erro',
          description: 'Valor da mensalidade inválido',
          variant: 'destructive',
        })
        return
      }

      if (isNaN(paymentDueDayOfMonth) || paymentDueDayOfMonth < 1 || paymentDueDayOfMonth > 31) {
        toast({
          title: 'Erro',
          description: 'Dia de vencimento deve estar entre 1 e 31',
          variant: 'destructive',
        })
        return
      }

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipValue, paymentDueDayOfMonth }),
      })

      if (res.ok) {
        const data = await res.json()
        setSettings(data)
        toast({
          title: 'Sucesso!',
          description: 'Configurações financeiras atualizadas',
        })
      } else {
        const error = await res.json()
        toast({
          title: 'Erro',
          description: error.error || 'Erro ao salvar configurações',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao salvar configurações',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#006437]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie as configurações do sistema e módulos adicionais
        </p>
      </div>

      {/* Financial Settings - EDITABLE */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#006437]/10 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-[#006437]" />
              </div>
              <div>
                <CardTitle>Configurações Financeiras</CardTitle>
                <CardDescription>Valores e datas de pagamento</CardDescription>
              </div>
            </div>
            <Badge className="bg-emerald-600">Ativo</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="membershipValue">Valor da Mensalidade (R$)</Label>
              <Input
                id="membershipValue"
                type="number"
                step="0.01"
                min="0"
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                placeholder="50.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentDay">Dia de Vencimento</Label>
              <Input
                id="paymentDay"
                type="number"
                min="1"
                max="31"
                value={editedDay}
                onChange={(e) => setEditedDay(e.target.value)}
                placeholder="10"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSaveFinancial}
              disabled={saving}
              className="bg-gradient-to-r from-[#006437] to-[#0A6938] hover:from-[#005030] hover:to-[#006437]"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditedValue(settings?.membershipValue.toString() || '50')
                setEditedDay(settings?.paymentDueDayOfMonth.toString() || '10')
              }}
            >
              Cancelar
            </Button>
          </div>

          {settings && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Valores atuais:</p>
              <div className="mt-2 flex gap-6">
                <div>
                  <p className="text-xs text-muted-foreground">Mensalidade</p>
                  <p className="text-lg font-bold text-[#006437]">
                    {formatCurrency(settings.membershipValue)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vencimento</p>
                  <p className="text-lg font-bold text-[#006437]">
                    Dia {settings.paymentDueDayOfMonth}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modules Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-[#006437]" />
          <div>
            <h2 className="text-2xl font-bold">Módulos Adicionais</h2>
            <p className="text-sm text-muted-foreground">
              Expanda as funcionalidades do sistema com módulos pagos
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon
            return (
              <Card key={module.id} className="relative overflow-hidden">
                {module.status === 'active' && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-emerald-600">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Ativo
                    </Badge>
                  </div>
                )}
                {module.status === 'coming_soon' && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary">
                      <Sparkles className="mr-1 h-3 w-3" />
                      Em Breve
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-lg ${module.status === 'active' ? 'bg-emerald-500/10' : 'bg-[#006437]/10'}`}>
                      <Icon className={`h-6 w-6 ${module.status === 'active' ? 'text-emerald-600' : 'text-[#006437]'}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{module.name}</CardTitle>
                      <p className="text-2xl font-bold text-[#006437] mt-1">
                        {formatCurrency(module.price)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {module.description}
                  </p>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">Recursos:</p>
                    <ul className="space-y-1">
                      {module.features.map((feature, idx) => (
                        <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                          <CheckCircle2 className="h-3 w-3 text-[#006437] mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        variant={module.status === 'active' ? 'outline' : 'default'}
                        disabled={module.status === 'coming_soon'}
                      >
                        {module.status === 'active' ? 'Configurar' : module.status === 'coming_soon' ? 'Em Breve' : 'Adquirir Módulo'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adquirir {module.name}</DialogTitle>
                        <DialogDescription>
                          Entre em contato para adicionar este módulo ao seu sistema
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm font-semibold">Investimento único:</p>
                          <p className="text-3xl font-bold text-[#006437]">
                            {formatCurrency(module.price)}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Para implementar este módulo, entre em contato pelo WhatsApp:
                        </p>
                        <div className="space-y-2">
                          <Button
                            className="w-full bg-[#25D366] hover:bg-[#1fb355] text-white"
                            onClick={() => {
                              const message = `Olá! Gostaria de adquirir o módulo *${module.name}* (${formatCurrency(module.price)}) para o sistema AA Guarany.`
                              window.open(`https://wa.me/557999062129?text=${encodeURIComponent(message)}`, '_blank')
                            }}
                          >
                            📱 Solicitar via WhatsApp
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-[#006437]/10 to-[#0A6938]/10 border-[#006437]/20">
        <CardHeader>
          <CardTitle className="text-[#006437] flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Sistema Modular
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nosso sistema é modular e você só paga pelos recursos que realmente precisa.
            Cada módulo é desenvolvido especificamente para o seu negócio e pode ser implementado
            de forma independente. Entre em contato para conhecer os módulos disponíveis!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
