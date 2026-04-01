'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  LayoutDashboard,
  Users,
  DollarSign,
  BarChart3,
  MessageSquare,
  FileText,
  UserCog,
  Settings,
  Search,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  BookOpen,
  Smartphone,
  CreditCard,
  Bell,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  Ban,
  QrCode,
  Plus,
  Edit,
  XCircle,
  TrendingUp,
  Eye,
  Calendar,
  Wifi,
} from 'lucide-react'

interface Section {
  id: string
  title: string
  icon: any
  color: string
  description: string
  items: {
    question: string
    answer: string
  }[]
}

const sections: Section[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    color: 'bg-blue-100 text-blue-600',
    description: 'Tela inicial com resumo geral do sistema',
    items: [
      {
        question: 'O que e o Dashboard?',
        answer: 'O Dashboard e a tela principal do sistema. Ele mostra um resumo completo com: total de socios ativos, total de pagamentos recebidos, pagamentos pendentes e o valor total arrecadado no mes. Tambem mostra o status dos servicos (Autenticacao, Banco de Dados e API WhatsApp).'
      },
      {
        question: 'O que significam os cards coloridos?',
        answer: 'Cada card mostra uma informacao importante:\n\n- Card verde "Total de Socios": Quantidade de socios ativos cadastrados no sistema.\n- Card azul "Pagamentos": Total de pagamentos ja realizados.\n- Card amarelo "Pendentes": Pagamentos que ainda nao foram feitos.\n- Card roxo "Arrecadado": Valor total em dinheiro recebido no mes atual.'
      },
      {
        question: 'O que significa o status dos servicos?',
        answer: 'Na parte inferior do Dashboard voce ve 3 indicadores:\n\n- Autenticacao (verde = Ativo): O sistema de login esta funcionando.\n- Banco de Dados (azul = Online): A conexao com o banco de dados esta ok.\n- API WhatsApp (verde = Ativo): A integracao com WhatsApp esta configurada.\n\nSe algum estiver vermelho ou cinza, entre em contato com o suporte tecnico.'
      },
    ]
  },
  {
    id: 'socios',
    title: 'Socios',
    icon: Users,
    color: 'bg-green-100 text-green-600',
    description: 'Cadastro e gestao dos socios torcedores',
    items: [
      {
        question: 'Como cadastrar um novo socio?',
        answer: 'Na pagina de Socios, clique no botao verde "Novo Socio" no canto superior direito. Preencha os dados obrigatorios:\n\n- Nome completo\n- CPF (apenas numeros)\n- Data de nascimento\n- Telefone/WhatsApp (com DDD)\n- Email (opcional)\n- Endereco (opcional)\n\nClique em "Cadastrar" para salvar. O socio recebera automaticamente uma mensagem de boas-vindas no WhatsApp se estiver conectado.'
      },
      {
        question: 'Como editar os dados de um socio?',
        answer: 'Na lista de socios, clique no botao de editar (icone de lapis) na coluna "Acoes" do socio desejado. Altere os dados necessarios e clique em "Salvar". Todas as alteracoes sao registradas no log de auditoria.'
      },
      {
        question: 'Como desativar um socio?',
        answer: 'Na lista de socios, clique no botao vermelho (icone X) na coluna "Acoes". O socio sera marcado como inativo e nao aparecera mais nas listagens principais. Ele nao sera excluido, apenas desativado, podendo ser reativado depois.'
      },
      {
        question: 'Como buscar um socio?',
        answer: 'Use o campo de busca no topo da pagina. Voce pode buscar por nome ou CPF. A busca e feita em tempo real conforme voce digita.'
      },
    ]
  },
  {
    id: 'pagamentos',
    title: 'Pagamentos',
    icon: DollarSign,
    color: 'bg-emerald-100 text-emerald-600',
    description: 'Controle completo de mensalidades',
    items: [
      {
        question: 'Como funciona a tela de pagamentos?',
        answer: 'A tela de pagamentos mostra TODOS os meses de cada socio. Para cada mes, o sistema mostra automaticamente:\n\n- PAGO (verde): O socio ja pagou aquele mes.\n- PENDENTE (amarelo): O pagamento ainda esta dentro do prazo.\n- ATRASADO (vermelho): O vencimento ja passou e o socio nao pagou.\n- CANCELADO (cinza): O pagamento foi cancelado.\n\nMeses que nao tem pagamento registrado aparecem automaticamente como pendente ou atrasado.'
      },
      {
        question: 'Como registrar um pagamento?',
        answer: 'Existem 2 formas:\n\n1. Botao "Registrar Pagamento" (canto superior direito): Abre um formulario completo onde voce escolhe o socio, mes, valor, metodo e status.\n\n2. Botao "Registrar" na tabela: Aparece nos meses que ainda nao tem pagamento. Ja vem preenchido com os dados do socio e mes, so confirmar.\n\nApos registrar, o socio recebe uma notificacao automatica no WhatsApp.'
      },
      {
        question: 'Como marcar um pagamento como pago?',
        answer: 'Na tabela, pagamentos pendentes ou atrasados tem o botao "Marcar Pago". Clique nele e o status muda automaticamente para Pago com a data atual. O socio recebe confirmacao no WhatsApp.'
      },
      {
        question: 'Como filtrar pagamentos?',
        answer: 'Voce tem 3 tipos de filtro:\n\n- Ano: Use as setas < > para navegar entre anos.\n- Busca: Digite o nome ou CPF do socio.\n- Status: Clique em "Todos", "Pagos", "Pendentes", "Atrasados" ou "Cancelados".\n\nOs cards no topo mostram o resumo com quantidades e valores.'
      },
      {
        question: 'Quais metodos de pagamento estao disponiveis?',
        answer: 'O sistema aceita 4 metodos:\n\n- PIX: Pagamento via PIX\n- Dinheiro: Pagamento em especie\n- Cartao: Pagamento por cartao de credito/debito\n- Boleto: Pagamento via boleto bancario\n\nO metodo e apenas para registro/controle. O sistema nao processa pagamentos automaticamente.'
      },
    ]
  },
  {
    id: 'score',
    title: 'Score de Inadimplencia',
    icon: BarChart3,
    color: 'bg-purple-100 text-purple-600',
    description: 'Classificacao de risco dos socios',
    items: [
      {
        question: 'O que e o Score de Inadimplencia?',
        answer: 'E um sistema de pontuacao de 0 a 100 que classifica cada socio com base no historico de pagamentos. Quanto MAIOR o score, MELHOR o pagador.\n\n- 70 a 100 = Bom Pagador (verde): Socio em dia, risco baixo.\n- 40 a 69 = Risco Medio (amarelo): Socio com alguns atrasos, requer atencao.\n- 0 a 39 = Alto Risco (vermelho): Socio com muitos atrasos, risco de perda.'
      },
      {
        question: 'Como o score e calculado?',
        answer: 'O score considera:\n\n- Pagamentos realizados: +2 pontos cada\n- Pagamentos pendentes: -5 pontos cada\n- Pagamentos atrasados: -15 pontos cada\n- Pagamentos faltantes (sem registro): -20 pontos cada\n\nO sistema tambem mostra a taxa de pontualidade (%) e a sequencia de pagamentos consecutivos.'
      },
      {
        question: 'Para que serve o score?',
        answer: 'O score ajuda o clube a:\n\n- Identificar socios com risco de cancelamento ANTES que aconteca\n- Priorizar acoes de cobranca para socios de alto risco\n- Reconhecer e valorizar bons pagadores\n- Tomar decisoes baseadas em dados sobre a saude financeira do quadro social'
      },
      {
        question: 'O que significa cada coluna da tabela?',
        answer: '- Socio: Nome do socio\n- CPF: Documento do socio\n- Score: Pontuacao de 0 a 100\n- Classificacao: Bom Pagador / Risco Medio / Alto Risco\n- Pagos: Quantos pagamentos foram feitos\n- Atrasados: Quantos estao em atraso\n- Pendentes: Quantos estao aguardando\n- Faltantes: Meses sem nenhum registro\n- Pontualidade: Percentual de pagamentos em dia\n- Sequencia: Quantos meses consecutivos pagou'
      },
    ]
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    icon: MessageSquare,
    color: 'bg-green-100 text-green-600',
    description: 'Conexao e envio automatico de mensagens',
    items: [
      {
        question: 'Como conectar o WhatsApp?',
        answer: 'Acesse a pagina "WhatsApp" no menu. Siga os passos:\n\n1. Clique em "Gerar QR Code"\n2. Abra o WhatsApp no seu celular\n3. Va em Menu (3 pontinhos) > Aparelhos conectados > Conectar um aparelho\n4. Aponte a camera para o QR Code na tela\n5. Aguarde a conexao ser confirmada (o sistema detecta automaticamente)\n\nUse o numero que o clube quer que envie as mensagens.'
      },
      {
        question: 'Que mensagens o sistema envia automaticamente?',
        answer: 'O sistema envia 4 tipos de mensagem:\n\n1. Confirmacao de pagamento: Quando um pagamento e registrado, o socio recebe confirmacao.\n2. Lembrete de vencimento: X dias antes do vencimento, o socio recebe um lembrete.\n3. Aviso de atraso: Quando o pagamento vence sem ser pago.\n4. Feliz aniversario: No dia do aniversario do socio.\n\nTodas as mensagens sao enviadas automaticamente, sem precisar fazer nada.'
      },
      {
        question: 'O QR Code expirou, o que fazer?',
        answer: 'Clique em "Gerar novo QR Code". Um novo QR sera gerado. O QR Code expira apos alguns minutos, entao escaneie rapidamente apos gerar.'
      },
      {
        question: 'Como desconectar o WhatsApp?',
        answer: 'Na pagina WhatsApp, quando estiver conectado, clique no botao "Desconectar". Isso remove a sessao do WhatsApp do sistema. Para reconectar, basta gerar um novo QR Code e escanear novamente.'
      },
      {
        question: 'O WhatsApp desconectou sozinho?',
        answer: 'Isso pode acontecer se:\n\n- O celular ficou sem internet por muito tempo\n- Voce deslogou pelo celular em "Aparelhos conectados"\n- O WhatsApp foi atualizado\n\nPara resolver, basta acessar a pagina WhatsApp e gerar um novo QR Code para reconectar.'
      },
    ]
  },
  {
    id: 'logs',
    title: 'Logs de Auditoria',
    icon: FileText,
    color: 'bg-orange-100 text-orange-600',
    description: 'Registro de todas as acoes no sistema (Admin)',
    items: [
      {
        question: 'O que sao os Logs de Auditoria?',
        answer: 'Os logs registram TUDO que acontece no sistema: quem fez, o que fez e quando fez. E como uma "camera de seguranca" digital do sistema.\n\nExemplo: "Joao criou o pagamento do socio Pedro em 15/03/2026 as 14:30".'
      },
      {
        question: 'Quem pode ver os logs?',
        answer: 'Apenas usuarios com cargo Admin ou Super Admin tem acesso a pagina de Logs. Usuarios com outros cargos nao veem essa opcao no menu.'
      },
      {
        question: 'Como filtrar os logs?',
        answer: 'Use o filtro "Tipo de entidade" para ver apenas:\n\n- Pagamentos: Acoes relacionadas a pagamentos\n- Socios: Cadastros e alteracoes de socios\n- Usuarios: Criacao e edicao de usuarios do sistema\n- Configuracoes: Alteracoes nas configuracoes\n\nClique no icone de "olho" para ver os detalhes completos de cada acao.'
      },
    ]
  },
  {
    id: 'usuarios',
    title: 'Usuarios e Permissoes',
    icon: UserCog,
    color: 'bg-red-100 text-red-600',
    description: 'Gestao de usuarios e niveis de acesso (Admin)',
    items: [
      {
        question: 'Quais sao os niveis de acesso?',
        answer: 'O sistema tem 5 niveis de permissao:\n\n1. Super Admin: Acesso TOTAL. Pode criar/editar admins, ver logs, gerenciar tudo.\n2. Admin: Gerencia socios, pagamentos, logs e configuracoes. Nao pode criar super admins.\n3. Financeiro: Acesso a pagamentos, scores e relatorios financeiros.\n4. Atendimento: Cadastro de socios e consulta de informacoes basicas.\n5. Operador: Apenas visualizacao do dashboard e lista de socios.'
      },
      {
        question: 'Como criar um novo usuario?',
        answer: 'Na pagina Usuarios, clique em "Novo Usuario". Preencha:\n\n- Nome completo\n- Email (sera usado para login)\n- Senha\n- Cargo (nivel de acesso)\n\nClique em "Criar". O novo usuario ja pode fazer login imediatamente.'
      },
      {
        question: 'Como alterar a senha de um usuario?',
        answer: 'Na lista de usuarios, clique no icone de editar (lapis). No campo "Senha", digite a nova senha. Se deixar o campo vazio, a senha atual sera mantida.'
      },
      {
        question: 'Como desativar um usuario?',
        answer: 'Na lista de usuarios, clique no icone vermelho (X) na coluna Acoes. O usuario sera desativado e nao conseguira mais fazer login. Para reativar, clique no icone verde (check).\n\nVoce nao pode desativar a si mesmo.'
      },
    ]
  },
  {
    id: 'configuracoes',
    title: 'Configuracoes',
    icon: Settings,
    color: 'bg-slate-100 text-slate-600',
    description: 'Valores, modulos e configuracoes gerais',
    items: [
      {
        question: 'Como alterar o valor da mensalidade?',
        answer: 'Na pagina Configuracoes, no card "Configuracoes Financeiras":\n\n1. Altere o campo "Valor da Mensalidade (R$)" para o novo valor.\n2. Clique em "Salvar Alteracoes".\n\nO novo valor sera usado para todos os proximos pagamentos. Pagamentos ja registrados nao sao alterados.'
      },
      {
        question: 'Como alterar o dia de vencimento?',
        answer: 'Na pagina Configuracoes, no card "Configuracoes Financeiras":\n\n1. Altere o campo "Dia de Vencimento" (1 a 31).\n2. Clique em "Salvar Alteracoes".\n\nO novo dia sera usado como referencia para calcular vencimentos futuros.'
      },
      {
        question: 'O que sao os Modulos Adicionais?',
        answer: 'Sao funcionalidades extras do sistema. Os modulos ativos ja estao funcionando:\n\n- Hospedagem do Sistema (R$ 39,90): Servidor dedicado com backup e SSL.\n- Subdominio Personalizado (R$ 9,90): Endereco exclusivo do sistema.\n- WhatsApp Evolution API (R$ 29,90): Envio automatico de mensagens.\n- Mensagens de Aniversario (R$ 19,90): Parabens automatico.\n- Lembretes de Pagamento (R$ 19,90): Avisos de vencimento.\n\nModulos "Em Breve" ainda estao em desenvolvimento.'
      },
    ]
  },
]

export default function SuportePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleItem = (key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const filteredSections = sections.map(section => ({
    ...section,
    items: section.items.filter(item =>
      !searchTerm ||
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.items.length > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#006437]/10 mb-4">
          <HelpCircle className="h-8 w-8 text-[#006437]" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Central de Suporte</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Guia completo de como usar cada funcao do sistema. Encontre respostas para suas duvidas de forma rapida e simples.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar ajuda... ex: como cadastrar socio"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 text-base rounded-xl"
          />
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {sections.map(section => {
          const Icon = section.icon
          return (
            <button
              key={section.id}
              onClick={() => {
                setOpenSections(prev => ({ ...prev, [section.id]: true }))
                document.getElementById(`section-${section.id}`)?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="flex items-center gap-3 p-3 rounded-lg border hover:border-[#006437]/50 hover:bg-[#006437]/5 transition-colors text-left"
            >
              <div className={`p-2 rounded-lg ${section.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{section.title}</p>
                <p className="text-xs text-muted-foreground">{section.items.length} topico(s)</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* FAQ Sections */}
      <div className="space-y-4">
        {filteredSections.map(section => {
          const Icon = section.icon
          const isOpen = openSections[section.id] || !!searchTerm

          return (
            <Card key={section.id} id={`section-${section.id}`}>
              <CardHeader
                className="cursor-pointer hover:bg-accent/50 transition-colors rounded-t-lg"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${section.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{section.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{section.items.length} topico(s)</Badge>
                    {isOpen ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {isOpen && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {section.items.map((item, idx) => {
                      const itemKey = `${section.id}-${idx}`
                      const itemOpen = openItems[itemKey] || !!searchTerm

                      return (
                        <div
                          key={idx}
                          className="border rounded-lg overflow-hidden"
                        >
                          <button
                            onClick={() => toggleItem(itemKey)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-6 w-6 rounded-full bg-[#006437]/10 flex items-center justify-center flex-shrink-0">
                                <BookOpen className="h-3 w-3 text-[#006437]" />
                              </div>
                              <span className="font-medium text-sm">{item.question}</span>
                            </div>
                            {itemOpen ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                          </button>

                          {itemOpen && (
                            <div className="px-4 pb-4 pt-0">
                              <div className="ml-9 p-4 bg-slate-50 rounded-lg">
                                {item.answer.split('\n\n').map((paragraph, pIdx) => (
                                  <div key={pIdx} className={pIdx > 0 ? 'mt-3' : ''}>
                                    {paragraph.startsWith('- ') ? (
                                      <ul className="space-y-1.5">
                                        {paragraph.split('\n').map((line, lIdx) => (
                                          <li key={lIdx} className="flex items-start gap-2 text-sm text-slate-700">
                                            <CheckCircle className="h-3.5 w-3.5 text-[#006437] mt-0.5 flex-shrink-0" />
                                            <span>{line.replace(/^- /, '')}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    ) : paragraph.match(/^\d\./) ? (
                                      <ol className="space-y-1.5">
                                        {paragraph.split('\n').map((line, lIdx) => (
                                          <li key={lIdx} className="flex items-start gap-2 text-sm text-slate-700">
                                            <span className="flex-shrink-0 h-5 w-5 rounded-full bg-[#006437] text-white flex items-center justify-center text-xs font-bold">
                                              {line.match(/^(\d)/)?.[1] || lIdx + 1}
                                            </span>
                                            <span>{line.replace(/^\d+\.\s*/, '')}</span>
                                          </li>
                                        ))}
                                      </ol>
                                    ) : (
                                      <p className="text-sm text-slate-700 leading-relaxed">{paragraph}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Contact Support */}
      <Card className="bg-gradient-to-r from-[#006437]/10 to-[#0A6938]/10 border-[#006437]/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#25D366]">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Ainda precisa de ajuda?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Entre em contato com o suporte tecnico pelo WhatsApp
              </p>
            </div>
            <button
              onClick={() => {
                const message = 'Ola! Preciso de ajuda com o sistema AA Guarany FC.'
                window.open(`https://wa.me/557999062129?text=${encodeURIComponent(message)}`, '_blank')
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1fb355] text-white rounded-lg font-medium transition-colors"
            >
              <Smartphone className="h-4 w-4" />
              Falar com Suporte
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
