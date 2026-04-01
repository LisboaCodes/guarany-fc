'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  UserCog,
  DollarSign,
  Users,
  Settings,
  Shield,
} from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string | null
  changes: any
  ipAddress: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [entityFilter, setEntityFilter] = useState<string>('all')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  useEffect(() => {
    fetchLogs()
  }, [page, entityFilter])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '30' })
      if (entityFilter !== 'all') params.append('entityType', entityFilter)

      const res = await fetch(`/api/audit-logs?${params}`)
      const data = await res.json()
      if (res.ok) {
        setLogs(data.logs)
        setTotalPages(data.pagination.totalPages)
        setTotal(data.pagination.total)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR')
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'CREATE_PAYMENT': 'Criou Pagamento',
      'UPDATE_PAYMENT': 'Editou Pagamento',
      'CANCEL_PAYMENT': 'Cancelou Pagamento',
      'CREATE_MEMBER': 'Cadastrou Socio',
      'UPDATE_MEMBER': 'Editou Socio',
      'DELETE_MEMBER': 'Excluiu Socio',
      'CREATE_USER': 'Criou Usuario',
      'UPDATE_USER': 'Editou Usuario',
      'UPDATE': 'Atualizou',
      'DELETE': 'Excluiu',
      'CREATE': 'Criou',
    }
    return labels[action] || action
  }

  const getEntityIcon = (entityType: string) => {
    const icons: Record<string, any> = {
      'Payment': DollarSign,
      'Member': Users,
      'User': UserCog,
      'SystemSettings': Settings,
    }
    const Icon = icons[entityType] || FileText
    return <Icon className="h-4 w-4" />
  }

  const getEntityBadge = (entityType: string) => {
    const config: Record<string, string> = {
      'Payment': 'bg-blue-100 text-blue-700',
      'Member': 'bg-green-100 text-green-700',
      'User': 'bg-purple-100 text-purple-700',
      'SystemSettings': 'bg-orange-100 text-orange-700',
    }
    return config[entityType] || 'bg-gray-100 text-gray-700'
  }

  const getRoleBadge = (role: string) => {
    const config: Record<string, string> = {
      'SUPER_ADMIN': 'bg-red-100 text-red-700',
      'ADMIN': 'bg-purple-100 text-purple-700',
      'FINANCIAL': 'bg-blue-100 text-blue-700',
      'ATTENDANT': 'bg-green-100 text-green-700',
      'OPERATOR': 'bg-gray-100 text-gray-700',
    }
    return config[role] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Logs de Auditoria</h1>
        <p className="text-muted-foreground mt-1">
          Registro completo de todas as acoes no sistema
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtrar por:</span>
            </div>
            <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo de entidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Payment">Pagamentos</SelectItem>
                <SelectItem value="Member">Socios</SelectItem>
                <SelectItem value="User">Usuarios</SelectItem>
                <SelectItem value="SystemSettings">Configuracoes</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1" />
            <Badge variant="outline" className="text-[#006437] border-[#006437]">
              <FileText className="mr-1 h-3 w-3" />
              {total} registro(s)
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historico de Acoes</CardTitle>
          <CardDescription>Quem fez o que e quando</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#006437]" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum log encontrado</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Acao</TableHead>
                      <TableHead>Entidade</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm whitespace-nowrap">{formatDate(log.createdAt)}</TableCell>
                        <TableCell className="font-medium">{log.user.name}</TableCell>
                        <TableCell>
                          <Badge className={getRoleBadge(log.user.role)} variant="outline">
                            {log.user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{getActionLabel(log.action)}</TableCell>
                        <TableCell>
                          <Badge className={getEntityBadge(log.entityType)} variant="outline">
                            {getEntityIcon(log.entityType)}
                            <span className="ml-1">{log.entityType}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {log.entityId ? log.entityId.substring(0, 8) + '...' : '-'}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => setSelectedLog(log)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Pagina {page} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Log Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Log</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Data/Hora</p>
                  <p className="font-medium">{formatDate(selectedLog.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Usuario</p>
                  <p className="font-medium">{selectedLog.user.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedLog.user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Acao</p>
                  <p className="font-medium">{getActionLabel(selectedLog.action)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Entidade</p>
                  <p className="font-medium">{selectedLog.entityType} {selectedLog.entityId && `(${selectedLog.entityId})`}</p>
                </div>
              </div>
              {selectedLog.changes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Dados alterados</p>
                  <pre className="bg-slate-50 border rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedLog.changes, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
