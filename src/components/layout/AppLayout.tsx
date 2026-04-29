import React from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useAppStore } from '../../store'
import { appTheme, cx } from '../../styleguide'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { view, toasts, removeToast } = useAppStore()

  return (
    <div className={cx(appTheme.shell, 'flex min-h-screen w-full flex-col lg:flex-row')}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-12%] top-[-18%] h-[460px] w-[460px] rounded-full bg-accent-blue/18 blur-3xl" />
        <div className="absolute right-[-10%] top-[10%] h-[360px] w-[360px] rounded-full bg-accent-success/10 blur-3xl" />
        <div className="absolute bottom-[-18%] left-[34%] h-[420px] w-[420px] rounded-full bg-accent-coral/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />
      </div>

      {view !== 'welcome' && (
        <aside className="relative z-10 w-full flex-shrink-0 border-b border-white/10 bg-surface-inverse/60 backdrop-blur-3xl lg:w-72 lg:border-b-0 lg:border-r">
          <Sidebar />
        </aside>
      )}
      
      <main className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        {view !== 'welcome' && <Header />}
        
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </div>
      </main>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-surface-inverse/90 px-4 py-3 text-sm text-white shadow-floating-inverse backdrop-blur-2xl"
          >
            <span>{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="ml-4 text-white/50 hover:text-white">✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
