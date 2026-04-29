/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'
import type { Severity, SystemType } from './types'

/** Composable class presets — prefer these + theme utilities over raw hex in feature code. */
export const ui = {
  glass: {
    base: 'relative overflow-hidden bg-white/7 backdrop-blur-2xl',
    border: 'border-[0.5px] border-white/10',
    borderStrong: 'border-[0.5px] border-white/20',
    highlight: 'pointer-events-none absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-accent-blue/5',
  },
  text: {
    titleLg: 'text-[22px] font-medium tracking-tight text-fg-primary',
    titleMd: 'text-xl font-medium text-fg-primary',
    stat: 'text-2xl font-medium text-fg-primary',
    statLg: 'text-3xl font-medium text-fg-primary',
    statXl: 'text-[32px] font-medium tracking-tight text-fg-primary',
    body: 'text-sm font-medium text-fg-primary',
    bodySm: 'text-xs font-medium text-fg-primary',
    caption: 'text-[10px] text-fg-muted',
    captionUpper: 'text-[11px] text-fg-muted',
    labelUpper: 'text-[11px] font-medium uppercase tracking-wider text-fg-label',
    subtle: 'text-[11px] font-medium text-fg-secondary',
    axis: 'text-[9px] text-fg-muted',
  },
  grid: {
    cellBorder: 'border-white/8',
    hairline: 'border-[0.5px] border-white/10',
  },
} as const

export const appTheme = {
  page: 'min-h-screen bg-surface-page text-fg-primary',
  shell: 'min-h-screen bg-surface-shell text-fg-primary font-sans relative overflow-hidden',
  card:
    'rounded-sm border-[0.5px] border-white/10 bg-white/7 shadow-glass backdrop-blur-3xl',
  darkCard:
    'rounded-panel border border-white/10 bg-surface-inverse/82 text-white shadow-floating-inverse backdrop-blur-3xl',
  mutedCard: 'rounded-panel border border-border-muted bg-surface-elevated/80',
  input:
    'w-full rounded-xl border border-border-default bg-white/6 px-4 py-3 text-sm text-fg-default outline-none transition placeholder:text-fg-muted focus:border-accent-blue focus:ring-4 focus:ring-accent-blue/15',
  focus: 'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-blue/20',
}

export const systemStyles: Record<SystemType, { label: string; hex: string; bg: string; text: string }> = {
  'Cold Water': { label: 'Cold', hex: '#465ff1', bg: 'bg-blue-50', text: 'text-blue-700' },
  'Hot Water': { label: 'Hot', hex: '#e74c3c', bg: 'bg-red-50', text: 'text-red-700' },
  'Waste Line': { label: 'Waste', hex: '#7f8c8d', bg: 'bg-zinc-100', text: 'text-zinc-700' },
  'Heating / Steam': { label: 'Steam', hex: '#9b59b6', bg: 'bg-purple-50', text: 'text-purple-700' },
  'Gas Line': { label: 'Gas', hex: '#f1c40f', bg: 'bg-yellow-50', text: 'text-yellow-800' },
}

export const severityStyles: Record<Severity, string> = {
  Low: 'border-accent-success/25 bg-accent-success/10 text-accent-success',
  Medium: 'border-accent-warning/25 bg-accent-warning/10 text-accent-warning',
  High: 'border-accent-coral/30 bg-accent-coral/10 text-accent-coral',
  Emergency: 'border-accent-danger bg-accent-danger text-white',
}

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function GlassPane({
  children,
  className,
  border = true,
}: {
  children: ReactNode
  className?: string
  border?: boolean
}) {
  return (
    <div
      className={cx(
        ui.glass.base,
        border && ui.glass.border,
        className,
      )}
    >
      <div className={ui.glass.highlight} />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export function Button({
  children,
  variant = 'primary',
  className,
  ...props
}: {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'dark' | 'danger'
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    primary: 'bg-accent-blue text-white hover:bg-accent-blue/90 shadow-button-primary',
    secondary: 'border border-white/10 bg-white/8 text-fg-default backdrop-blur-md hover:bg-white/12',
    ghost: 'bg-transparent text-fg-ghost hover:bg-white/7 hover:text-fg-primary',
    dark: 'border border-white/10 bg-surface-inverse-muted text-white hover:bg-white/10',
    danger: 'bg-accent-danger text-white shadow-danger hover:bg-[#c0392b]',
  }

  return (
    <button
      type="button"
      className={cx(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition active:scale-[0.98]',
        appTheme.focus,
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'dark'
  className?: string
}) {
  const tones = {
    neutral: 'bg-white/8 text-fg-ghost ring-1 ring-white/8',
    success: 'bg-accent-success/10 text-accent-success',
    warning: 'bg-accent-warning/10 text-accent-warning',
    danger: 'bg-accent-danger/10 text-accent-danger',
    dark: 'border border-white/10 bg-white/10 text-white',
  }

  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Panel({
  children,
  className,
  dark = false,
}: {
  children: ReactNode
  className?: string
  dark?: boolean
}) {
  return <section className={cx(dark ? appTheme.darkCard : appTheme.card, className)}>{children}</section>
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className={cx('mb-2 block', ui.text.labelUpper)}>{children}</label>
}
