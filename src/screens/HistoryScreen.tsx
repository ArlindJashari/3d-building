import { useState } from 'react'
import { useAppStore } from '../store'
import { maintenanceRecords, pipes } from '../mockData'
import { Badge, Button, Panel, cx, severityStyles, systemStyles, ui } from '../styleguide'
import { Clock, Filter, FileText, Route, Wrench } from 'lucide-react'

export function HistoryScreen() {
  const { setFocus, setView } = useAppStore()
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All' ? maintenanceRecords : maintenanceRecords.filter(r => r.systemType.includes(filter) || r.severity === filter)

  return (
    <div className="flex h-full flex-col gap-5 lg:flex-row">
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className={ui.text.titleLg}>Maintenance History</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-fg-secondary">
              Every repair is tied back to a pipe, valve, room, and recommended next action, so future work starts
              with evidence instead of memory.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-white/10 bg-white/6 p-1 shadow-sm">
            {['All', 'Hot Water', 'Waste Line', 'High'].map(f => (
              <button
                key={f} onClick={() => setFilter(f)}
                className={cx('rounded-sm px-4 py-1.5 text-xs font-medium transition', filter === f ? 'bg-accent-blue/20 text-fg-primary shadow-sm ring-1 ring-accent-blue/30' : 'text-fg-secondary hover:bg-white/8 hover:text-fg-primary')}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map(record => (
            <Panel key={record.id} className="p-0 shadow-sm transition hover:shadow-md">
              <div className="flex flex-col md:flex-row">
                <div className="flex w-full flex-col justify-between border-b border-white/10 bg-white/5 p-6 md:w-72 md:border-b-0 md:border-r">
                  <div>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/15 px-3 py-1">
                      <Clock size={12} className="text-fg-muted" />
                      <span className="text-xs font-medium text-fg-secondary">{record.date}</span>
                    </div>
                    <h4 className="font-semibold text-fg-primary">{record.location}</h4>
                    <p className="mt-1 text-sm" style={{ color: systemStyles[record.systemType].hex }}>{record.systemType}</p>
                  </div>
                  <div className="mt-6">
                    <span className={cx('inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider', severityStyles[record.severity])}>
                      {record.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-medium text-fg-primary">{record.description}</h3>
                    <div className="rounded-sm border border-white/10 bg-white/6 p-4 text-sm text-fg-secondary leading-relaxed">
                      {record.notes}
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <AssetLink label="Related pipe" value={record.relatedPipeId} />
                      <AssetLink label="Related valve" value={record.relatedValveId} />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="text-xs font-medium uppercase tracking-wider text-fg-muted">Technician</span>
                        <p className="mt-0.5 font-medium text-fg-primary">{record.technician}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium uppercase tracking-wider text-fg-muted">Cost Estimate</span>
                        <p className="mt-0.5 font-medium text-fg-primary">{record.costEstimate}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="secondary" className="gap-2"
                        onClick={() => {
                          const p = pipes.find(x => x.id === record.relatedPipeId)
                          if (p) { setFocus({ pipeId: p.id, floor: p.floor }); setView('viewer') }
                        }}
                      >
                        <Route size={14} /> Open Pipe in 3D
                      </Button>
                      <Button 
                        variant="secondary" className="gap-2"
                        onClick={() => {
                          setFocus({ floor: record.floor, apartment: record.apartment, room: record.room })
                          setView('explorer')
                        }}
                      >
                        <FileText size={14} /> Room Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Panel>
          ))}
          {filtered.length === 0 && (
            <Panel className="flex flex-col items-center justify-center p-12 text-center shadow-sm">
              <Filter size={32} className="mb-4 text-fg-muted/50" />
              <h3 className="font-medium text-fg-primary">No records found</h3>
              <p className="mt-1 text-sm text-fg-muted">Try adjusting your filters.</p>
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}

function AssetLink({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-white/10 bg-black/15 p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-fg-muted">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <Wrench size={12} className="text-accent-blue" />
        <Badge className="font-mono">{value}</Badge>
      </div>
    </div>
  )
}
