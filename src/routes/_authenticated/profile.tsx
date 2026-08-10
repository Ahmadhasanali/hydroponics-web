import { createFileRoute } from '@tanstack/react-router'
import { ProfileForm } from '../../features/profile/components/ProfileForm'
import { Button } from '../../components/ui/button'
import { useAuth } from '../../hooks/useAuth'

export const Route = createFileRoute('/_authenticated/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const { logout } = useAuth()

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Profil</h1>
        <p className="text-sm text-muted-foreground">Kelola informasi akun Anda.</p>
      </div>
      <ProfileForm />
      <Button variant="destructive" onClick={() => logout()}>
        Keluar
      </Button>
    </div>
  )
}
