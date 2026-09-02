import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  useTelegramStatus,
  useGenerateLinkCode,
  useUnlinkTelegram,
  useUpdateDefaultFarm,
} from '../../../features/telegram/hooks/useTelegram'
import { useFarms } from '../../../features/farms/hooks/useFarms'
import { Button } from '../../../components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card'
import { toast } from 'sonner'

export const Route = createFileRoute('/_authenticated/settings/telegram')({
  component: TelegramSettingsPage,
})

function TelegramSettingsPage() {
  const { data } = useTelegramStatus() as { data?: { linked?: boolean; external_id?: string; linked_at?: string; default_farm_id?: number | null } }
  const farmsQ = useFarms()
  const gen = useGenerateLinkCode()
  const unlink = useUnlinkTelegram()
  const upd = useUpdateDefaultFarm()
  const [code, setCode] = useState<string | null>(null)
  const [secs, setSecs] = useState(60)

  useEffect(() => {
    if (!code) return
    const i = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) {
          setCode(null)
          return 60
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(i)
  }, [code])

  const linked = data?.linked

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Telegram</h1>
      {!linked ? (
        <Card>
          <CardHeader>
            <CardTitle>Hubungkan Telegram</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Generate kode 60 detik, kirim ke @HydroFarmBot.</p>
            <Button
              onClick={async () => {
                const r = await gen.mutateAsync() as { code: string }
                setCode(r.code)
                setSecs(60)
              }}
              disabled={gen.isPending}
            >
              Generate Kode
            </Button>
            {code && (
              <div className="rounded-xl bg-muted p-4 text-center">
                <p className="text-3xl font-mono tracking-widest">{code}</p>
                <p className="text-xs text-muted-foreground">Kadaluarsa {secs}s — Generate ulang jika habis</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>✅ Terhubung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              Chat ID: {data?.external_id} — Sejak {data?.linked_at}
            </p>
            <select
              value={data?.default_farm_id ?? ''}
              onChange={(e) => upd.mutate(Number(e.target.value))}
              className="w-full rounded border p-2"
            >
              <option value="">Pilih farm utama (opsional)</option>
              {farmsQ.data?.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <Button
              variant="destructive"
              onClick={() => unlink.mutate(undefined, { onSuccess: () => toast.success('Tautan diputus') })}
            >
              Putuskan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
