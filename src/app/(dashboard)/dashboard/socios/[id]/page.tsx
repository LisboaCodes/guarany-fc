'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  ArrowLeft,
  Save,
  Loader2,
  Edit,
  UserX,
  UserCheck,
  DollarSign
} from 'lucide-react'

interface Payment {
  id: string
  amount: number
  status: string
  method: string
  referenceMonth: number
  referenceYear: number
  dueDate: string
  paidAt?: string
  registeredBy: { name: string }
}

interface Member {
  id: string
  name: string
  cpf: string
  birthDate: string
  phone: string
  email?: string
  address?: string
  active: boolean
  joinDate: string
  createdBy: { name: string }
  payments: Payment[]
}

export default function SocioDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    birthDate: '',
    phone: '',
    email: '',
    address: ''
  })

  useEffect(() => {
    fetchMember()
  }, [])

  const fetchMember = async () => {
    try {
      const res = await fetch(`/api/members/${params.id}`)
      const data = await res.json()

      if (res.ok) {
        setMember(data)
        setFormData({
          name: data.name,
          cpf: data.cpf,
          birthDate: data.birthDate.split('T')[0],
          phone: data.phone,
          email: data.email || '',
          address: data.address || ''
        })
      }
    } catch (error) {
      console.error('Error fetching member:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    setError('')
    setSaving(true)

    try {
      const res = await fetch(`/api/members/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao atualizar sócio')
      }

      setMember(data)
      setEditing(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async () => {
    try {
      const res = await fetch(`/api/members/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !member?.active })
      })

      if (res.ok) {
        fetchMember()
        setShowDeactivateDialog(false)
      }
    } catch (error) {
      console.error('Error toggling member status:', error)
    }
  }

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: string; className: string }> = {
      PAID: { label: 'Pago', variant: 'default', className: 'bg-emerald-600' },
      PENDING: { label: 'Pendente', variant: 'secondary', className: 'bg-amber-500 text-white' },
      OVERDUE: { label: 'Atrasado', variant: 'destructive', className: '' },
      CANCELLED: { label: 'Cancelado', variant: 'outline', className: '' }
    }
    const config = variants[status] || variants.PENDING
    return <Badge className={config.className}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#006437]" />
      </div>
    )
  }

  if (!member) {
    return (
      <div className="text-center py-12">
        <p>Sócio não encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/socios">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{member.name}</h1>
              {member.active ? (
                <Badge className="bg-emerald-600">Ativo</Badge>
              ) : (
                <Badge variant="secondary">Inativo</Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Sócio desde {formatDate(member.joinDate)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {!editing && (
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
          <Button
            variant={member.active ? 'destructive' : 'default'}
            onClick={() => setShowDeactivateDialog(true)}
          >
            {member.active ? (
              <>
                <UserX className="mr-2 h-4 w-4" />
                Desativar
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Ativar
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="payments">
            Pagamentos ({member.payments.length})
          </TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>
                {editing ? 'Edite as informações do sócio' : 'Informações cadastradas'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {editing ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome Completo</label>
                    <Input name="name" value={formData.name} onChange={handleChange} />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">CPF</label>
                      <Input name="cpf" value={formData.cpf} onChange={handleChange} disabled />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data de Nascimento</label>
                      <Input
                        name="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Telefone</label>
                      <Input name="phone" value={formData.phone} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input name="email" value={formData.email} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Endereço</label>
                    <Input name="address" value={formData.address} onChange={handleChange} />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setEditing(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Salvar
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">CPF</p>
                    <p className="font-medium">{formatCPF(member.cpf)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                    <p className="font-medium">{formatDate(member.birthDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{formatPhone(member.phone)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{member.email || '-'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Endereço</p>
                    <p className="font-medium">{member.address || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cadastrado por</p>
                    <p className="font-medium">{member.createdBy.name}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Histórico de Pagamentos</CardTitle>
                  <CardDescription>Todos os pagamentos registrados</CardDescription>
                </div>
                <Link href={`/dashboard/pagamentos?member=${member.id}`}>
                  <Button size="sm">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Registrar Pagamento
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {member.payments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum pagamento registrado
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referência</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pago em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {member.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {payment.referenceMonth}/{payment.referenceYear}
                        </TableCell>
                        <TableCell>{formatDate(payment.dueDate)}</TableCell>
                        <TableCell>{formatCurrency(Number(payment.amount))}</TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          {payment.paidAt ? formatDate(payment.paidAt) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Deactivate Dialog */}
      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {member.active ? 'Desativar Sócio?' : 'Ativar Sócio?'}
            </DialogTitle>
            <DialogDescription>
              {member.active
                ? 'O sócio será marcado como inativo e não aparecerá nas listagens ativas.'
                : 'O sócio será reativado e voltará a aparecer nas listagens ativas.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant={member.active ? 'destructive' : 'default'}
              onClick={handleToggleActive}
            >
              {member.active ? 'Desativar' : 'Ativar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
