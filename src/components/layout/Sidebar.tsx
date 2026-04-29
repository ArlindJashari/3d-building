import React from 'react'
import { AlertTriangle, Building2, CheckCircle2, ChevronRight, Clock3, Layers3, MapPinned, Search, Sparkles } from 'lucide-react'
import { useAppStore } from '../../store'
import { Badge, cx, ui } from '../../styleguide'
import type { ViewName } from '../../types'

const NAV_ITEMS: Array<{ id: ViewName; label: string; icon: React.ReactNode }> = [
  { id: 'dashboard', label: 'Dashboard', icon: <Layers3 size={18} /> },
  { id: 'viewer', label: '3D Viewer', icon: <MapPinned size={18} /> },
  { id: 'explorer', label: 'Room Explorer', icon: <Search size={18} /> },
  { id: 'report', label: 'Report Issue', icon: <AlertTriangle size={18} /> },
  { id: 'history', label: 'Maintenance', icon: <Clock3 size={18} /> },
  { id: 'presentation', label: 'Presentation Mode', icon: <ChevronRight size={18} /> },
  { id: 'feedback', label: 'Provide Feedback', icon: <CheckCircle2 size={18} /> },
]

export function Sidebar() {
  const { view, setView } = useAppStore()

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-8 flex items-center gap-3 rounded-sm border border-white/10 bg-white/6 p-3 shadow-glass">
        <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-accent-blue/40 bg-accent-blue/15 text-accent-blue shadow-[0_0_24px_rgba(70,95,241,0.28)]">
          <Building2 size={20} />
        </div>
        <div>
          <h1 className="text-sm font-semibold leading-tight text-fg-primary">Smart Building</h1>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-fg-muted">3D Pipe Mapping</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        <p className={cx(ui.text.labelUpper, 'mb-2 px-2')}>Navigation</p>
        {NAV_ITEMS.map((item) => {
          const isActive = view === item.id
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cx(
                'group flex w-full items-center gap-3 rounded-sm border px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive 
                  ? 'border-accent-blue/40 bg-accent-blue/15 text-fg-primary shadow-[0_0_24px_rgba(70,95,241,0.18)]' 
                  : 'border-transparent text-fg-secondary hover:border-white/10 hover:bg-white/6 hover:text-fg-primary'
              )}
            >
              <span className={cx('text-fg-muted transition group-hover:text-accent-blue', isActive && 'text-accent-blue')}>{item.icon}</span>
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="mt-4 rounded-sm border border-white/10 bg-white/6 p-4 shadow-glass">
        <div className="mb-2 flex items-center justify-between">
          <Badge tone="success">Active Demo</Badge>
          <Sparkles size={14} className="text-accent-blue" />
        </div>
        <p className="text-xs leading-relaxed text-fg-secondary">
          Scenario: Apartment 3B leak. Use the 3D viewer to trace the pipe, valve, and repair history before opening a wall.
        </p>
      </div>
    </div>
  )
}
