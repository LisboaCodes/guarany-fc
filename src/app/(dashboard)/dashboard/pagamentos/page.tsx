'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DollarSign,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Ban,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  QrCode,
  Copy,
  FileText,
  ExternalLink,
} from 'lucide-react'

interface GridEntry {
  id: string | null
  memberId: string
  memberName: string
  memberCpf: string
  memberPhone: string
  referenceMonth: number
  referenceYear: number
  amount: number
  method: string | null
  status: string
  dueDate: string
  paidAt: string | null
  notes: string | null
  registeredBy: string | null
  isVirtual: boolean
}

interface Member {
  id: string
  name: string
  cpf: string
}

export default function PagamentosPage() {
  const searchParams = useSearchParams()
  const preselectedMemberId = searchParams.get('member')

  const [gridData, setGridData] = useState<GridEntry[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [membershipValue, setMembershipValue] = useState(50)
  const [chargingId, setChargingId] = useState<string | null>(null)
  const [boletoId, setBoletoId] = useState<string | null>(null)
  const [pixDialog, setPixDialog] = useState<{
    open: boolean
    qrCodeBase64: string
    qrCode: string
    memberName: string
    amount: number
  }>({ open: false, qrCodeBase64: '', qrCode: '', memberName: '', amount: 0 })
  const [boletoDialog, setBoletoDialog] = useState<{
    open: boolean
    ticketUrl: string
    barcode: string
    memberName: string
    amount: number
  }>({ open: false, ticketUrl: '', barcode: '', memberName: '', amount: 0 })

  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const [formData, setFormData] = useState({
    memberId: preselectedMemberId || '',
    amount: '50.00',
    method: 'PIX',
    status: 'PAID',
    referenceMonth: currentMonth.toString(),
    referenceYear: currentYear.toString(),
    dueDate: new Date(currentYear, currentMonth - 1, 10).toISOString().split('T')[0],
    paidAt: new Date().toISOString().split('T')[0],
    notes: ''
  })

  useEffect(() => {
    fetchGrid()
    fetchMembers()
  }, [selectedYear])

  const fetchGrid = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/payments/grid?year=${selectedYear}`, { cache: 'no-store' })
      const data = await res.json()
      if (res.ok) {
        setGridData(data.grid)
        setMembershipValue(data.membershipValue)
      }
    } catch (error) {
      console.error('Error fetching grid:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members?limit=1000&active=true', { cache: 'no-store' })
      const data = await res.json()
      if (res.ok) {
        setMembers(data.members)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  // Filtered data
  const filteredData = useMemo(() => {
    let data = gridData

    if (statusFilter !== 'all') {
      data = data.filter(entry => entry.status === statusFilter)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      data = data.filter(entry =>
        entry.memberName.toLowerCase().includes(term) ||
        entry.memberCpf.includes(searchTerm.replace(/\D/g, ''))
      )
    }

    return data
  }, [gridData, statusFilter, searchTerm])

  // Stats
  const stats = useMemo(() => {
    const paid = gridData.filter(e => e.status === 'PAID').length
    const pending = gridData.filter(e => e.status === 'PENDING').length
    const overdue = gridData.filter(e => e.status === 'OVERDUE').length
    const cancelled = gridData.filter(e => e.status === 'CANCELLED').length
    const totalPaid = gridData
      .filter(e => e.status === 'PAID')
      .reduce((sum, e) => sum + e.amount, 0)
    const totalPending = gridData
      .filter(e => e.status === 'PENDING' || e.status === 'OVERDUE')
      .reduce((sum, e) => sum + e.amount, 0)

    return { paid, pending, overdue, cancelled, totalPaid, totalPending }
  }, [gridData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao registrar pagamento')
      }

      setShowDialog(false)
      fetchGrid()

      setFormData({
        ...formData,
        memberId: '',
        notes: ''
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleChargePix = async (entry: GridEntry) => {
    const paymentId = await ensurePaymentExists(entry)
    if (!paymentId) return

    setChargingId(paymentId)
    try {
      const res = await fetch(`/api/payments/${paymentId}/charge`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar cobrança')

      setPixDialog({
        open: true,
        qrCodeBase64: data.qrCodeBase64,
        qrCode: data.qrCode,
        memberName: entry.memberName,
        amount: entry.amount,
      })
      fetchGrid()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setChargingId(null)
    }
  }

  const ensurePaymentExists = async (entry: GridEntry): Promise<string | null> => {
    if (!entry.isVirtual && entry.id) return entry.id
    try {
      const createRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: entry.memberId,
          amount: entry.amount,
          method: 'PIX',
          status: 'PENDING',
          referenceMonth: entry.referenceMonth,
          referenceYear: entry.referenceYear,
          dueDate: entry.dueDate,
        }),
      })
      const createData = await createRes.json()
      if (!createRes.ok) throw new Error(createData.error || 'Erro ao criar pagamento')
      return createData.id
    } catch (err: any) {
      alert(err.message)
      return null
    }
  }

  const handleChargeBoleto = async (entry: GridEntry) => {
    const paymentId = await ensurePaymentExists(entry)
    if (!paymentId) return

    setBoletoId(paymentId)
    try {
      const res = await fetch(`/api/payments/${paymentId}/boleto`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar boleto')

      setBoletoDialog({
        open: true,
        ticketUrl: data.ticketUrl,
        barcode: data.barcode || '',
        memberName: entry.memberName,
        amount: entry.amount,
      })
      fetchGrid()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setBoletoId(null)
    }
  }

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      const res = await fetch(`/api/payments/${paymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'PAID',
          paidAt: new Date().toISOString()
        })
      })

      if (res.ok) {
        fetchGrid()
      }
    } catch (error) {
      console.error('Error marking payment as paid:', error)
    }
  }

  // Quick register for virtual entries (no payment record yet)
  const handleQuickRegister = (entry: GridEntry) => {
    setFormData({
      memberId: entry.memberId,
      amount: entry.amount.toString(),
      method: 'PIX',
      status: 'PAID',
      referenceMonth: entry.referenceMonth.toString(),
      referenceYear: entry.referenceYear.toString(),
      dueDate: new Date(entry.dueDate).toISOString().split('T')[0],
      paidAt: new Date().toISOString().split('T')[0],
      notes: ''
    })
    setShowDialog(true)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string; icon: any }> = {
      PAID: { label: 'Pago', className: 'bg-emerald-600 text-white', icon: CheckCircle },
      PENDING: { label: 'Pendente', className: 'bg-amber-500 text-white', icon: Clock },
      OVERDUE: { label: 'Atrasado', className: 'bg-red-600 text-white', icon: AlertCircle },
      CANCELLED: { label: 'Cancelado', className: 'bg-slate-400 text-white', icon: Ban }
    }
    const config = variants[status] || variants.PENDING
    const Icon = config.icon
    return (
      <Badge className={config.className}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getMethodLabel = (method: string | null) => {
    if (!method) return '-'
    const methods: Record<string, string> = {
      PIX: 'PIX',
      CASH: 'Dinheiro',
      CARD: 'Cartao',
      BOLETO: 'Boleto'
    }
    return methods[method] || method
  }

  const months = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const getRowBg = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-emerald-50/50'
      case 'OVERDUE': return 'bg-red-50/50'
      case 'CANCELLED': return 'bg-slate-50/50'
      default: return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
          <p className="text-muted-foreground mt-1">
            Controle completo de mensalidades dos socios
          </p>
        </div>
        <Button
          onClick={() => {
            setFormData({
              memberId: '',
              amount: membershipValue.toString(),
              method: 'PIX',
              status: 'PAID',
              referenceMonth: currentMonth.toString(),
              referenceYear: currentYear.toString(),
              dueDate: new Date(currentYear, currentMonth - 1, 10).toISOString().split('T')[0],
              paidAt: new Date().toISOString().split('T')[0],
              notes: ''
            })
            setShowDialog(true)
          }}
          className="bg-gradient-to-r from-[#006437] to-[#0A6938] hover:from-[#005030] hover:to-[#006437]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Registrar Pagamento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pagos</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.paid}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatCurrency(stats.totalPaid)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-amber-500">{stats.pending}</p>
                <p className="text-xs text-muted-foreground mt-1">Aguardando pagamento</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atrasados</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatCurrency(stats.totalPending)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cancelados</p>
                <p className="text-2xl font-bold text-slate-400">{stats.cancelled}</p>
                <p className="text-xs text-muted-foreground mt-1">{selectedYear}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                <Ban className="h-6 w-6 text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Year Selector */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedYear(y => y - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#006437] text-white rounded-md font-bold min-w-[120px] justify-center">
                <Calendar className="h-4 w-4" />
                {selectedYear}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedYear(y => y + 1)}
                disabled={selectedYear >= currentYear}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filters */}
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('all')}
              >
                Todos
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'PAID' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('PAID')}
                className={statusFilter === 'PAID' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                <CheckCircle className="mr-1 h-3 w-3" />
                Pagos
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('PENDING')}
                className={statusFilter === 'PENDING' ? 'bg-amber-500 hover:bg-amber-600' : ''}
              >
                <Clock className="mr-1 h-3 w-3" />
                Pendentes
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'OVERDUE' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('OVERDUE')}
                className={statusFilter === 'OVERDUE' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                <AlertCircle className="mr-1 h-3 w-3" />
                Atrasados
              </Button>
              <Button
                size="sm"
                variant={statusFilter === 'CANCELLED' ? 'default' : 'outline'}
                onClick={() => setStatusFilter('CANCELLED')}
                className={statusFilter === 'CANCELLED' ? 'bg-slate-500 hover:bg-slate-600' : ''}
              >
                <Ban className="mr-1 h-3 w-3" />
                Cancelados
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mensalidades {selectedYear}</CardTitle>
              <CardDescription>
                {loading ? 'Carregando...' : `${filteredData.length} registro(s) encontrado(s)`}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[#006437] border-[#006437]">
              <Users className="mr-1 h-3 w-3" />
              {new Set(gridData.map(e => e.memberId)).size} socio(s)
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#006437]" />
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum registro encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Socio</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Metodo</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((entry, index) => (
                    <TableRow key={entry.id || `${entry.memberId}-${entry.referenceMonth}`} className={getRowBg(entry.status)}>
                      <TableCell className="font-medium">{entry.memberName}</TableCell>
                      <TableCell className="text-sm">{formatCPF(entry.memberCpf)}</TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {months[entry.referenceMonth - 1]} {entry.referenceYear}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(entry.amount)}</TableCell>
                      <TableCell>{getMethodLabel(entry.method)}</TableCell>
                      <TableCell className="text-sm">{formatDate(entry.dueDate)}</TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {entry.isVirtual ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleQuickRegister(entry)}
                                className="bg-[#006437] hover:bg-[#005030] text-white text-xs"
                              >
                                <DollarSign className="mr-1 h-3 w-3" />
                                Registrar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={chargingId !== null || boletoId !== null}
                                onClick={() => handleChargePix(entry)}
                                className="text-blue-600 border-blue-600 hover:bg-blue-50 text-xs"
                              >
                                {chargingId ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <QrCode className="mr-1 h-3 w-3" />}
                                PIX
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={chargingId !== null || boletoId !== null}
                                onClick={() => handleChargeBoleto(entry)}
                                className="text-orange-600 border-orange-600 hover:bg-orange-50 text-xs"
                              >
                                {boletoId ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <FileText className="mr-1 h-3 w-3" />}
                                Boleto
                              </Button>
                            </>
                          ) : entry.status === 'PENDING' || entry.status === 'OVERDUE' ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAsPaid(entry.id!)}
                                className="text-emerald-600 border-emerald-600 hover:bg-emerald-50 text-xs"
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Pago
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={chargingId === entry.id || boletoId === entry.id}
                                onClick={() => handleChargePix(entry)}
                                className="text-blue-600 border-blue-600 hover:bg-blue-50 text-xs"
                              >
                                {chargingId === entry.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <QrCode className="mr-1 h-3 w-3" />}
                                PIX
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={chargingId === entry.id || boletoId === entry.id}
                                onClick={() => handleChargeBoleto(entry)}
                                className="text-orange-600 border-orange-600 hover:bg-orange-50 text-xs"
                              >
                                {boletoId === entry.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <FileText className="mr-1 h-3 w-3" />}
                                Boleto
                              </Button>
                            </>
                          ) : entry.status === 'PAID' ? (
                            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              {entry.paidAt ? formatDate(entry.paidAt) : 'Confirmado'}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Boleto Dialog */}
      <Dialog open={boletoDialog.open} onOpenChange={(open) => setBoletoDialog({ ...boletoDialog, open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              Boleto gerado
            </DialogTitle>
            <DialogDescription>
              {boletoDialog.memberName} — {formatCurrency(boletoDialog.amount)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Button
              type="button"
              onClick={() => window.open(boletoDialog.ticketUrl, '_blank')}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir Boleto
            </Button>

            {boletoDialog.barcode && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Código de barras</label>
                <div className="flex gap-2">
                  <Input
                    value={boletoDialog.barcode}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => navigator.clipboard.writeText(boletoDialog.barcode)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded text-sm">
              <p className="text-emerald-800">
                ✓ Boleto enviado automaticamente para o sócio via WhatsApp.<br />
                Compensação leva 1-2 dias úteis após o pagamento.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setBoletoDialog({ ...boletoDialog, open: false })}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PIX QR Code Dialog */}
      <Dialog open={pixDialog.open} onOpenChange={(open) => setPixDialog({ ...pixDialog, open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-[#006437]" />
              Cobrança PIX gerada
            </DialogTitle>
            <DialogDescription>
              {pixDialog.memberName} — {formatCurrency(pixDialog.amount)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {pixDialog.qrCodeBase64 && (
              <div className="flex justify-center bg-white p-4 rounded-lg border">
                <img
                  src={`data:image/png;base64,${pixDialog.qrCodeBase64}`}
                  alt="QR Code PIX"
                  className="w-64 h-64"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Copia e cola PIX</label>
              <div className="flex gap-2">
                <Input
                  value={pixDialog.qrCode}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(pixDialog.qrCode)
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded text-sm">
              <p className="text-emerald-800">
                ✓ QR enviado automaticamente para o sócio via WhatsApp.<br />
                A confirmação do pagamento é automática.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setPixDialog({ ...pixDialog, open: false })}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Register Payment Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Registre um novo pagamento de mensalidade
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Member Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Socio *</label>
                <Select
                  value={formData.memberId}
                  onValueChange={(value) => setFormData({ ...formData, memberId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um socio" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} - {formatCPF(member.cpf)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Reference Month */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mes de Referencia *</label>
                  <Select
                    value={formData.referenceMonth}
                    onValueChange={(value) => setFormData({ ...formData, referenceMonth: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem key={index} value={(index + 1).toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reference Year */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ano *</label>
                  <Select
                    value={formData.referenceYear}
                    onValueChange={(value) => setFormData({ ...formData, referenceYear: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valor (R$) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                {/* Method */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Metodo *</label>
                  <Select
                    value={formData.method}
                    onValueChange={(value) => setFormData({ ...formData, method: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="CASH">Dinheiro</SelectItem>
                      <SelectItem value="CARD">Cartao</SelectItem>
                      <SelectItem value="BOLETO">Boleto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status *</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAID">Pago</SelectItem>
                      <SelectItem value="PENDING">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Due Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data de Vencimento *</label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>

                {/* Paid At */}
                {formData.status === 'PAID' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data de Pagamento</label>
                    <Input
                      type="date"
                      value={formData.paidAt}
                      onChange={(e) => setFormData({ ...formData, paidAt: e.target.value })}
                    />
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Observacoes</label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observacoes adicionais"
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#006437] hover:bg-[#005030]"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Registrar
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
