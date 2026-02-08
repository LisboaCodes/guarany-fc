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
  UserPlus,
  Search,
  Eye,
  UserX,
  UserCheck,
  AlertCircle,
  Loader2
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

export default function SociosPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

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

      const res = await fetch(`/api/members?${params}`)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sócios Torcedores</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os sócios do Guarany FC
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
                        <Link href={`/dashboard/socios/${member.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
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
    </div>
  )
}
