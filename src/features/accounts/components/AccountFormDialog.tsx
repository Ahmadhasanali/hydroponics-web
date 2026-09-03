import { useState } from 'react'
import { Button } from '../../../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { useCreateAccount } from '../hooks/useAccounts'
import type { AccountType } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  farmId: number
}

export function AccountFormDialog({ open, onClose, farmId }: Props) {
  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('ewallet')
  const [initial, setInitial] = useState('')
  const createAccount = useCreateAccount()

  const canSubmit = name.trim() !== ''

  function submit() {
    if (!canSubmit) return
    createAccount.mutate(
      {
        farm_id: farmId,
        name: name.trim(),
        type,
        balance_initial: initial === '' ? undefined : Number(initial),
      },
      {
        onSuccess: () => {
          setName('')
          setInitial('')
          onClose()
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Tambah Akun</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nama akun</Label>
            <Input placeholder="mis. Dana, Gopay, BSI" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tipe</Label>
            <select className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={type} onChange={(e) => setType(e.target.value as AccountType)}>
              <option value="cash">Cash</option>
              <option value="ewallet">E-Wallet</option>
              <option value="bank">Bank</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Saldo awal (opsional)</Label>
            <Input inputMode="numeric" placeholder="0" value={initial} onChange={(e) => setInitial(e.target.value.replace(/[^0-9]/g, ''))} />
          </div>
          <Button className="w-full" disabled={!canSubmit || createAccount.isPending} onClick={submit}>
            {createAccount.isPending ? 'Menyimpan…' : 'Simpan Akun'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
