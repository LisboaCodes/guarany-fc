'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  Loader2,
  Search,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  BarChart3,
  Users,
} from 'lucide-react'

interface ScoreEntry {
  memberId: string
  memberName: string
  memberCpf: string
  memberPhone: string
  score: number
  classification: string
  risk: string
  stats: {
    totalPayments: number
    paid: number
    overdue: number
    pending: number
    cancelled: number
    missing: number
    expectedPayments: number
    onTimeRate: number
    lateRate: number
    consecutivePaid: number
    monthsSinceJoin: number
  }
}

interface Summary {
  total: number
  goodPayers: number
  mediumRisk: number
  highRisk: number
  averageScore: number
}

export default function ScorePage() {
  const [scores, setScores] = useState<ScoreEntry[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [riskFilter, setRiskFilter] = useState<string>('all')

  useEffect(() => {
    fetchScores()
  }, [])

  const fetchScores = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/members/score')
      const data = await res.json()
      if (res.ok) {
        setScores(data.scores)
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Error fetching scores:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredScores = scores.filter(s => {
    if (riskFilter !== 'all' && s.risk !== riskFilter) return false
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return s.memberName.toLowerCase().includes(term) || s.memberCpf.includes(searchTerm.replace(/\D/g, ''))
    }
    return true
  })

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-600'
    if (score >= 40) return 'text-amber-500'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-emerald-100'
    if (score >= 40) return 'bg-amber-100'
    return 'bg-red-100'
  }

  const getRiskBadge = (risk: string, classification: string) => {
    const config: Record<string, { className: string; icon: any }> = {
      LOW: { className: 'bg-emerald-600 text-white', icon: ShieldCheck },
      MEDIUM: { className: 'bg-amber-500 text-white', icon: AlertTriangle },
      HIGH: { className: 'bg-red-600 text-white', icon: TrendingDown },
    }
    const c = config[risk] || config.MEDIUM
    const Icon = c.icon
    return (
      <Badge className={c.className}>
        <Icon className="mr-1 h-3 w-3" />
        {classification}
      </Badge>
    )
  }

  const getRowBg = (risk: string) => {
    if (risk === 'HIGH') return 'bg-red-50/50'
    if (risk === 'MEDIUM') return 'bg-amber-50/50'
    return ''
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Score de Inadimplencia</h1>
        <p className="text-muted-foreground mt-1">
          Classificacao dos socios por risco de inadimplencia
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Score Medio</p>
                  <p className={`text-3xl font-bold ${getScoreColor(summary.averageScore)}`}>
                    {summary.averageScore}
                  </p>
                </div>
                <div className={`h-12 w-12 rounded-full ${getScoreBg(summary.averageScore)} flex items-center justify-center`}>
                  <BarChart3 className={`h-6 w-6 ${getScoreColor(summary.averageScore)}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bons Pagadores</p>
                  <p className="text-3xl font-bold text-emerald-600">{summary.goodPayers}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Risco Medio</p>
                  <p className="text-3xl font-bold text-amber-500">{summary.mediumRisk}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Alto Risco</p>
                  <p className="text-3xl font-bold text-red-600">{summary.highRisk}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant={riskFilter === 'all' ? 'default' : 'outline'} onClick={() => setRiskFilter('all')}>
                Todos
              </Button>
              <Button size="sm" variant={riskFilter === 'LOW' ? 'default' : 'outline'} onClick={() => setRiskFilter('LOW')}
                className={riskFilter === 'LOW' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}>
                <ShieldCheck className="mr-1 h-3 w-3" /> Bom Pagador
              </Button>
              <Button size="sm" variant={riskFilter === 'MEDIUM' ? 'default' : 'outline'} onClick={() => setRiskFilter('MEDIUM')}
                className={riskFilter === 'MEDIUM' ? 'bg-amber-500 hover:bg-amber-600' : ''}>
                <AlertTriangle className="mr-1 h-3 w-3" /> Risco Medio
              </Button>
              <Button size="sm" variant={riskFilter === 'HIGH' ? 'default' : 'outline'} onClick={() => setRiskFilter('HIGH')}
                className={riskFilter === 'HIGH' ? 'bg-red-600 hover:bg-red-700' : ''}>
                <TrendingDown className="mr-1 h-3 w-3" /> Alto Risco
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ranking de Socios</CardTitle>
              <CardDescription>{filteredScores.length} socio(s)</CardDescription>
            </div>
            <Badge variant="outline" className="text-[#006437] border-[#006437]">
              <Users className="mr-1 h-3 w-3" />
              {scores.length} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#006437]" />
            </div>
          ) : filteredScores.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum socio encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Socio</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead>Classificacao</TableHead>
                    <TableHead className="text-center">Pagos</TableHead>
                    <TableHead className="text-center">Atrasados</TableHead>
                    <TableHead className="text-center">Pendentes</TableHead>
                    <TableHead className="text-center">Faltantes</TableHead>
                    <TableHead className="text-center">Pontualidade</TableHead>
                    <TableHead className="text-center">Sequencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredScores.map((entry) => (
                    <TableRow key={entry.memberId} className={getRowBg(entry.risk)}>
                      <TableCell className="font-medium">{entry.memberName}</TableCell>
                      <TableCell className="text-sm">{formatCPF(entry.memberCpf)}</TableCell>
                      <TableCell className="text-center">
                        <span className={`text-lg font-bold ${getScoreColor(entry.score)}`}>
                          {entry.score}
                        </span>
                      </TableCell>
                      <TableCell>{getRiskBadge(entry.risk, entry.classification)}</TableCell>
                      <TableCell className="text-center font-medium text-emerald-600">{entry.stats.paid}</TableCell>
                      <TableCell className="text-center font-medium text-red-600">{entry.stats.overdue}</TableCell>
                      <TableCell className="text-center font-medium text-amber-500">{entry.stats.pending}</TableCell>
                      <TableCell className="text-center font-medium text-slate-500">{entry.stats.missing}</TableCell>
                      <TableCell className="text-center">
                        <span className={`font-medium ${entry.stats.onTimeRate >= 70 ? 'text-emerald-600' : entry.stats.onTimeRate >= 40 ? 'text-amber-500' : 'text-red-600'}`}>
                          {entry.stats.onTimeRate}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {entry.stats.consecutivePaid > 0 ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            {entry.stats.consecutivePaid}x
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
