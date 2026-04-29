export type SystemType = 'Cold Water' | 'Hot Water' | 'Waste Line' | 'Heating / Steam' | 'Gas Line'

export type Severity = 'Low' | 'Medium' | 'High' | 'Emergency'

export type IssueStatus = 'New' | 'Investigating' | 'Scheduled' | 'Resolved'

export type ViewName =
  | 'welcome'
  | 'dashboard'
  | 'viewer'
  | 'explorer'
  | 'report'
  | 'history'
  | 'presentation'

export interface Point {
  x: number
  y: number
  z?: number
}

export interface Building {
  id: string
  name: string
  type: string
  location: string
  floors: string[]
  units: number
  mechanicalRooms: string[]
  mappedSystems: SystemType[]
  summary: string
}

export interface Apartment {
  id: string
  floor: string
  label: string
  rooms: Room[]
}

export interface Room {
  id: string
  floor: string
  apartment: string
  name: string
  notes: string[]
}

export interface Pipe {
  id: string
  systemType: SystemType
  color: string
  floor: string
  apartment: string
  room: string
  startPoint: Point
  endPoint: Point
  material: string
  diameter: string
  status: 'Normal' | 'Watch' | 'Needs Service'
  connectedValves: string[]
  lastServiceDate: string
  notes: string
}

export interface Valve {
  id: string
  type: string
  systemType: SystemType
  location: string
  floor: string
  apartment: string
  room: string
  controls: string[]
  accessibility: 'Easy access' | 'Panel access' | 'Restricted' | 'Needs ladder'
  lastTested: string
  emergencyInstruction: string
  point: Point
}

export interface Issue {
  id: string
  title: string
  severity: Severity
  status: IssueStatus
  floor: string
  apartment: string
  room: string
  description: string
  suspectedPipeId: string
  nearestValveId: string
  reportedBy: string
  reportedDate: string
  recommendedAction: string
}

export interface MaintenanceRecord {
  id: string
  date: string
  location: string
  floor: string
  apartment: string
  room: string
  systemType: SystemType
  description: string
  technician: string
  costEstimate: string
  relatedPipeId: string
  relatedValveId: string
  status: 'Completed' | 'Scheduled' | 'Needs follow-up'
  severity: Severity
  notes: string
}

export type LayerKey = 'cold' | 'hot' | 'waste' | 'heating' | 'gas' | 'valves' | 'issues'

export type LayerState = Record<LayerKey, boolean>

export interface AppFocus {
  floor?: string
  apartment?: string
  room?: string
  pipeId?: string
  valveId?: string
  issueId?: string
}
