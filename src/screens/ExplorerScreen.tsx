import { useMemo, useState, type ReactNode } from 'react'
import { useAppStore } from '../store'
import { apartments, buildings, issues, pipes, valves } from '../mockData'
import { Badge, Button, Panel, cx, systemStyles, ui } from '../styleguide'
import { ChevronRight, LayoutGrid, Maximize2, Route, ShieldCheck } from 'lucide-react'

export function ExplorerScreen() {
  const { buildingId, setView, setFocus } = useAppStore()
  const building = buildings.find(b => b.id === buildingId) ?? buildings[0]
  
  const [floor, setFloor] = useState(building.floors[Math.floor(building.floors.length / 2)])
  const apts = useMemo(() => apartments.filter(a => a.floor === floor), [floor])
  
  const [aptId, setAptId] = useState(apts[0]?.id || '')
  const selectedApt = apts.find(a => a.id === aptId) ?? apts[0]

  const [roomId, setRoomId] = useState(selectedApt?.rooms[0]?.id || '')
  const selectedRoom = selectedApt?.rooms.find(r => r.id === roomId) ?? selectedApt?.rooms[0]
  const roomPipes = pipes.filter(p => p.floor === floor && p.apartment === selectedApt?.label && p.room === selectedRoom?.name)
  const roomValves = valves.filter(v => v.floor === floor && v.apartment === selectedApt?.label)
  const roomIssues = issues.filter(i => i.floor === floor && i.apartment === selectedApt?.label && i.room === selectedRoom?.name)

  // Reset nested selections on higher level change
  const handleFloorChange = (f: string) => {
    setFloor(f)
    const newApts = apartments.filter(a => a.floor === f)
    setAptId(newApts[0]?.id)
    setRoomId(newApts[0]?.rooms[0]?.id || '')
  }

  const handleAptChange = (aId: string) => {
    setAptId(aId)
    const newApt = apartments.find(a => a.id === aId)
    setRoomId(newApt?.rooms[0]?.id || '')
  }

  return (
    <div className="flex h-full flex-col gap-5 lg:flex-row">
      {/* Hierarchy Nav */}
      <div className="flex w-full flex-col gap-4 lg:w-80">
        <Panel className="p-4 shadow-sm">
          <p className={ui.text.labelUpper}>1. Select Floor</p>
          <div className="mt-3 flex flex-col gap-1">
            {building.floors.map(f => (
              <button
                key={f}
                onClick={() => handleFloorChange(f)}
                className={cx(
                  'flex items-center justify-between rounded-sm border px-3 py-2 text-sm font-medium transition',
                  f === floor ? 'border-accent-blue/40 bg-accent-blue/15 text-fg-primary' : 'border-transparent text-fg-secondary hover:border-white/10 hover:bg-white/6 hover:text-fg-primary'
                )}
              >
                {f}
                {f === floor && <ChevronRight size={14} />}
              </button>
            ))}
          </div>
        </Panel>

        <Panel className="p-4 shadow-sm">
          <p className={ui.text.labelUpper}>2. Select Unit / Area</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {apts.map(a => (
              <button
                key={a.id}
                onClick={() => handleAptChange(a.id)}
                className={cx(
                  'flex flex-col items-center justify-center rounded-sm border p-3 transition',
                  a.id === aptId 
                    ? 'border-accent-blue/50 bg-accent-blue/15 text-accent-blue shadow-sm' 
                    : 'border-white/10 bg-white/6 text-fg-secondary hover:border-white/20 hover:text-fg-primary'
                )}
              >
                <span className="text-lg font-semibold">{a.label}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-70">Unit</span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel className="p-4">
          <p className={ui.text.labelUpper}>How to use Explorer</p>
          <p className="mt-3 text-sm leading-relaxed text-fg-secondary">
            This screen explains the building hierarchy in plain language: floor, unit, room, then the mapped systems
            inside that room. Use it when a tenant gives a location but not a pipe ID.
          </p>
          <div className="mt-4 space-y-3">
            <MiniGuide icon={<LayoutGrid size={14} />} title="Room notes" text="Shows what systems run through the selected space." />
            <MiniGuide icon={<Route size={14} />} title="Asset links" text="Lists pipes and valves that can be opened in the 3D map." />
            <MiniGuide icon={<ShieldCheck size={14} />} title="Repair context" text="Highlights active issues before a technician enters the room." />
          </div>
        </Panel>
      </div>

      {/* Room Details Area */}
      <div className="flex flex-1 flex-col">
        <Panel className="flex-1 p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between border-b border-white/10 pb-4">
            <div>
              <p className={ui.text.labelUpper}>3. Inspect Room</p>
              <h2 className="mt-2 text-2xl font-semibold text-fg-primary">{floor} · {selectedApt?.label}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fg-secondary">
                Select a room to see exactly what mapped infrastructure is behind walls, ceilings, cabinets, and
                wet-wall chases.
              </p>
            </div>
            <Button 
              onClick={() => {
                setFocus({ floor, apartment: selectedApt?.label, room: selectedRoom?.name })
                setView('viewer')
              }}
              className="gap-2"
            >
              <Maximize2 size={16} /> Open in 3D Map
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-[220px_1fr]">
            <div className="flex flex-col gap-2 border-r border-white/10 pr-4">
              {selectedApt?.rooms.map(r => (
                <button
                  key={r.id}
                  onClick={() => setRoomId(r.id)}
                  className={cx(
                    'flex items-center gap-3 rounded-sm border px-3 py-2.5 text-sm font-medium transition',
                    r.id === roomId 
                      ? 'border-accent-blue/40 bg-accent-blue/15 text-fg-primary' 
                      : 'border-transparent text-fg-secondary hover:border-white/10 hover:bg-white/6 hover:text-fg-primary'
                  )}
                >
                  <LayoutGrid size={16} className={r.id === roomId ? 'text-accent-blue' : 'opacity-50'} />
                  {r.name}
                </button>
              ))}
            </div>

            <div className="pl-2">
              {selectedRoom ? (
                <div>
                  <h3 className="mb-4 text-xl font-medium text-fg-primary">{selectedRoom.name} Systems</h3>
                  <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-3">
                    {selectedRoom.notes.map((note, i) => (
                      <div key={i} className="flex gap-3 rounded-sm border border-white/10 bg-white/6 p-4">
                        <div className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-blue" />
                        <p className="text-sm text-fg-secondary leading-relaxed">{note}</p>
                      </div>
                    ))}
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-sm border border-white/10 bg-black/15 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <p className={ui.text.labelUpper}>Mapped assets</p>
                          <Badge>{roomPipes.length} pipes</Badge>
                        </div>
                        <div className="space-y-2">
                          {roomPipes.slice(0, 4).map(pipe => (
                            <button
                              key={pipe.id}
                              onClick={() => {
                                setFocus({ pipeId: pipe.id, floor: pipe.floor, apartment: pipe.apartment, room: pipe.room })
                                setView('viewer')
                              }}
                              className="flex w-full items-center justify-between rounded-sm border border-white/10 bg-white/6 p-3 text-left text-xs transition hover:border-accent-blue/40 hover:bg-white/10"
                            >
                              <span>
                                <span className="block font-mono text-fg-primary">{pipe.id}</span>
                                <span className="text-fg-muted">{pipe.material} · {pipe.diameter}</span>
                              </span>
                              <span style={{ color: systemStyles[pipe.systemType].hex }}>{systemStyles[pipe.systemType].label}</span>
                            </button>
                          ))}
                          {roomPipes.length === 0 && <p className="text-xs text-fg-muted">No direct pipe records for this room yet.</p>}
                        </div>
                      </div>

                      <div className="rounded-sm border border-white/10 bg-black/15 p-4">
                        <p className={ui.text.labelUpper}>Isolation options</p>
                        <p className="mt-2 text-sm text-fg-secondary">
                          {roomValves[0] ? `${roomValves[0].id} is the nearest mapped valve for this unit.` : 'No dedicated valve mapped for this unit yet.'}
                        </p>
                        {roomIssues[0] && (
                          <Badge tone="danger" className="mt-3">Active issue: {roomIssues[0].title}</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 rounded-sm border border-accent-amber/25 bg-accent-amber/8 p-4">
                    <p className="mb-2 text-xs font-semibold text-accent-amber">Need to report an issue here?</p>
                    <p className="mb-4 text-sm text-accent-amber/80">You can log a maintenance ticket specifically tied to {selectedApt.label} {selectedRoom.name}.</p>
                    <Button 
                      variant="secondary" 
                      className="border-accent-amber/20 text-accent-amber hover:bg-accent-amber/10"
                      onClick={() => {
                        setFocus({ floor, apartment: selectedApt.label, room: selectedRoom.name })
                        setView('report')
                      }}
                    >
                      Report Issue in this Room
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-fg-muted">
                  Select a room to view system details.
                </div>
              )}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  )
}

function MiniGuide({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-sm border border-white/10 bg-white/6 p-3">
      <div className="mt-0.5 text-accent-blue">{icon}</div>
      <div>
        <p className="text-xs font-medium text-fg-primary">{title}</p>
        <p className="mt-1 text-[11px] leading-relaxed text-fg-secondary">{text}</p>
      </div>
    </div>
  )
}
