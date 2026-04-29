import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '../store'
import { buildings, pipes, valves, issues } from '../mockData'
import { Badge, Button, Panel, cx, severityStyles, systemStyles, ui } from '../styleguide'
import {
  AlertTriangle,
  Layers,
  ChevronRight,
  Move3d,
  Building2,
  Crosshair,
  Compass,
  Maximize2,
} from 'lucide-react'
import type { Issue, Pipe, Valve } from '../types'
import { Building3DCanvas, type ViewMode } from '../components/viewer3d/Building3DCanvas'

const SYSTEM_LEGEND: Array<{ key: keyof ReturnType<typeof useAppStore>['layers']; label: string; system?: keyof typeof systemStyles }> = [
  { key: 'cold', label: 'Cold Water', system: 'Cold Water' },
  { key: 'hot', label: 'Hot Water', system: 'Hot Water' },
  { key: 'waste', label: 'Waste Line', system: 'Waste Line' },
  { key: 'heating', label: 'Heating / Steam', system: 'Heating / Steam' },
  { key: 'gas', label: 'Gas Line', system: 'Gas Line' },
  { key: 'valves', label: 'Shut-off Valves' },
  { key: 'issues', label: 'Active Issues' },
]

export function ViewerScreen() {
  const { buildingId, layers, setLayers, focus, setFocus, createdIssues } = useAppStore()
  const building = buildings.find((b) => b.id === buildingId) ?? buildings[0]
  const floors = building.floors

  const [selectedFloor, setSelectedFloor] = useState(focus.floor || (floors.includes('Floor 3') ? 'Floor 3' : floors[Math.floor(floors.length / 2)]))
  const [selectedPipe, setSelectedPipe] = useState<Pipe | null>(null)
  const [selectedValve, setSelectedValve] = useState<Valve | null>(null)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('Floor Cutaway')
  const [viewerTip, setViewerTip] = useState<{ title: string; detail: string } | null>(null)

  const allIssues = useMemo(() => [...issues, ...createdIssues], [createdIssues])

  // Sync incoming focus from elsewhere (dashboard, history, etc.)
  useEffect(() => {
    if (!(focus.pipeId || focus.valveId || focus.issueId)) return
    const t = setTimeout(() => {
      if (focus.pipeId) {
        const p = pipes.find((x) => x.id === focus.pipeId)
        if (p) {
          setSelectedPipe(p)
          setSelectedFloor(p.floor)
          setSelectedValve(null)
          setSelectedIssue(null)
          setViewMode('Focus')
        }
      }
      if (focus.valveId) {
        const v = valves.find((x) => x.id === focus.valveId)
        if (v) {
          setSelectedValve(v)
          setSelectedFloor(v.floor)
          setSelectedPipe(null)
          setSelectedIssue(null)
          setViewMode('Focus')
        }
      }
      if (focus.issueId) {
        const i = allIssues.find((x) => x.id === focus.issueId)
        if (i) {
          setSelectedIssue(i)
          setSelectedFloor(i.floor)
          setSelectedPipe(null)
          setSelectedValve(null)
          setViewMode('Focus')
        }
      }
      setFocus({})
    }, 0)
    return () => clearTimeout(t)
  }, [focus, allIssues, setFocus])

  const clearSelection = () => {
    setSelectedPipe(null)
    setSelectedValve(null)
    setSelectedIssue(null)
    setViewerTip(null)
  }

  const handleSelectFloor = (name: string) => {
    setSelectedFloor(name)
    setViewerTip(null)
    if (viewMode === 'Focus') setViewMode('Full Building')
  }

  const handleSelectPipe = (p: Pipe) => {
    setViewerTip(null)
    setSelectedPipe(p)
    setSelectedValve(null)
    setSelectedIssue(null)
    setSelectedFloor(p.floor)
  }

  const handleSelectValve = (v: Valve) => {
    setViewerTip(null)
    setSelectedValve(v)
    setSelectedPipe(null)
    setSelectedIssue(null)
    setSelectedFloor(v.floor)
  }

  const handleSelectIssue = (i: Issue) => {
    setViewerTip(null)
    setSelectedIssue(i)
    setSelectedPipe(null)
    setSelectedValve(null)
    setSelectedFloor(i.floor)
  }

  const focusElement = (type: 'pipe' | 'valve' | 'issue', id: string) => {
    setViewerTip(null)
    if (type === 'pipe') {
      const p = pipes.find((x) => x.id === id)
      if (p) {
        handleSelectPipe(p)
        setViewMode('Focus')
      }
    } else if (type === 'valve') {
      const v = valves.find((x) => x.id === id)
      if (v) {
        handleSelectValve(v)
        setViewMode('Focus')
      }
    } else {
      const i = allIssues.find((x) => x.id === id)
      if (i) {
        handleSelectIssue(i)
        setViewMode('Focus')
      }
    }
  }

  const issueCountByFloor = useMemo(() => {
    const map: Record<string, number> = {}
    allIssues.forEach((i) => {
      map[i.floor] = (map[i.floor] || 0) + 1
    })
    return map
  }, [allIssues])

  return (
    <div className="flex h-[calc(100vh-112px)] flex-col gap-4 xl:flex-row">
      {/* 3D Viewer Stage */}
      <div className="relative flex flex-1 overflow-hidden rounded-2xl bg-[#0B0F15] shadow-inner ring-1 ring-white/10">
        {/* Live 3D scene */}
        <div className="absolute inset-0">
          <Building3DCanvas
            building={building}
            pipes={pipes}
            valves={valves}
            issues={allIssues}
            layers={layers}
            selectedFloor={selectedFloor}
            selectedPipeId={selectedPipe?.id ?? null}
            selectedValveId={selectedValve?.id ?? null}
            selectedIssueId={selectedIssue?.id ?? null}
            viewMode={viewMode}
            onSelectFloor={handleSelectFloor}
            onSelectPipe={handleSelectPipe}
            onSelectValve={handleSelectValve}
            onSelectIssue={handleSelectIssue}
            onClearSelection={clearSelection}
            onSceneContextPick={setViewerTip}
          />
        </div>

        {/* Building guidance top-left */}
        <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-[300px] rounded-sm border border-white/10 bg-surface-inverse/72 p-4 text-white shadow-floating-inverse backdrop-blur-2xl">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-white/70">
            <Building2 size={12} />
            {building.name}
          </div>
          <h3 className="text-base font-medium text-white">Read the model before opening walls</h3>
          <p className="mt-2 text-xs leading-relaxed text-white/62">
            Select an issue beacon, pipe, or shut-off valve. The details panel explains the asset, access point,
            and safest first action for the repair team.
          </p>
        </div>

        {/* Floor selector — vertical stack on right of stage */}
        <div className="pointer-events-auto absolute right-4 top-1/2 z-10 -translate-y-1/2">
          <div className="rounded-2xl bg-[#1A222C]/90 p-1.5 backdrop-blur-xl ring-1 ring-white/10">
            <div className="flex flex-col-reverse gap-0.5">
              {floors.map((f) => {
                const isSel = f === selectedFloor
                const count = issueCountByFloor[f] || 0
                return (
                  <button
                    key={f}
                    onClick={() => handleSelectFloor(f)}
                    className={cx(
                      'group relative flex w-28 items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition',
                      isSel
                        ? 'bg-accent-blue text-white shadow-floating'
                        : 'text-white/55 hover:bg-white/8 hover:text-white',
                    )}
                  >
                    <span className="font-mono">{f.replace('Floor ', 'F ')}</span>
                    {count > 0 && (
                      <span
                        className={cx(
                          'flex h-4 min-w-4 items-center justify-center rounded-full text-[9px] font-bold',
                          isSel ? 'bg-white/25 text-white' : 'bg-accent-coral/90 text-white',
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Layers panel — top-right */}
        <div className="pointer-events-auto absolute right-4 top-4 z-10 w-52 rounded-2xl bg-[#1A222C]/90 p-3 backdrop-blur-xl ring-1 ring-white/10">
          <div className="mb-3 flex items-center gap-2 text-white/80">
            <Layers size={13} />
            <p className="text-[10px] font-medium uppercase tracking-widest">Layers</p>
          </div>
          <div className="space-y-1.5">
            {SYSTEM_LEGEND.map((l) => {
              const checked = layers[l.key]
              const hex = l.system ? systemStyles[l.system].hex : l.key === 'issues' ? '#ff5744' : '#94a3b8'
              return (
                <label
                  key={l.key}
                  className="flex cursor-pointer items-center justify-between rounded-md px-1.5 py-1 text-xs text-white/70 transition hover:bg-white/5 hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: hex,
                        boxShadow: checked ? `0 0 6px ${hex}` : 'none',
                        opacity: checked ? 1 : 0.3,
                      }}
                    />
                    {l.label}
                  </span>
                  <input
                    type="checkbox"
                    className="h-3 w-3 cursor-pointer accent-accent-blue"
                    checked={checked}
                    onChange={(e) => setLayers({ ...layers, [l.key]: e.target.checked })}
                  />
                </label>
              )
            })}
          </div>
        </div>

        {/* View mode switcher — bottom center */}
        <div className="pointer-events-auto absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
          <div className="flex gap-1 rounded-full bg-[#1A222C]/90 p-1 backdrop-blur-xl ring-1 ring-white/10">
            {([
              { key: 'Full Building', icon: Building2 },
              { key: 'Floor Cutaway', icon: Maximize2 },
              { key: 'Focus', icon: Crosshair },
            ] as Array<{ key: ViewMode; icon: typeof Building2 }>).map((m) => {
              const Active = m.icon
              const isSel = viewMode === m.key
              const disabled = m.key === 'Focus' && !(selectedPipe || selectedValve || selectedIssue)
              return (
                <button
                  key={m.key}
                  disabled={disabled}
                  onClick={() => setViewMode(m.key)}
                  className={cx(
                    'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-medium transition',
                    isSel ? 'bg-white/12 text-white shadow-floating-inverse' : 'text-white/55',
                    !isSel && !disabled && 'hover:text-white hover:bg-white/5',
                    disabled && 'cursor-not-allowed opacity-30',
                  )}
                >
                  <Active size={12} />
                  {m.key}
                </button>
              )
            })}
          </div>
        </div>

        {/* Hint card — bottom left */}
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 hidden items-center gap-3 rounded-sm bg-white/5 px-3 py-2 text-[10px] text-white/55 ring-1 ring-white/10 backdrop-blur-md md:flex">
          <Move3d size={12} />
          <span>
            <span className="text-white/80">Drag</span> to rotate &nbsp;·&nbsp;
            <span className="text-white/80">Scroll</span> to zoom &nbsp;·&nbsp;
            <span className="text-white/80">Right-drag</span> to pan
          </span>
        </div>

        {/* Compass */}
        <div className="pointer-events-none absolute right-4 bottom-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 backdrop-blur-md">
          <Compass size={20} className="text-white/65" strokeWidth={1.5} />
        </div>
      </div>

      {/* Right Details Panel */}
      <div className="flex w-full flex-col gap-4 xl:w-[360px]">
        {selectedPipe ? (
          <Panel className="flex-1 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <Badge tone="dark" className="font-mono text-[10px]">{selectedPipe.id}</Badge>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: `${systemStyles[selectedPipe.systemType].hex}1A`,
                  color: systemStyles[selectedPipe.systemType].hex,
                }}
              >
                {selectedPipe.systemType}
              </span>
            </div>
            <h3 className="mb-1 text-xl font-semibold text-fg-primary">
              {selectedPipe.systemType} Branch
            </h3>
            <p className="text-sm text-fg-muted">
              {selectedPipe.floor} · {selectedPipe.apartment} · {selectedPipe.room}
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <p className={ui.text.captionUpper}>Material & Specs</p>
                <p className="mt-1 text-sm font-medium">
                  {selectedPipe.material} · {selectedPipe.diameter}
                </p>
              </div>
              <div>
                <p className={ui.text.captionUpper}>Status</p>
                <Badge
                  tone={
                    selectedPipe.status === 'Normal' ? 'success' : selectedPipe.status === 'Watch' ? 'warning' : 'danger'
                  }
                  className="mt-1"
                >
                  {selectedPipe.status}
                </Badge>
              </div>
              <div>
                <p className={ui.text.captionUpper}>Notes</p>
                <div className="mt-1 rounded-lg bg-surface-app p-3 text-sm text-fg-secondary">
                  {selectedPipe.notes}
                </div>
              </div>
              <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
                <Button
                  variant="secondary"
                  className="w-full justify-between"
                  onClick={() => {
                    const v = valves.find((x) => selectedPipe.connectedValves.includes(x.id))
                    if (v) focusElement('valve', v.id)
                  }}
                >
                  Find nearest shut-off <ChevronRight size={14} />
                </Button>
                <Button variant="ghost" className="w-full justify-between" onClick={() => setViewMode('Focus')}>
                  Zoom to pipe <Crosshair size={14} />
                </Button>
              </div>
            </div>
          </Panel>
        ) : selectedValve ? (
          <Panel className="flex-1 border-l-4 border-l-accent-blue p-5 shadow-sm">
            <Badge tone="neutral" className="mb-4 font-mono text-[10px]">{selectedValve.id}</Badge>
            <h3 className="mb-1 text-xl font-semibold text-fg-primary">{selectedValve.type}</h3>
            <p className="text-sm text-fg-muted">{selectedValve.location}</p>

            <div className="mt-6 space-y-4">
              <div>
                <p className={ui.text.captionUpper}>Controls</p>
                <ul className="mt-1 list-disc pl-4 text-sm font-medium text-fg-secondary">
                  {selectedValve.controls.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-accent-danger/20 bg-accent-danger/5 p-4">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-accent-danger">
                  Emergency Instructions
                </p>
                <p className="text-sm leading-relaxed text-accent-danger/90">{selectedValve.emergencyInstruction}</p>
              </div>
              <Button variant="ghost" className="w-full justify-between" onClick={() => setViewMode('Focus')}>
                Zoom to valve <Crosshair size={14} />
              </Button>
            </div>
          </Panel>
        ) : selectedIssue ? (
          <Panel className="flex-1 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <Badge tone="dark" className="font-mono text-[10px]">{selectedIssue.id}</Badge>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${severityStyles[selectedIssue.severity]}`}>
                {selectedIssue.severity}
              </span>
            </div>
            <h3 className="mb-1 text-xl font-semibold text-fg-primary">{selectedIssue.title}</h3>
            <p className="text-sm text-fg-muted">
              {selectedIssue.floor} · {selectedIssue.apartment} · {selectedIssue.room}
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <p className={ui.text.captionUpper}>Description</p>
                <p className="mt-1 text-sm leading-relaxed text-fg-secondary">{selectedIssue.description}</p>
              </div>
              <div>
                <p className={ui.text.captionUpper}>Recommended Action</p>
                <div className="mt-1 rounded-lg bg-surface-app p-3 text-sm font-medium text-fg-secondary">
                  {selectedIssue.recommendedAction}
                </div>
              </div>
              <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
                <Button
                  variant="primary"
                  className="w-full justify-between"
                  onClick={() => focusElement('pipe', selectedIssue.suspectedPipeId)}
                >
                  Inspect suspected pipe <ChevronRight size={14} />
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-between"
                  onClick={() => focusElement('valve', selectedIssue.nearestValveId)}
                >
                  Locate isolation valve <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          </Panel>
        ) : viewerTip ? (
          <Panel className="flex-1 p-5 shadow-sm">
            <Badge tone="neutral" className="mb-3 font-mono text-[10px]">
              Scene note
            </Badge>
            <h3 className="mb-2 text-xl font-semibold text-fg-primary">{viewerTip.title}</h3>
            <p className="text-sm leading-relaxed text-fg-secondary">{viewerTip.detail}</p>
            <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-4">
              <Button variant="secondary" className="w-full" onClick={() => setViewerTip(null)}>
                Dismiss note
              </Button>
            </div>
          </Panel>
        ) : (
          <Panel className="flex flex-1 flex-col justify-center p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-accent-blue/10">
              <AlertTriangle size={20} className="text-accent-blue" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-medium text-fg-primary">How to inspect this 3D map</h3>
            <p className="mt-3 text-sm leading-relaxed text-fg-secondary">
              Start with the pulsing red issue beacon, then follow the highlighted pipe route to the nearest valve.
              Each click turns the model into a field instruction: what asset it is, where it is located, and what
              action reduces wall damage.
            </p>
            <div className="mt-6 space-y-3 text-left">
              <GuideStep label="1" title="Pick the problem" text="Issue beacons show reported leaks, clogs, pressure problems, or hot-water outages." />
              <GuideStep label="2" title="Trace the asset" text="Pipe colors separate cold, hot, waste, steam, and gas systems so the team does not confuse branches." />
              <GuideStep label="3" title="Isolate safely" text="Valve details include access notes and emergency instructions before repair work starts." />
            </div>
            <div className="mt-6 grid w-full grid-cols-3 gap-2 text-[10px]">
              <Stat label="Pipes" value={pipes.length} />
              <Stat label="Valves" value={valves.length} />
              <Stat label="Issues" value={allIssues.length} tone="danger" />
            </div>
          </Panel>
        )}
      </div>
    </div>
  )
}

function GuideStep({ label, title, text }: { label: string; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-sm border border-white/10 bg-white/6 p-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-accent-blue/12 font-mono text-xs text-accent-blue">
        {label}
      </div>
      <div>
        <p className="text-sm font-medium text-fg-primary">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-fg-secondary">{text}</p>
      </div>
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'danger' }) {
  return (
    <div className="rounded-sm border border-white/10 bg-white/6 p-3">
      <p className={cx('text-lg font-semibold', tone === 'danger' ? 'text-accent-danger' : 'text-fg-primary')}>
        {value}
      </p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-fg-muted">{label}</p>
    </div>
  )
}
