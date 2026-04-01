'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
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
  Loader2,
  Plus,
  UserCog,
  Shield,
  Edit,
  CheckCircle,
  XCircle,
} from 'lucide-react'

interface UserData {
  id: string
  name: string
  email: string
  role: string
  active: boolean
  createdAt: string
  _count: {
    membersCreated: number
    paymentsRegistered: number
    auditLogs: number
  }
}

export default function UsuariosPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'OPERATOR',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      if (res.ok) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      if (editingUser) {
        const body: any = { name: formData.name, email: formData.email, role: formData.role }
        if (formData.password) body.password = formData.password

        const res = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Erro ao atualizar')
      } else {
        if (!formData.password) {
          throw new Error('Senha obrigatoria para novo usuario')
        }
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Erro ao criar')
      }

      setShowDialog(false)
      setEditingUser(null)
      setFormData({ name: '', email: '', password: '', role: 'OPERATOR' })
      fetchUsers()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (user: UserData) => {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !user.active }),
      })
      if (res.ok) fetchUsers()
    } catch (error) {
      console.error('Error toggling user:', error)
    }
  }

  const openEditDialog = (user: UserData) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    })
    setError('')
    setShowDialog(true)
  }

  const openCreateDialog = () => {
    setEditingUser(null)
    setFormData({ name: '', email: '', password: '', role: 'OPERATOR' })
    setError('')
    setShowDialog(true)
  }

  const getRoleBadge = (role: string) => {
    const config: Record<string, { label: string; className: string }> = {
      SUPER_ADMIN: { label: 'Super Admin', className: 'bg-red-600 text-white' },
      ADMIN: { label: 'Admin', className: 'bg-purple-600 text-white' },
      FINANCIAL: { label: 'Financeiro', className: 'bg-blue-600 text-white' },
      ATTENDANT: { label: 'Atendimento', className: 'bg-green-600 text-white' },
      OPERATOR: { label: 'Operador', className: 'bg-gray-500 text-white' },
    }
    const c = config[role] || config.OPERATOR
    return <Badge className={c.className}>{c.label}</Badge>
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      SUPER_ADMIN: 'Super Admin',
      ADMIN: 'Admin',
      FINANCIAL: 'Financeiro',
      ATTENDANT: 'Atendimento',
      OPERATOR: 'Operador',
    }
    return labels[role] || role
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground mt-1">
            Gerenciar usuarios e permissoes do sistema
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-gradient-to-r from-[#006437] to-[#0A6938] hover:from-[#005030] hover:to-[#006437]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuario
        </Button>
      </div>

      {/* Roles Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#006437]" />
            Niveis de Acesso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <div className="p-3 rounded-lg border bg-red-50/50">
              <Badge className="bg-red-600 text-white mb-2">Super Admin</Badge>
              <p className="text-xs text-muted-foreground">Acesso total. Gerencia usuarios, logs e configuracoes.</p>
            </div>
            <div className="p-3 rounded-lg border bg-purple-50/50">
              <Badge className="bg-purple-600 text-white mb-2">Admin</Badge>
              <p className="text-xs text-muted-foreground">Gerencia socios, pagamentos, logs e configuracoes.</p>
            </div>
            <div className="p-3 rounded-lg border bg-blue-50/50">
              <Badge className="bg-blue-600 text-white mb-2">Financeiro</Badge>
              <p className="text-xs text-muted-foreground">Acesso a pagamentos, scores e relatorios financeiros.</p>
            </div>
            <div className="p-3 rounded-lg border bg-green-50/50">
              <Badge className="bg-green-600 text-white mb-2">Atendimento</Badge>
              <p className="text-xs text-muted-foreground">Cadastro de socios e consulta de informacoes.</p>
            </div>
            <div className="p-3 rounded-lg border bg-gray-50/50">
              <Badge className="bg-gray-500 text-white mb-2">Operador</Badge>
              <p className="text-xs text-muted-foreground">Acesso basico: visualizacao de dashboard e socios.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Usuarios</CardTitle>
              <CardDescription>{users.length} usuario(s) cadastrado(s)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#006437]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Socios</TableHead>
                    <TableHead className="text-center">Pagamentos</TableHead>
                    <TableHead className="text-center">Acoes</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className={!user.active ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-sm">{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-center">
                        {user.active ? (
                          <Badge className="bg-emerald-600 text-white">Ativo</Badge>
                        ) : (
                          <Badge className="bg-red-500 text-white">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-medium">{user._count.membersCreated}</TableCell>
                      <TableCell className="text-center font-medium">{user._count.paymentsRegistered}</TableCell>
                      <TableCell className="text-center font-medium text-muted-foreground">{user._count.auditLogs}</TableCell>
                      <TableCell className="text-sm">{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => openEditDialog(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user.id !== session?.user?.id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleActive(user)}
                              className={user.active ? 'text-red-500 hover:text-red-600' : 'text-emerald-500 hover:text-emerald-600'}
                            >
                              {user.active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                          )}
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

      {/* Create/Edit User Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Usuario' : 'Novo Usuario'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Altere os dados do usuario' : 'Cadastre um novo usuario no sistema'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Senha {editingUser ? '(deixe vazio para manter)' : '*'}
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="********"
                  required={!editingUser}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cargo *</label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {session?.user?.role === 'SUPER_ADMIN' && (
                      <>
                        <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </>
                    )}
                    <SelectItem value="FINANCIAL">Financeiro</SelectItem>
                    <SelectItem value="ATTENDANT">Atendimento</SelectItem>
                    <SelectItem value="OPERATOR">Operador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="bg-[#006437] hover:bg-[#005030]">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <UserCog className="mr-2 h-4 w-4" />
                    {editingUser ? 'Salvar' : 'Criar'}
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
