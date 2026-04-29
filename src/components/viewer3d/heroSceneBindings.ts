import type { Issue, Pipe, Valve } from '../../types'

export type ScenePickPayload =
  | { kind: 'pipe'; pipeId: string }
  | { kind: 'valve'; valveId: string }
  | { kind: 'issue'; issueId: string }
  | { kind: 'context'; title: string; detail: string }

/** Middle-column “hero” apartment letter (matches 3B narrative on Floor 3). */
const HERO_LETTER = 'B'

export type HeroSceneBindings = {
  pipeCold: string
  pipeHot: string
  pipeWaste: string
  pipeGas: string
  valveCold: string
  valveHot: string
  /** Yellow marker: prefer gas valve on this floor, else cold branch */
  valveGasOrUtility: string
  issuePrimary: string | null
}

function floorNumber(floorName: string): number | null {
  const m = floorName.match(/(\d+)/)
  return m ? parseInt(m[1], 10) : null
}

function firstPipe(pipes: Pipe[], pred: (p: Pipe) => boolean, fallback: string): string {
  return pipes.find(pred)?.id ?? fallback
}

function firstValve(valves: Valve[], pred: (v: Valve) => boolean, fallback: string): string {
  return valves.find(pred)?.id ?? fallback
}

/**
 * Resolves mock asset IDs for the hero bathroom cutaway on a given residential floor.
 * Returns null for Basement / Roof where the hero module is not shown.
 */
export function buildHeroSceneBindings(
  floorName: string,
  pipes: Pipe[],
  valves: Valve[],
  issues: Issue[],
): HeroSceneBindings | null {
  if (floorName === 'Basement' || floorName === 'Roof') return null
  const n = floorNumber(floorName)
  if (n == null) return null
  const apt = `${n}${HERO_LETTER}`

  const pipeCold =
    floorName === 'Floor 3'
      ? firstPipe(pipes, (p) => p.id === 'CW-3B-BATH-EAST', `CW-${apt}-RISER`)
      : firstPipe(pipes, (p) => p.id === `CW-${apt}-RISER`, `CW-3B-BATH-EAST`)

  const pipeHot =
    floorName === 'Floor 3'
      ? firstPipe(pipes, (p) => p.id === 'HW-3B-BATH-EAST', `HW-${apt}-RISER`)
      : firstPipe(pipes, (p) => p.id === `HW-${apt}-RISER`, `HW-3B-BATH-EAST`)

  const pipeWaste = firstPipe(
    pipes,
    (p) => p.floor === floorName && p.systemType === 'Waste Line',
    floorName === 'Floor 3' ? 'WL-3B-TUB-STACK' : 'WL-2C-KITCHEN',
  )

  const pipeGas = firstPipe(
    pipes,
    (p) => p.floor === floorName && p.systemType === 'Gas Line',
    'GAS-1A-KITCHEN',
  )

  const valveCold =
    floorName === 'Floor 3'
      ? firstValve(valves, (v) => v.id === 'V-CW-3B-HALL', `V-CW-${apt}`)
      : firstValve(valves, (v) => v.id === `V-CW-${apt}`, 'V-CW-3B-HALL')

  const valveHot =
    floorName === 'Floor 3'
      ? firstValve(valves, (v) => v.id === 'V-HW-3B-HALL', `V-HW-${apt}`)
      : firstValve(valves, (v) => v.id === `V-HW-${apt}`, 'V-HW-3B-HALL')

  const valveGasOrUtility = firstValve(
    valves,
    (v) => v.floor === floorName && v.systemType === 'Gas Line',
    firstValve(valves, (v) => v.id === `V-CW-${apt}`, valveCold),
  )

  const issuePrimary =
    issues.find((i) => i.floor === floorName && i.apartment === apt) ??
    issues.find((i) => i.floor === floorName) ??
    null

  return {
    pipeCold,
    pipeHot,
    pipeWaste,
    pipeGas,
    valveCold,
    valveHot,
    valveGasOrUtility,
    issuePrimary: issuePrimary?.id ?? null,
  }
}
