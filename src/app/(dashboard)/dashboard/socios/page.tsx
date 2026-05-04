'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  UserPlus,
  Search,
  Eye,
  UserX,
  UserCheck,
  AlertCircle,
  Loader2,
  Edit,
  DollarSign,
  QrCode,
  FileText,
  Copy,
  ExternalLink,
} from 'lucide-react'

interface Member {
  id: string
  name: string
  cpf: string
  phone: string
  email?: string
  active: boolean
  joinDate: string
  payments: { id: string }[]
  createdBy: { name: string }
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export default function SociosPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const [chargeDialog, setChargeDialog] = useState<{
    open: boolean
    member: Member | null
    method: 'PIX' | 'BOLETO'
    referenceMonth: string
    referenceYear: string
    amount: string
    addrZip: string
    addrStreet: string
    addrNumber: string
    addrNeighborhood: string
    addrCity: string
    addrFederalUnit: string
  }>({
    open: false,
    member: null,
    method: 'PIX',
    referenceMonth: String(currentMonth),
    referenceYear: String(currentYear),
    amount: '',
    addrZip: '',
    addrStreet: '',
    addrNumber: '',
    addrNeighborhood: '',
    addrCity: '',
    addrFederalUnit: '',
  })
  const [chargingId, setChargingId] = useState<string | null>(null)
  const [chargeError, setChargeError] = useState('')

  const [pixDialog, setPixDialog] = useState<{
    open: boolean
    qrCodeBase64: string
    qrCode: string
    ticketUrl: string | null
    memberName: string
    amount: number
  }>({ open: false, qrCodeBase64: '', qrCode: '', ticketUrl: null, memberName: '', amount: 0 })

  const [boletoDialog, setBoletoDialog] = useState<{
    open: boolean
    ticketUrl: string
    barcode: string
    memberName: string
    amount: number
  }>({ open: false, ticketUrl: '', barcode: '', memberName: '', amount: 0 })

  useEffect(() => {
    fetchMembers()
  }, [page, filter])

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      })

      if (search) params.append('search', search)
      if (filter !== 'all') params.append('active', filter === 'active' ? 'true' : 'false')

      const res = await fetch(`/api/members?${params}`, { cache: 'no-store' })
      const data = await res.json()

      if (res.ok) {
        setMembers(data.members)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchMembers()
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

  const openChargeDialog = (member: Member) => {
    setChargeError('')
    setChargeDialog({
      open: true,
      member,
      method: 'PIX',
      referenceMonth: String(currentMonth),
      referenceYear: String(currentYear),
      amount: '',
      addrZip: '',
      addrStreet: '',
      addrNumber: '',
      addrNeighborhood: '',
      addrCity: '',
      addrFederalUnit: '',
    })
  }

  const submitCharge = async () => {
    if (!chargeDialog.member) return
    const member = chargeDialog.member
    setChargeError('')

    if (chargeDialog.method === 'BOLETO') {
      const missing: string[] = []
      if (!chargeDialog.addrZip) missing.push('CEP')
      if (!chargeDialog.addrStreet) missing.push('rua')
      if (!chargeDialog.addrNumber) missing.push('número')
      if (!chargeDialog.addrNeighborhood) missing.push('bairro')
      if (!chargeDialog.addrCity) missing.push('cidade')
      if (!chargeDialog.addrFederalUnit) missing.push('UF')
      if (missing.length) {
        setChargeError(`Endereço obrigatório para boleto. Preencha: ${missing.join(', ')}`)
        return
      }
    }

    setChargingId(member.id)
    try {
      const body: any = {
        method: chargeDialog.method,
        referenceMonth: Number(chargeDialog.referenceMonth),
        referenceYear: Number(chargeDialog.referenceYear),
      }
      if (chargeDialog.amount) body.amount = Number(chargeDialog.amount)
      if (chargeDialog.method === 'BOLETO') {
        body.address = {
          zipCode: chargeDialog.addrZip,
          streetName: chargeDialog.addrStreet,
          streetNumber: chargeDialog.addrNumber,
          neighborhood: chargeDialog.addrNeighborhood,
          city: chargeDialog.addrCity,
          federalUnit: chargeDialog.addrFederalUnit.toUpperCase(),
        }
      }

      const res = await fetch(`/api/members/${member.id}/charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao gerar cobrança')

      setChargeDialog((d) => ({ ...d, open: false }))

      if (data.method === 'PIX') {
        setPixDialog({
          open: true,
          qrCodeBase64: data.qrCodeBase64 || '',
          qrCode: data.qrCode || '',
          ticketUrl: data.ticketUrl || null,
          memberName: member.name,
          amount: data.amount || 0,
        })
      } else {
        setBoletoDialog({
          open: true,
          ticketUrl: data.ticketUrl || '',
          barcode: data.barcode || '',
          memberName: member.name,
          amount: data.amount || 0,
        })
      }
      fetchMembers()
    } catch (err: any) {
      setChargeError(err.message)
    } finally {
      setChargingId(null)
    }
  }

  const toggleMemberStatus = async (memberId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentStatus })
      })

      if (res.ok) {
        // Refresh the list
        fetchMembers()
      } else {
        console.error('Error toggling member status')
      }
    } catch (error) {
      console.error('Error toggling member status:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sócios Torcedores</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os sócios da Associação Atlética Guarany
          </p>
        </div>
        <Link href="/dashboard/socios/novo">
          <Button className="bg-gradient-to-r from-[#006437] to-[#0A6938] hover:from-[#005030] hover:to-[#006437]">
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Sócio
          </Button>
        </Link>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busque e filtre os sócios</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por nome, CPF ou telefone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit">
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => { setFilter('all'); setPage(1) }}
              >
                Todos
              </Button>
              <Button
                type="button"
                variant={filter === 'active' ? 'default' : 'outline'}
                onClick={() => { setFilter('active'); setPage(1) }}
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Ativos
              </Button>
              <Button
                type="button"
                variant={filter === 'inactive' ? 'default' : 'outline'}
                onClick={() => { setFilter('inactive'); setPage(1) }}
              >
                <UserX className="mr-2 h-4 w-4" />
                Inativos
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Sócios</CardTitle>
          <CardDescription>
            {loading ? 'Carregando...' : `${members.length} sócios encontrados`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#006437]" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum sócio encontrado</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Pendências</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{formatCPF(member.cpf)}</TableCell>
                      <TableCell>{formatPhone(member.phone)}</TableCell>
                      <TableCell>{formatDate(member.joinDate)}</TableCell>
                      <TableCell>
                        {member.payments.length > 0 ? (
                          <Badge variant="destructive">
                            {member.payments.length} pendente{member.payments.length > 1 ? 's' : ''}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            Em dia
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.active ? (
                          <Badge className="bg-emerald-600">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {member.active && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={chargingId === member.id}
                              onClick={() => openChargeDialog(member)}
                              title="Gerar cobrança via Mercado Pago"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              {chargingId === member.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <DollarSign className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleMemberStatus(member.id, member.active)}
                            title={member.active ? 'Desativar sócio' : 'Ativar sócio'}
                          >
                            {member.active ? (
                              <UserX className="h-4 w-4 text-orange-600" />
                            ) : (
                              <UserCheck className="h-4 w-4 text-emerald-600" />
                            )}
                          </Button>
                          <Link href={`/dashboard/socios/${member.id}`}>
                            <Button variant="ghost" size="sm" title="Ver detalhes">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Charge Dialog */}
      <Dialog
        open={chargeDialog.open}
        onOpenChange={(open) => setChargeDialog((d) => ({ ...d, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[#006437]" />
              Cobrar Sócio
            </DialogTitle>
            <DialogDescription>
              {chargeDialog.member
                ? `Gerar cobrança via Mercado Pago para ${chargeDialog.member.name}`
                : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {chargeError && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm">
                {chargeError}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Método</label>
              <Select
                value={chargeDialog.method}
                onValueChange={(v) =>
                  setChargeDialog((d) => ({ ...d, method: v as 'PIX' | 'BOLETO' }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PIX">
                    <span className="flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-blue-600" /> PIX (instantâneo)
                    </span>
                  </SelectItem>
                  <SelectItem value="BOLETO">
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-orange-600" /> Boleto
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mês de referência</label>
                <Select
                  value={chargeDialog.referenceMonth}
                  onValueChange={(v) =>
                    setChargeDialog((d) => ({ ...d, referenceMonth: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => (
                      <SelectItem key={i} value={String(i + 1)}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ano</label>
                <Select
                  value={chargeDialog.referenceYear}
                  onValueChange={(v) =>
                    setChargeDialog((d) => ({ ...d, referenceYear: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Valor (R$) — opcional</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Usa valor padrão das configurações se vazio"
                value={chargeDialog.amount}
                onChange={(e) =>
                  setChargeDialog((d) => ({ ...d, amount: e.target.value }))
                }
              />
            </div>

            {chargeDialog.method === 'BOLETO' && (
              <div className="space-y-3 border-t pt-3">
                <p className="text-sm font-semibold text-orange-700">
                  Endereço do pagador (obrigatório para boleto)
                </p>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">CEP *</label>
                    <Input
                      placeholder="00000-000"
                      value={chargeDialog.addrZip}
                      onChange={(e) =>
                        setChargeDialog((d) => ({ ...d, addrZip: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium">Rua *</label>
                    <Input
                      placeholder="Av. Brasil"
                      value={chargeDialog.addrStreet}
                      onChange={(e) =>
                        setChargeDialog((d) => ({ ...d, addrStreet: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium">Número *</label>
                    <Input
                      placeholder="123"
                      value={chargeDialog.addrNumber}
                      onChange={(e) =>
                        setChargeDialog((d) => ({ ...d, addrNumber: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium">Bairro *</label>
                    <Input
                      placeholder="Centro"
                      value={chargeDialog.addrNeighborhood}
                      onChange={(e) =>
                        setChargeDialog((d) => ({
                          ...d,
                          addrNeighborhood: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium">Cidade *</label>
                    <Input
                      placeholder="Sobral"
                      value={chargeDialog.addrCity}
                      onChange={(e) =>
                        setChargeDialog((d) => ({ ...d, addrCity: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium">UF *</label>
                    <Input
                      placeholder="CE"
                      maxLength={2}
                      value={chargeDialog.addrFederalUnit}
                      onChange={(e) =>
                        setChargeDialog((d) => ({
                          ...d,
                          addrFederalUnit: e.target.value.toUpperCase(),
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded text-xs text-blue-800">
              ✉️ O link de pagamento é enviado automaticamente via WhatsApp para o
              sócio. A confirmação do pagamento é registrada automaticamente pelo
              webhook do Mercado Pago.
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setChargeDialog((d) => ({ ...d, open: false }))}
              disabled={chargingId !== null}
            >
              Cancelar
            </Button>
            <Button
              onClick={submitCharge}
              disabled={chargingId !== null}
              className="bg-[#006437] hover:bg-[#005030]"
            >
              {chargingId !== null ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Gerar Cobrança
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PIX Result Dialog */}
      <Dialog
        open={pixDialog.open}
        onOpenChange={(open) => setPixDialog({ ...pixDialog, open })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-[#006437]" />
              Cobrança PIX gerada
            </DialogTitle>
            <DialogDescription>
              {pixDialog.memberName} —{' '}
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(pixDialog.amount)}
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
                <Input value={pixDialog.qrCode} readOnly className="font-mono text-xs" />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => navigator.clipboard.writeText(pixDialog.qrCode)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {pixDialog.ticketUrl && (
              <Button
                type="button"
                variant="outline"
                onClick={() => window.open(pixDialog.ticketUrl!, '_blank')}
                className="w-full"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir link de pagamento
              </Button>
            )}

            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded text-sm">
              <p className="text-emerald-800">
                ✓ Link enviado automaticamente para o sócio via WhatsApp.
                <br />A confirmação do pagamento é automática.
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

      {/* Boleto Result Dialog */}
      <Dialog
        open={boletoDialog.open}
        onOpenChange={(open) => setBoletoDialog({ ...boletoDialog, open })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              Boleto gerado
            </DialogTitle>
            <DialogDescription>
              {boletoDialog.memberName} —{' '}
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(boletoDialog.amount)}
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
                    onClick={() =>
                      navigator.clipboard.writeText(boletoDialog.barcode)
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded text-sm">
              <p className="text-emerald-800">
                ✓ Boleto enviado automaticamente para o sócio via WhatsApp.
                <br />Compensação leva 1-2 dias úteis após o pagamento.
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
    </div>
  )
}
