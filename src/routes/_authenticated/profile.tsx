import { createFileRoute } from '@tanstack/react-router'
import { ProfileForm } from '../../features/profile/components/ProfileForm'

export const Route = createFileRoute('/_authenticated/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-medium">Profil</h1>
        <p className="text-sm text-muted-foreground">Kelola informasi akun Anda.</p>
      </div>
      <ProfileForm />
    </div>
  )
}
