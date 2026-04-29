import { useAppStore } from '../store'
import { Badge, Button, Panel } from '../styleguide'
import { Building2, FileWarning, Search, Workflow } from 'lucide-react'

export function WelcomeScreen() {
  const { setView } = useAppStore()

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <div className="mx-auto max-w-4xl space-y-8 text-center">
        <Badge tone="success" className="mx-auto">Industrial 3D maintenance dashboard</Badge>
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-sm border border-accent-blue/40 bg-accent-blue/15 text-accent-blue shadow-[0_0_40px_rgba(70,95,241,0.32)]">
          <Building2 size={32} />
        </div>
        
        <h1 className="text-4xl font-semibold tracking-tight text-fg-primary sm:text-5xl">
          Find hidden pipes before opening walls.
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-fg-secondary">
          A 3D digital twin for supers, plumbers, and property managers: see pipe routes, valve locations,
          issue beacons, and repair history in one clear operational view.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Button onClick={() => setView('dashboard')} className="h-12 px-8 text-base">Open Demo Building</Button>
          <Button variant="secondary" onClick={() => setView('viewer')} className="h-12 px-8 text-base">View Sample Issue</Button>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-3 text-left">
          <Panel className="p-6">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-sm bg-accent-blue/10 text-accent-blue">
              <Workflow size={20} />
            </div>
            <h3 className="mb-2 font-semibold text-fg-primary">Reduce unnecessary wall damage</h3>
            <p className="text-sm leading-relaxed text-fg-secondary">Trace exact pipe routes and locate isolation points before any demolition begins.</p>
          </Panel>
          
          <Panel className="p-6">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-sm bg-accent-amber/10 text-accent-amber">
              <Search size={20} />
            </div>
            <h3 className="mb-2 font-semibold text-fg-primary">Locate shut-off valves faster</h3>
            <p className="text-sm leading-relaxed text-fg-secondary">Find the nearest shut-off valve instantly when an emergency leak occurs.</p>
          </Panel>
          
          <Panel className="p-6">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-sm bg-accent-success/10 text-accent-success">
              <FileWarning size={20} />
            </div>
            <h3 className="mb-2 font-semibold text-fg-primary">Keep repair history by room</h3>
            <p className="text-sm leading-relaxed text-fg-secondary">Log every repair and associate it with a specific pipe segment for future reference.</p>
          </Panel>
        </div>
      </div>
    </div>
  )
}
