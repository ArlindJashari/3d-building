import { useAppStore } from '../../store'
import { buildings } from '../../mockData'
import { Badge, Button, ui } from '../../styleguide'
import { Bell, CircleDot, Search, ShieldCheck } from 'lucide-react'

const VIEW_TITLES: Record<string, string> = {
  dashboard: 'Building Overview',
  viewer: '3D Building Map',
  explorer: 'Room & Floor Explorer',
  report: 'Report an Issue',
  history: 'Maintenance History',
  presentation: 'Presentation Mode',
}

export function Header() {
  const { view, buildingId, setBuildingId, resetDemoData, pushToast } = useAppStore()

  return (
    <header className="flex min-h-16 flex-shrink-0 items-center justify-between border-b border-white/10 bg-surface-inverse/50 px-6 backdrop-blur-3xl">
      <div className="flex items-center gap-6">
        <div>
          <h2 className={ui.text.titleMd}>{VIEW_TITLES[view] || 'Welcome'}</h2>
          <div className="mt-0.5 flex items-center gap-2">
            <p className={ui.text.axis}>Current property:</p>
            <select 
              className="cursor-pointer bg-transparent text-xs font-medium text-fg-primary outline-none"
              value={buildingId}
              onChange={(e) => setBuildingId(e.target.value)}
            >
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" />
          <input 
            type="text" 
            placeholder="Search assets, valves, rooms..." 
            className="h-9 w-72 rounded-full border border-white/10 bg-white/6 pl-9 pr-4 text-sm text-fg-primary outline-none transition placeholder:text-fg-muted focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20"
          />
        </div>
        <Badge tone="success" className="hidden gap-2 md:inline-flex">
          <CircleDot size={10} className="animate-pulse" /> Live demo
        </Badge>
        <button className="relative hidden h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/6 text-fg-ghost transition hover:bg-white/10 hover:text-fg-primary md:flex">
          <Bell size={15} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent-coral" />
        </button>
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-medium text-fg-secondary lg:flex">
          <ShieldCheck size={14} className="text-accent-success" />
          Operations ready
        </div>
        <Button 
          variant="ghost" 
          onClick={() => {
            resetDemoData()
            pushToast('Demo environment reset successfully.')
          }}
          className="text-xs"
        >
          Reset Demo
        </Button>
      </div>
    </header>
  )
}
