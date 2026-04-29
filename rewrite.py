import os

styleguide_content = """/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'
import type { Severity, SystemType } from './types'

export const appTheme = {
  page: 'min-h-screen text-[#1a1a1a] font-sans',
  shell: 'min-h-screen relative overflow-hidden flex p-3 sm:p-5 gap-4 sm:gap-5',
  card: 'bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-xl',
  darkCard: 'bg-[#1a1c20]/80 backdrop-blur-xl border border-white/10 text-white shadow-[0_4px_24px_rgba(0,0,0,0.2)] rounded-xl',
  mutedCard: 'bg-white/30 backdrop-blur-md border border-white/40 rounded-xl',
  input: 'w-full rounded-lg border border-white/60 bg-white/40 px-3 py-2 text-sm text-[#1a1a1a] outline-none transition focus:border-[#3b82f6] focus:bg-white/70 shadow-inner',
  focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/50',
}

export const systemStyles: Record<SystemType, { label: string; hex: string; bg: string; text: string }> = {
  'Cold Water': { label: 'Cold', hex: '#3b82f6', bg: 'bg-blue-50', text: 'text-blue-700' },
  'Hot Water': { label: 'Hot', hex: '#ef4444', bg: 'bg-red-50', text: 'text-red-700' },
  'Waste Line': { label: 'Waste', hex: '#6b7280', bg: 'bg-gray-100', text: 'text-gray-700' },
  'Heating / Steam': { label: 'Steam', hex: '#8b5cf6', bg: 'bg-purple-50', text: 'text-purple-700' },
  'Gas Line': { label: 'Gas', hex: '#f59e0b', bg: 'bg-yellow-50', text: 'text-yellow-800' },
}

export const severityStyles: Record<Severity, string> = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Medium: 'bg-amber-50 text-amber-700 border-amber-100',
  High: 'bg-orange-50 text-orange-700 border-orange-100',
  Emergency: 'bg-red-50 text-red-700 border-red-100',
}

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
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
    primary: 'bg-[#1a1a1a] text-white hover:bg-[#333] shadow-md',
    secondary: 'bg-white/60 text-[#1a1a1a] border border-white/80 hover:bg-white/80 shadow-sm',
    ghost: 'bg-transparent text-[#6b7280] hover:bg-white/40',
    dark: 'bg-[#1a1c20]/60 text-white border border-white/10 hover:bg-[#1a1c20]/80',
    danger: 'bg-[#ef4444] text-white hover:bg-[#dc2626] shadow-md',
  }

  return (
    <button
      type="button"
      className={cx(
        'inline-flex min-h-9 items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition active:scale-[0.98]',
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
    neutral: 'border-white/60 bg-white/40 text-[#4b5563]',
    success: 'border-[#10b981]/20 bg-[#10b981]/10 text-[#059669]',
    warning: 'border-[#f59e0b]/20 bg-[#f59e0b]/10 text-[#d97706]',
    danger: 'border-[#ef4444]/20 bg-[#ef4444]/10 text-[#dc2626]',
    dark: 'border-white/10 bg-white/5 text-white/80',
  }

  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
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
  return <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">{children}</label>
}
"""

index_css_content = """@import "tailwindcss";

:root {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #1a1a1a;
  background: #dce1e5;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

::selection {
  color: #ffffff;
  background: #3b82f6;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
"""

with open('src/styleguide.tsx', 'w') as f:
    f.write(styleguide_content)

with open('src/index.css', 'w') as f:
    f.write(index_css_content)

