import { useState } from 'react'
import { useAppStore } from '../store'
import { Button, Panel, cx, ui } from '../styleguide'
import { Play, CheckCircle2, ShieldAlert, MonitorPlay, Zap, ArrowRight } from 'lucide-react'

const STEPS = [
  { title: 'Select an Issue', desc: 'Identify the reported problem from the dashboard or a tenant ticket.' },
  { title: 'Locate Suspected Pipe', desc: 'The 3D viewer instantly highlights the hidden pipe segment behind the wall.' },
  { title: 'Find Shut-off Valve', desc: 'Quickly map the nearest isolation valve and view its access instructions.' },
  { title: 'Review History', desc: 'Check past repairs in the exact same room to avoid redundant diagnostic work.' },
  { title: 'Execute Repair', desc: 'Open the wall only where necessary, saving time and property damage.' }
]

export function PresentationScreen() {
  const { pushToast } = useAppStore()
  const [activeStep, setActiveStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleDemo = () => {
    setIsPlaying(true)
    pushToast(`Demo step 1: ${STEPS[0].title}`)
    let step = 0
    const interval = setInterval(() => {
      step++
      if (step >= STEPS.length) {
        clearInterval(interval)
        setIsPlaying(false)
        setActiveStep(0)
        pushToast('Demo complete.')
      } else {
        setActiveStep(step)
        pushToast(`Demo step ${step + 1}: ${STEPS[step].title}`)
      }
    }, 4000)
  }

  return (
    <div className="mx-auto max-w-6xl py-2">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className={ui.text.titleLg}>Client Presentation Mode</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-fg-secondary">
            Guided pitch flow that explains the product through one concrete 3D scenario: a leak behind the Apartment 3B bathroom wall.
          </p>
        </div>
        <Button onClick={handleDemo} disabled={isPlaying} className="gap-2 bg-accent-blue hover:bg-accent-blue/90">
          <Play size={16} className={isPlaying ? 'animate-pulse' : ''} />
          {isPlaying ? 'Running Demo...' : 'Run 90-Second Demo'}
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Panel className="p-8 shadow-sm">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-sm bg-accent-coral/10 text-accent-coral">
            <ShieldAlert size={24} />
          </div>
          <h3 className="mb-4 text-2xl font-semibold tracking-tight text-fg-primary">The Problem</h3>
          <p className="text-lg text-fg-secondary leading-relaxed">
            Building maintenance teams often open walls before knowing exactly where pipes are. When there is a leak, 
            clog, or pressure issue, supers rely on guesswork or outdated 2D blueprints. This wastes time, causes 
            unnecessary property damage, increases repair costs, and frustrates tenants.
          </p>
        </Panel>

        <Panel className="p-8 shadow-sm">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-sm bg-accent-success/10 text-accent-success">
            <MonitorPlay size={24} />
          </div>
          <h3 className="mb-4 text-2xl font-semibold tracking-tight text-fg-primary">The Solution</h3>
          <p className="text-lg text-fg-secondary leading-relaxed">
            Interactive 3D pipe maps show systems, valves, and issue history before demolition. The app lets a user 
            open a building, visually inspect a 3D digital model, toggle plumbing layers, find valves, and trace pipe routes instantly.
          </p>
        </Panel>
      </div>

      <div className="mt-5 rounded-sm border border-white/10 bg-white/6 p-8 shadow-glass backdrop-blur-2xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-blue text-white shadow-sm">
            <Zap size={16} />
          </div>
          <h3 className="text-xl font-semibold text-fg-primary">Demo Scenario: Apartment 3B Leak</h3>
        </div>

        <div className="relative">
          <div className="absolute bottom-0 left-6 top-0 w-[2px] bg-white/10" />
          
          <div className="space-y-8">
            {STEPS.map((step, idx) => {
              const isActive = activeStep === idx
              const isPast = activeStep > idx
              
              return (
                <div key={idx} className={cx('relative flex items-start gap-6 transition-opacity duration-300', isPlaying && !isActive && !isPast ? 'opacity-40' : 'opacity-100')}>
                  <div className={cx(
                    'relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-4 border-surface-page font-bold shadow-sm transition-colors duration-300',
                    isActive ? 'bg-accent-blue text-white ring-4 ring-accent-blue/20' : 
                    isPast ? 'bg-accent-success text-white' : 
                    'bg-surface-inverse-muted text-fg-muted'
                  )}>
                    {isPast ? <CheckCircle2 size={20} /> : idx + 1}
                  </div>
                  <div className={cx('flex-1 rounded-sm border p-5 transition-all duration-300', isActive ? 'border-accent-blue/35 bg-accent-blue/10 shadow-glass scale-[1.02]' : 'border-white/10 bg-white/4')}>
                    <h4 className={cx('text-lg font-semibold', isActive ? 'text-accent-blue' : 'text-fg-primary')}>{step.title}</h4>
                    <p className="mt-2 text-fg-secondary leading-relaxed">{step.desc}</p>
                    
                    {isActive && isPlaying && (
                      <div className="mt-4 flex items-center gap-2 text-sm font-medium text-accent-blue animate-pulse">
                        Executing step... <ArrowRight size={16} />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
