import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { useCreateCustomer, useCreateProduct, useCustomers, useProducts } from '../hooks/useSalesData'
import { formatRupiah } from '../../finance/utils/format'

interface Props {
  open: boolean
  onClose: () => void
  farmId: number
}

export function CustomerProductManager({ open, onClose, farmId }: Props) {
  const [tab, setTab] = useState<'customers' | 'products'>('customers')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [unit, setUnit] = useState<'kg' | 'pcs'>('kg')
  const [price, setPrice] = useState('')
  const createCustomer = useCreateCustomer()
  const createProduct = useCreateProduct()
  const { data: customers = [] } = useCustomers(farmId)
  const { data: products = [] } = useProducts(farmId)

  function submit() {
    if (tab === 'customers') {
      if (name.trim() === '') return
      createCustomer.mutate(
        { farm_id: farmId, name: name.trim(), phone: phone.trim() || undefined, address: address.trim() || undefined },
        {
          onSuccess: () => {
            setName('')
            setPhone('')
            setAddress('')
          },
        },
      )
      return
    }

    if (name.trim() === '' || Number(price) <= 0) return
    createProduct.mutate(
      { farm_id: farmId, name: name.trim(), unit, default_price: Number(price) },
      {
        onSuccess: () => {
          setName('')
          setPrice('')
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Kelola Pelanggan & Produk</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setTab('customers')}
              className={tab === 'customers' ? 'rounded-xl bg-secondary/15 px-3 py-2 font-semibold text-secondary' : 'rounded-xl px-3 py-2 text-muted-foreground'}>
              Pelanggan
            </button>
            <button type="button" onClick={() => setTab('products')}
              className={tab === 'products' ? 'rounded-xl bg-secondary/15 px-3 py-2 font-semibold text-secondary' : 'rounded-xl px-3 py-2 text-muted-foreground'}>
              Produk
            </button>
          </div>

          {tab === 'customers' ? (
            <>
              <ul className="max-h-40 space-y-1 overflow-auto">
                {customers.map((c) => (
                  <li key={c.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                    <span>{c.name}</span>
                    {c.phone ? <span className="text-xs text-muted-foreground">{c.phone}</span> : null}
                  </li>
                ))}
              </ul>
              <div className="space-y-1.5">
                <Label>Nama warung/toko</Label>
                <Input placeholder="Warung Bu Siti" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Telepon (opsional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <Input placeholder="Alamat (opsional)" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <Button className="w-full" disabled={name.trim() === '' || createCustomer.isPending} onClick={submit}>
                <Plus className="size-4" /> Tambah Pelanggan
              </Button>
            </>
          ) : (
            <>
              <ul className="max-h-40 space-y-1 overflow-auto">
                {products.map((p) => (
                  <li key={p.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                    <span>{p.name} ({p.unit})</span>
                    <span className="font-semibold">{formatRupiah(p.default_price)}</span>
                  </li>
                ))}
                {products.length === 0 ? (
                  <li className="px-3 py-4 text-center text-sm text-muted-foreground">Belum ada produk.</li>
                ) : null}
              </ul>
              <div className="space-y-1.5">
                <Label>Nama produk</Label>
                <Input placeholder="Selada" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label>Satuan</Label>
                  <select className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                    value={unit} onChange={(e) => setUnit(e.target.value as 'kg' | 'pcs')}>
                    <option value="kg">kg</option>
                    <option value="pcs">pcs</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Harga default</Label>
                  <Input inputMode="numeric" placeholder="21000" value={price}
                    onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ''))} />
                </div>
              </div>
              <Button className="w-full" disabled={name.trim() === '' || Number(price) <= 0 || createProduct.isPending} onClick={submit}>
                <Plus className="size-4" /> Tambah Produk
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
