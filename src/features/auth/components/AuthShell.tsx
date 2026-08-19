import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { Reveal } from '../../../components/ui/reveal'

type AuthShellProps = {
  eyebrow: string
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

export function DropletMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3.5c-3.2 3.8-6.5 7-6.5 10.6a6.5 6.5 0 0 0 13 0c0-3.6-3.3-6.8-6.5-10.6Z" />
      <path d="M9.5 13.6a2.6 2.6 0 0 0 2 2.5" />
    </svg>
  )
}

export function AuthShell({ eyebrow, title, description, children, footer }: AuthShellProps) {
  return (
    <div className="auth-shell relative flex min-h-screen flex-col overflow-hidden antialiased">
      <div className="auth-ambient pointer-events-none fixed inset-0 -z-10">
        <div className="auth-grid absolute inset-0" />
        <div className="auth-blob absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(196,145,92,0.07),transparent_65%)]" />
        <div className="auth-blob absolute -bottom-40 -left-24 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(116,150,138,0.06),transparent_65%)]" style={{ animationDelay: '-13s' }} />
      </div>

      <header className="flex items-center justify-between px-6 py-6 md:px-12">
        <Link to="/login" className="group flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors group-hover:border-foreground/30">
            <DropletMark className="size-[18px]" />
          </span>
          <span className="font-mono text-[11px] font-medium tracking-[0.28em] text-muted-foreground uppercase">
            HydroFarm
          </span>
        </Link>
      </header>

      <main className="flex flex-1 items-center px-4 py-10">
        <Reveal className="mx-auto w-full max-w-md">
          <p className="font-mono text-[11px] font-medium tracking-[0.3em] text-muted-foreground uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-4 font-serif text-[2.6rem] leading-[1.04] font-medium tracking-[-0.03em] text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-[24rem] text-[15px] leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}

          <div className="mt-10 rounded-lg border border-border bg-card p-6 md:p-8">{children}</div>

          {footer && (
            <div className="mt-8 border-t border-border pt-6 text-center">
              <p className="text-sm text-muted-foreground">{footer}</p>
            </div>
          )}
        </Reveal>
      </main>

      <footer className="px-6 pb-6 md:px-12">
        <p className="font-mono text-[10px] tracking-[0.24em] text-muted-foreground/70 uppercase">
          Hidroponik · Monitoring · 2026
        </p>
      </footer>
    </div>
  )
}