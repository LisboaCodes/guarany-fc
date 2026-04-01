'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  MessageSquare,
  CheckCircle,
  XCircle,
  RefreshCw,
  Smartphone,
  Wifi,
  WifiOff,
  QrCode,
  Unplug,
} from 'lucide-react'

export default function WhatsAppPage() {
  const [status, setStatus] = useState<{
    connected: boolean
    state: string
    instance?: string
    message?: string
  } | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loadingQr, setLoadingQr] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/status')
      const data = await res.json()
      setStatus(data)

      if (data.connected) {
        setQrCode(null)
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }
      }
    } catch (error) {
      console.error('Error checking status:', error)
    } finally {
      setLoadingStatus(false)
    }
  }, [])

  useEffect(() => {
    checkStatus()
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [checkStatus])

  const fetchQrCode = async () => {
    setLoadingQr(true)
    try {
      const res = await fetch('/api/whatsapp/qrcode')
      const data = await res.json()

      if (data.qrcode) {
        const base64 = data.qrcode.startsWith('data:')
          ? data.qrcode
          : `data:image/png;base64,${data.qrcode}`
        setQrCode(base64)

        // Start polling for connection status
        if (pollingRef.current) clearInterval(pollingRef.current)
        pollingRef.current = setInterval(checkStatus, 3000)
      } else {
        setQrCode(null)
      }
    } catch (error) {
      console.error('Error fetching QR:', error)
    } finally {
      setLoadingQr(false)
    }
  }

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      await fetch('/api/whatsapp/disconnect', { method: 'POST' })
      setStatus({ connected: false, state: 'close' })
      setQrCode(null)
    } catch (error) {
      console.error('Error disconnecting:', error)
    } finally {
      setDisconnecting(false)
    }
  }

  const refreshQr = () => {
    setQrCode(null)
    fetchQrCode()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp</h1>
        <p className="text-muted-foreground mt-1">
          Conecte o WhatsApp para envio automatico de notificacoes
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${status?.connected ? 'bg-emerald-100' : 'bg-red-100'}`}>
                <MessageSquare className={`h-6 w-6 ${status?.connected ? 'text-emerald-600' : 'text-red-600'}`} />
              </div>
              <div>
                <CardTitle>Status da Conexao</CardTitle>
                <CardDescription>
                  {status?.instance ? `Instancia: ${status.instance}` : 'Evolution API'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={checkStatus} disabled={loadingStatus}>
                <RefreshCw className={`h-4 w-4 mr-1 ${loadingStatus ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              {status?.connected ? (
                <Badge className="bg-emerald-600 text-white text-sm px-3 py-1">
                  <Wifi className="mr-1 h-4 w-4" />
                  Conectado
                </Badge>
              ) : (
                <Badge className="bg-red-500 text-white text-sm px-3 py-1">
                  <WifiOff className="mr-1 h-4 w-4" />
                  Desconectado
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Code Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <QrCode className="h-5 w-5 text-[#006437]" />
              <div>
                <CardTitle>Conectar WhatsApp</CardTitle>
                <CardDescription>
                  Escaneie o QR Code com seu WhatsApp
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {status?.connected ? (
              <div className="text-center py-8 space-y-4">
                <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <CheckCircle className="h-10 w-10 text-emerald-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-emerald-600">WhatsApp Conectado!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    O sistema esta pronto para enviar mensagens automaticas.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  {disconnecting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Unplug className="mr-2 h-4 w-4" />
                  )}
                  Desconectar
                </Button>
              </div>
            ) : qrCode ? (
              <div className="text-center space-y-4">
                <div className="bg-white p-4 rounded-xl border-2 border-dashed border-[#006437]/30 inline-block">
                  <img
                    src={qrCode}
                    alt="QR Code WhatsApp"
                    className="w-64 h-64 mx-auto"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#006437]">
                    Aguardando leitura do QR Code...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Abra o WhatsApp no celular &gt; Menu &gt; Aparelhos conectados &gt; Conectar
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={refreshQr} disabled={loadingQr}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${loadingQr ? 'animate-spin' : ''}`} />
                  Gerar novo QR Code
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                  <Smartphone className="h-10 w-10 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium">WhatsApp nao conectado</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Clique no botao abaixo para gerar o QR Code
                  </p>
                </div>
                <Button
                  onClick={fetchQrCode}
                  disabled={loadingQr}
                  className="bg-[#25D366] hover:bg-[#1fb355] text-white"
                >
                  {loadingQr ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <QrCode className="mr-2 h-4 w-4" />
                  )}
                  Gerar QR Code
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-[#006437]" />
              <div>
                <CardTitle>Como conectar</CardTitle>
                <CardDescription>Passo a passo</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#006437] text-white flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Clique em "Gerar QR Code"</p>
                  <p className="text-sm text-muted-foreground">O sistema vai gerar um QR Code unico</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#006437] text-white flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Abra o WhatsApp no celular</p>
                  <p className="text-sm text-muted-foreground">Use o numero que vai enviar as mensagens</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#006437] text-white flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Acesse "Aparelhos conectados"</p>
                  <p className="text-sm text-muted-foreground">Menu (3 pontinhos) &gt; Aparelhos conectados &gt; Conectar um aparelho</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#006437] text-white flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <div>
                  <p className="font-medium">Escaneie o QR Code</p>
                  <p className="text-sm text-muted-foreground">Aponte a camera para o QR Code na tela</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="text-sm font-medium text-emerald-800">Apos conectar, o sistema envia automaticamente:</p>
                <ul className="mt-2 space-y-1 text-sm text-emerald-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    Notificacoes de pagamento
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    Mensagens de aniversario
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    Lembretes de vencimento
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    Avisos de atraso
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
