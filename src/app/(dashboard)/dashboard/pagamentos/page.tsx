'use client'

import { useState, useEffect } from 'react'
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
  XCircle
} from 'lucide-react'

interface Payment {
  id: string
  amount: number
  method: string
  status: string
  referenceMonth: number
  referenceYear: number
  dueDate: string
  paidAt?: string
  member: {
    id: string
    name: string
    cpf: string
  }
  registeredBy: { name: string }
}

interface Member {
  id: string
  name: string
  cpf: string
}

export default function PagamentosPage() {
  const searchParams = useSearchParams()
  const preselectedMemberId = searchParams.get('member')

  const [payments, setPayments] = useState<Payment[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

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
    fetchPayments()
    fetchMembers()
  }, [statusFilter])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const res = await fetch(`/api/payments?${params}`)
      const data = await res.json()

      if (res.ok) {
        setPayments(data.payments)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members?limit=1000&active=true')
      const data = await res.json()
      if (res.ok) {
        setMembers(data.members)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

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
      fetchPayments()

      // Reset form
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
        fetchPayments()
      }
    } catch (error) {
      console.error('Error marking payment as paid:', error)
    }
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
    const variants: Record<string, { label: string; className: string }> = {
      PAID: { label: 'Pago', className: 'bg-emerald-600 text-white' },
      PENDING: { label: 'Pendente', className: 'bg-amber-500 text-white' },
      OVERDUE: { label: 'Atrasado', className: 'bg-red-600 text-white' },
      CANCELLED: { label: 'Cancelado', className: 'bg-slate-400 text-white' }
    }
    const config = variants[status] || variants.PENDING
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      PIX: 'PIX',
      CASH: 'Dinheiro',
      CARD: 'Cartão',
      BOLETO: 'Boleto'
    }
    return methods[method] || method
  }

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os pagamentos dos sócios
          </p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="bg-gradient-to-r from-[#006437] to-[#0A6938] hover:from-[#005030] hover:to-[#006437]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Registrar Pagamento
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('all')}
            >
              Todos
            </Button>
            <Button
              variant={statusFilter === 'PAID' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('PAID')}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Pagos
            </Button>
            <Button
              variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('PENDING')}
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              Pendentes
            </Button>
            <Button
              variant={statusFilter === 'OVERDUE' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('OVERDUE')}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Atrasados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pagamentos</CardTitle>
          <CardDescription>
            {loading ? 'Carregando...' : `${payments.length} pagamentos encontrados`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#006437]" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum pagamento encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sócio</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Referência</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.member.name}</TableCell>
                    <TableCell>{formatCPF(payment.member.cpf)}</TableCell>
                    <TableCell>
                      {months[payment.referenceMonth - 1]} {payment.referenceYear}
                    </TableCell>
                    <TableCell>{formatCurrency(Number(payment.amount))}</TableCell>
                    <TableCell>{getMethodLabel(payment.method)}</TableCell>
                    <TableCell>{formatDate(payment.dueDate)}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      {payment.status === 'PENDING' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsPaid(payment.id)}
                        >
                          Marcar como Pago
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
                <label className="text-sm font-medium">Sócio *</label>
                <Select
                  value={formData.memberId}
                  onValueChange={(value) => setFormData({ ...formData, memberId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um sócio" />
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
                  <label className="text-sm font-medium">Mês de Referência *</label>
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
                  <label className="text-sm font-medium">Método *</label>
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
                      <SelectItem value="CARD">Cartão</SelectItem>
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
                <label className="text-sm font-medium">Observações</label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações adicionais"
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
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
