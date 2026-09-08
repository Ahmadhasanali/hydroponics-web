export function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function todayISO(): string {
  const now = new Date()
  return toISO(now)
}

export function formatRupiah(n: number | string): string {
  const num = typeof n === 'string' ? Number(n) : n
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(num) ? num : 0)
}

/** Format angka bulat rupiah dengan pemisah titik saat diketik, mis. "15000" → "15.000". */
export function formatRupiahInput(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits === '') return ''
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Number(digits))
}

/** Ubah nilai input rupiah berformat titik menjadi angka, mis. "15.000" → 15000. */
export function parseRupiah(value: string): number {
  const digits = value.replace(/\D/g, '')
  return digits === '' ? 0 : Number(digits)
}

export function formatDate(iso: string): string {
  if (!iso) return iso
  // Tanggal saja (YYYY-MM-DD) harus diparsing sebagai lokal agar tidak geser hari karena UTC.
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.slice(0, 10))
  if (dateOnly && iso.length <= 10) {
    const d = new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
