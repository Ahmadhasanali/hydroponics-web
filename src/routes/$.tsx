import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '../components/ui/button'

export const Route = createFileRoute('/$')({
  component: NotFoundPage,
})

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Halaman tidak ditemukan</h1>
      <p className="text-sm text-muted-foreground">
        Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
      </p>
      <Button render={<Link to="/" />}>Kembali ke Dashboard</Button>
    </div>
  )
}
