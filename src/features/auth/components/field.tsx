import type { ReactNode } from 'react'

import { Label } from '../../../components/ui/label'
import { cn } from '../../../lib/utils'

type FieldProps = {
  label: string
  htmlFor: string
  hint?: ReactNode
  error?: string
  children: ReactNode
  className?: string
}

export function Field({ label, htmlFor, hint, error, children, className }: FieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={htmlFor} className="text-[13px] font-medium text-foreground">
          {label}
        </Label>
        {hint}
      </div>
      {children}
      {error && <p className="text-[13px] leading-snug text-(--auth-err-text)">{error}</p>}
    </div>
  )
}

type NoteProps = {
  children: ReactNode
  className?: string
}

export function ErrorNote({ children, className }: NoteProps) {
  return (
    <p
      role="alert"
      className={cn(
        'rounded-md border border-(--auth-err-text)/20 bg-(--auth-err-bg) px-3 py-2.5 text-[13px] leading-relaxed text-(--auth-err-text)',
        className
      )}
    >
      {children}
    </p>
  )
}

export function SuccessNote({ children, className }: NoteProps) {
  return (
    <p
      role="status"
      className={cn(
        'rounded-md border border-(--auth-ok-text)/20 bg-(--auth-ok-bg) px-3 py-2.5 text-[13px] leading-relaxed text-(--auth-ok-text)',
        className
      )}
    >
      {children}
    </p>
  )
}