import React, { useState } from 'react'
import { useAppStore } from '../store'
import { apartments, buildings, pipes, valves } from '../mockData'
import { Button, Panel, cx, severityStyles, ui } from '../styleguide'
import { AlertCircle, ArrowRight, CheckCircle2, ChevronLeft, MapPin } from 'lucide-react'
import type { Severity } from '../types'

export function ReportScreen() {
  const { buildingId, focus, addIssue, setFocus, setView, pushToast } = useAppStore()
  const building = buildings.find(b => b.id === buildingId) ?? buildings[0]
  const fieldClass = 'w-full rounded-xl border border-white/10 bg-white/6 p-3 text-sm text-fg-primary outline-none transition placeholder:text-fg-muted focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20'

  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState({
    floor: focus.floor || building.floors[Math.floor(building.floors.length / 2)],
    apartment: focus.apartment || '3B',
    room: focus.room || 'Bathroom',
    type: 'Leak',
    severity: 'Medium' as Severity,
    description: '',
    tenantNotes: '',
    visibleSigns: ''
  })

  const floorApts = apartments.filter(a => a.floor === draft.floor)
  const apt = floorApts.find(a => a.label === draft.apartment) ?? floorApts[0]

  // Handle floor change to reset nested fields
  const handleFloorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFloor = e.target.value
    const newApts = apartments.filter(a => a.floor === newFloor)
    const newAptLabel = newApts[0]?.label || ''
    const newRooms = newApts[0]?.rooms || []
    setDraft({ ...draft, floor: newFloor, apartment: newAptLabel, room: newRooms[0]?.name || '' })
  }

  const handleAptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAptLabel = e.target.value
    const newApt = floorApts.find(a => a.label === newAptLabel)
    const newRooms = newApt?.rooms || []
    setDraft({ ...draft, apartment: newAptLabel, room: newRooms[0]?.name || '' })
  }

  const nearestPipe = pipes.find(p => p.floor === draft.floor && p.apartment === draft.apartment && p.room === draft.room) ?? pipes[0]
  const nearestValve = valves.find(v => v.floor === draft.floor && v.apartment === draft.apartment) ?? valves[0]

  const handleCreate = () => {
    const issue = {
      id: `ISS-${Math.floor(Math.random() * 9000) + 1000}`,
      title: `${draft.type} reported in ${draft.room}`,
      severity: draft.severity,
      status: 'New' as const,
      floor: draft.floor,
      apartment: draft.apartment,
      room: draft.room,
      description: draft.description || `${draft.type} issue generated from field workflow.`,
      suspectedPipeId: nearestPipe?.id || '',
      nearestValveId: nearestValve?.id || '',
      reportedBy: 'Demo User (Field App)',
      reportedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      recommendedAction: `Inspect the reported area and isolate ${nearestValve?.id || 'main branch'} before opening wall.`
    }
    
    addIssue(issue)
    pushToast('New issue created and mapped.')
    setFocus({ issueId: issue.id, floor: issue.floor })
    setView('viewer')
  }

  return (
    <div className="grid gap-5 py-2 xl:grid-cols-[1fr_360px]">
      <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className={ui.text.titleLg}>Report an Issue</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-fg-secondary">
            Log a new problem, connect it to the nearest mapped pipe and shut-off valve, then open the exact route in the 3D model.
          </p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={cx('h-2 w-12 rounded-full transition-colors duration-300', s <= step ? 'bg-accent-blue' : 'bg-white/10')} />
          ))}
        </div>
      </div>

      <Panel className="p-0 shadow-sm">
        <div className="p-6 md:p-8">
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-accent-blue/10 text-accent-blue"><MapPin size={16} /></div>
                <div>
                  <h3 className="text-lg font-semibold text-fg-primary">Where is the problem located?</h3>
                  <p className="mt-1 text-sm text-fg-secondary">This selects the floor, unit, and room used by the 3D model.</p>
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-fg-muted">Floor</label>
                  <select 
                    className={fieldClass}
                    value={draft.floor} onChange={handleFloorChange}
                  >
                    {building.floors.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-fg-muted">Unit / Area</label>
                  <select 
                    className={fieldClass}
                    value={draft.apartment} onChange={handleAptChange}
                  >
                    {floorApts.map(a => <option key={a.id} value={a.label}>{a.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-fg-muted">Room</label>
                  <select 
                    className={fieldClass}
                    value={draft.room} onChange={e => setDraft({ ...draft, room: e.target.value })}
                  >
                    {apt?.rooms.map(r => <option key={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-accent-blue/10 text-accent-blue"><AlertCircle size={16} /></div>
                <div>
                  <h3 className="text-lg font-semibold text-fg-primary">What type of issue is it?</h3>
                  <p className="mt-1 text-sm text-fg-secondary">Issue type and severity drive the priority badge and recommended investigation route.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {['Leak', 'Clog', 'Low pressure', 'No hot water', 'Noise / vibration', 'Odor', 'Unknown'].map(t => (
                  <button
                    key={t} onClick={() => setDraft({ ...draft, type: t })}
                    className={cx(
                      'rounded-sm border p-4 text-center text-sm font-medium transition',
                      draft.type === t ? 'border-accent-blue/50 bg-accent-blue/15 text-accent-blue shadow-sm' : 'border-white/10 bg-white/6 text-fg-secondary hover:border-white/20 hover:text-fg-primary'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <label className="mb-3 block text-sm font-medium text-fg-primary">Set Severity Level</label>
                <div className="flex flex-wrap gap-3">
                  {(['Low', 'Medium', 'High', 'Emergency'] as Severity[]).map(s => (
                    <button
                      key={s} onClick={() => setDraft({ ...draft, severity: s })}
                      className={cx(
                        'rounded-full border px-4 py-2 text-sm font-medium transition',
                        draft.severity === s ? severityStyles[s] : 'border-white/10 bg-white/6 text-fg-secondary hover:bg-white/10'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-accent-blue/10 text-accent-blue"><CheckCircle2 size={16} /></div>
                <div>
                  <h3 className="text-lg font-semibold text-fg-primary">Add Details</h3>
                  <p className="mt-1 text-sm text-fg-secondary">These notes become the field context technicians see before they inspect the asset.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-fg-muted">Description</label>
                  <textarea 
                    className={`${fieldClass} min-h-[100px]`}
                    placeholder="Describe exactly what is happening..."
                    value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })}
                  />
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-fg-muted">Tenant Notes</label>
                    <input 
                      type="text" className={fieldClass}
                      placeholder="What did the tenant say?"
                      value={draft.tenantNotes} onChange={e => setDraft({ ...draft, tenantNotes: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-fg-muted">Visible Signs</label>
                    <input 
                      type="text" className={fieldClass}
                      placeholder="Water damage, mold, dripping..."
                      value={draft.visibleSigns} onChange={e => setDraft({ ...draft, visibleSigns: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-accent-success/10 text-accent-success"><MapPin size={16} /></div>
                <div>
                  <h3 className="text-lg font-semibold text-fg-primary">Smart Investigation Setup</h3>
                  <p className="mt-1 text-sm text-fg-secondary">The report is now connected to a suspected pipe and isolation valve.</p>
                </div>
              </div>
              
              <div className="rounded-sm border border-accent-blue/20 bg-accent-blue/10 p-6">
                <p className="text-sm font-medium text-accent-blue">The system has automatically mapped this report to the 3D model.</p>
                
                <div className="mt-6 space-y-4">
                  <div className="flex gap-4">
                    <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-accent-blue" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">Suspected Location</p>
                      <p className="mt-1 text-sm font-medium text-fg-primary">{nearestPipe?.id || 'Main Stack'} (Behind {draft.room} wet wall)</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-accent-coral" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">Nearest Isolation Valve</p>
                      <p className="mt-1 text-sm font-medium text-fg-primary">{nearestValve?.id || 'Unknown'} - {nearestValve?.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-accent-amber" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">Recommended First Action</p>
                      <p className="mt-1 text-sm font-medium text-fg-primary">Isolate branch before opening wall. Inspect {nearestValve?.id || 'valve'}.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
        
        <div className="flex items-center justify-between border-t border-white/10 bg-white/5 p-6 md:px-8">
          <Button variant="ghost" onClick={() => step > 1 ? setStep(s => s - 1) : setView('dashboard')} className="gap-2">
            <ChevronLeft size={16} /> {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          
          {step < 4 ? (
            <Button onClick={() => setStep(s => s + 1)} className="gap-2 bg-accent-blue hover:bg-accent-blue/90 shadow-button-primary">
              Continue <ArrowRight size={16} />
            </Button>
          ) : (
            <Button onClick={handleCreate} className="gap-2 bg-accent-success hover:bg-accent-success/90 shadow-[0_8px_20px_rgba(39,174,96,0.2)]">
              Create & View in 3D Map <MapPin size={16} />
            </Button>
          )}
        </div>
      </Panel>
      </div>

      <Panel className="h-fit p-5">
        <p className={ui.text.labelUpper}>Live investigation preview</p>
        <h3 className="mt-2 text-xl font-medium text-fg-primary">{draft.apartment} · {draft.room}</h3>
        <p className="mt-3 text-sm leading-relaxed text-fg-secondary">
          As the report is filled out, the system prepares a repair route: suspected pipe, nearest valve, and first
          safe action. This is the explanation that was missing before.
        </p>

        <div className="mt-5 space-y-3">
          <PreviewRow label="Location" value={`${draft.floor} / Unit ${draft.apartment} / ${draft.room}`} />
          <PreviewRow label="Issue type" value={`${draft.type} · ${draft.severity}`} />
          <PreviewRow label="Suspected pipe" value={nearestPipe?.id || 'Pending mapping'} />
          <PreviewRow label="Nearest valve" value={nearestValve?.id || 'Pending mapping'} />
        </div>

        <div className="mt-5 rounded-sm border border-accent-coral/25 bg-accent-coral/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-coral">Field instruction</p>
          <p className="mt-2 text-sm leading-relaxed text-fg-secondary">
            Do not open the wall first. Isolate the mapped branch valve, inspect visible access panels, then cut only
            the section indicated in the 3D view.
          </p>
        </div>
      </Panel>
    </div>
  )
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-white/10 bg-white/6 p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-fg-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-fg-primary">{value}</p>
    </div>
  )
}
