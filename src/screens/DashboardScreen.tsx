import { useMemo, useState, type ReactNode } from 'react'
import { useAppStore } from '../store'
import { buildings, dashboardMetrics, issues, maintenanceRecords, pipes, valves } from '../mockData'
import { Badge, Button, Panel, cx, severityStyles, systemStyles, ui } from '../styleguide'
import { Building3DCanvas, type ViewMode } from '../components/viewer3d/Building3DCanvas'
import { Activity, AlertCircle, ArrowRight, Clock, Crosshair, Layers3, MapPinned, ShieldCheck, Wrench } from 'lucide-react'
import type { Issue, Pipe, Valve } from '../types'

const COMMAND_LAYERS = {
  cold: true,
  hot: true,
  waste: true,
  heating: true,
  gas: true,
  valves: true,
  issues: true,
}

export function DashboardScreen() {
  const { buildingId, createdIssues, setView, setFocus } = useAppStore()
  const building = buildings.find(b => b.id === buildingId) ?? buildings[0]
  const allIssues = useMemo(() => [...issues, ...createdIssues], [createdIssues])
  const [selectedFloor, setSelectedFloor] = useState('Floor 3')
  const [viewMode, setViewMode] = useState<ViewMode>('Floor Cutaway')

  const openIssue = (issue: Issue) => {
    setFocus({ issueId: issue.id, floor: issue.floor, apartment: issue.apartment, room: issue.room })
    setView('viewer')
  }

  const openPipe = (pipe: Pipe) => {
    setFocus({ pipeId: pipe.id, floor: pipe.floor, apartment: pipe.apartment, room: pipe.room })
    setView('viewer')
  }

  const openValve = (valve: Valve) => {
    setFocus({ valveId: valve.id, floor: valve.floor, apartment: valve.apartment, room: valve.room })
    setView('viewer')
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1.65fr_0.9fr]">
        <Panel className="relative min-h-[560px] overflow-hidden p-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(70,95,241,0.22),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent)]" />
          <div className="relative z-10 flex h-full min-h-[560px] flex-col">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 p-5">
              <div>
                <Badge tone="success" className="mb-3">Live 3D Building Model</Badge>
                <h2 className="text-2xl font-medium tracking-tight text-fg-primary">{building.name}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fg-secondary">
                  This command view shows the building as a layered digital twin: colored pipe systems, shut-off valves,
                  and issue beacons are mapped together so maintenance can isolate the problem before opening walls.
                </p>
              </div>
              <div className="flex gap-2">
                {(['Full Building', 'Floor Cutaway', 'Focus'] as ViewMode[]).map(mode => (
                  <button
                    key={mode}
                    disabled={mode === 'Focus'}
                    onClick={() => setViewMode(mode)}
                    className={cx(
                      'rounded-sm border px-3 py-2 text-[11px] font-medium transition',
                      viewMode === mode
                        ? 'border-accent-blue/50 bg-accent-blue/20 text-fg-primary'
                        : 'border-white/10 bg-white/6 text-fg-secondary hover:bg-white/10 hover:text-fg-primary',
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex-1">
              <Building3DCanvas
                building={building}
                pipes={pipes}
                valves={valves}
                issues={allIssues}
                layers={COMMAND_LAYERS}
                selectedFloor={selectedFloor}
                selectedPipeId={null}
                selectedValveId={null}
                selectedIssueId={null}
                viewMode={viewMode}
                onSelectFloor={setSelectedFloor}
                onSelectPipe={openPipe}
                onSelectValve={openValve}
                onSelectIssue={openIssue}
                onClearSelection={() => undefined}
              />

              <div className="pointer-events-none absolute left-5 top-5 max-w-[240px] rounded-sm border border-white/10 bg-surface-inverse/70 p-4 shadow-floating-inverse backdrop-blur-2xl">
                <p className={ui.text.labelUpper}>Current scenario</p>
                <h3 className="mt-2 text-lg font-medium text-fg-primary">Apartment 3B leak route</h3>
                <p className="mt-2 text-xs leading-relaxed text-fg-secondary">
                  Red beacon marks the suspected wall cavity. The highlighted route connects it with the nearest branch
                  valve so the repair team knows where to isolate first.
                </p>
              </div>

              <div className="pointer-events-none absolute bottom-5 left-5 right-5 grid gap-3 md:grid-cols-3">
                <ExplanationCard icon={<Layers3 size={15} />} title="Layered systems" text="Cold, hot, waste, steam, and gas lines are separated by color for faster visual scanning." />
                <ExplanationCard icon={<Crosshair size={15} />} title="Actionable focus" text="Click any pipe, valve, or issue to open the full 3D inspection workflow." />
                <ExplanationCard icon={<ShieldCheck size={15} />} title="Avoid damage" text="Repair planning starts from mapped assets instead of guesswork or outdated 2D plans." />
              </div>
            </div>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className={ui.text.labelUpper}>Priority queue</p>
                <h3 className="mt-1 text-xl font-medium text-fg-primary">Open Issues</h3>
              </div>
              <Button onClick={() => setView('report')} className="h-9 text-xs">Report New</Button>
            </div>

            <div className="space-y-3">
              {allIssues.slice(0, 4).map(issue => {
                const pipe = pipes.find(p => p.id === issue.suspectedPipeId)
                const system = pipe?.systemType
                return (
                  <button
                    key={issue.id}
                    onClick={() => openIssue(issue)}
                    className="group w-full rounded-sm border border-white/10 bg-white/6 p-4 text-left transition hover:border-accent-blue/40 hover:bg-white/10"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-sm bg-accent-coral/12 p-2 text-accent-coral">
                          <AlertCircle size={15} />
                        </div>
                        <div>
                          <h4 className="font-medium text-fg-primary">{issue.title}</h4>
                          <p className="mt-1 text-xs text-fg-secondary">{issue.floor} · Unit {issue.apartment} · {issue.room}</p>
                        </div>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${severityStyles[issue.severity]}`}>
                        {issue.severity}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-fg-secondary">
                      <div className="rounded-sm bg-black/15 p-2">
                        <p className="text-fg-muted">Suspected pipe</p>
                        <p className="mt-1 font-mono text-fg-primary">{issue.suspectedPipeId}</p>
                      </div>
                      <div className="rounded-sm bg-black/15 p-2">
                        <p className="text-fg-muted">System</p>
                        <p className="mt-1 font-medium" style={{ color: system ? systemStyles[system].hex : undefined }}>
                          {system ?? 'Mapped asset'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-fg-muted">
                      <span>Reported {issue.reportedDate}</span>
                      <span className="flex items-center gap-1 text-accent-blue opacity-0 transition group-hover:opacity-100">
                        Open in 3D <ArrowRight size={12} />
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </Panel>

          <Panel className="p-5">
            <p className={ui.text.labelUpper}>Maintenance intelligence</p>
            <h3 className="mt-1 text-xl font-medium text-fg-primary">What the team should do first</h3>
            <div className="mt-5 space-y-4">
              <ActionStep index="01" title="Confirm affected room" text="Open the 3D map and verify Floor 3, Unit 3B, Bathroom before dispatch." />
              <ActionStep index="02" title="Isolate the branch" text="Locate valve V-HW-3B-HALL and close it before cutting into the wall." />
              <ActionStep index="03" title="Review past repair" text="Check Feb 11 repair notes to avoid reopening the wrong section." />
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Open Issues" value={dashboardMetrics.openIssues + createdIssues.length} icon={<AlertCircle size={15} />} />
        <MetricCard label="High Priority" value={dashboardMetrics.highPriority} icon={<Activity size={15} />} tone="danger" />
        <MetricCard label="Valves Mapped" value={dashboardMetrics.valvesMapped} icon={<MapPinned size={15} />} />
        <MetricCard label="Last Inspection" value={dashboardMetrics.lastInspection} icon={<Clock size={15} />} />
        <MetricCard label="Wall Openings Avoided" value={dashboardMetrics.wallOpeningsAvoided} icon={<ShieldCheck size={15} />} tone="success" />
        <MetricCard label="Saved Cost" value={dashboardMetrics.savedCost} icon={<Wrench size={15} />} tone="success" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel className="p-5">
          <p className={ui.text.labelUpper}>Property context</p>
          <h3 className="mt-1 text-xl font-medium text-fg-primary">{building.type}</h3>
          <p className="mt-3 text-sm leading-relaxed text-fg-secondary">{building.summary}</p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <ContextStat label="Floors" value={building.floors.length} />
            <ContextStat label="Units" value={building.units} />
            <ContextStat label="Systems" value={building.mappedSystems.length} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {building.mappedSystems.map(sys => <Badge key={sys}>{sys}</Badge>)}
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className={ui.text.labelUpper}>Recent maintenance</p>
              <h3 className="mt-1 text-xl font-medium text-fg-primary">Repair history linked to 3D assets</h3>
            </div>
            <Button variant="ghost" onClick={() => setView('history')} className="text-xs">View All</Button>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {maintenanceRecords.slice(0, 3).map(rec => (
              <button
                key={rec.id}
                onClick={() => {
                  setFocus({ pipeId: rec.relatedPipeId, floor: rec.floor })
                  setView('viewer')
                }}
                className="rounded-sm border border-white/10 bg-white/6 p-4 text-left transition hover:border-accent-blue/40 hover:bg-white/10"
              >
                <div className="mb-4 flex items-center gap-2 text-xs text-fg-muted">
                  <Clock size={13} /> {rec.date}
                </div>
                <p className="text-sm font-medium text-fg-primary">{rec.description}</p>
                <p className="mt-2 text-xs leading-relaxed text-fg-secondary">{rec.location}</p>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}

function ExplanationCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-sm border border-white/10 bg-surface-inverse/72 p-3 shadow-floating-inverse backdrop-blur-2xl">
      <div className="mb-2 flex items-center gap-2 text-accent-blue">
        {icon}
        <p className="text-xs font-medium text-fg-primary">{title}</p>
      </div>
      <p className="text-[11px] leading-relaxed text-fg-secondary">{text}</p>
    </div>
  )
}

function ActionStep({ index, title, text }: { index: string; title: string; text: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-accent-blue/30 bg-accent-blue/10 font-mono text-[11px] text-accent-blue">
        {index}
      </div>
      <div>
        <p className="text-sm font-medium text-fg-primary">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-fg-secondary">{text}</p>
      </div>
    </div>
  )
}

function ContextStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-sm border border-white/10 bg-black/15 p-3">
      <p className="text-xl font-medium text-fg-primary">{value}</p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-fg-muted">{label}</p>
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon,
  tone = 'neutral',
}: {
  label: string
  value: string | number
  icon: ReactNode
  tone?: 'neutral' | 'danger' | 'success'
}) {
  const iconTone = tone === 'danger' ? 'text-accent-coral bg-accent-coral/10' : tone === 'success' ? 'text-accent-success bg-accent-success/10' : 'text-accent-blue bg-accent-blue/10'
  return (
    <Panel className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className={ui.text.captionUpper}>{label}</p>
        <div className={cx('rounded-sm p-2', iconTone)}>{icon}</div>
      </div>
      <p className="text-2xl font-medium text-fg-primary">{value}</p>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/8">
        <div className={cx('h-full rounded-full', tone === 'danger' ? 'w-3/4 bg-accent-coral' : tone === 'success' ? 'w-4/5 bg-accent-success' : 'w-2/3 bg-accent-blue')} />
      </div>
    </Panel>
  )
}
