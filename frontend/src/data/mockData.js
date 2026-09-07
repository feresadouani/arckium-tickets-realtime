export const EQUIPMENT = [
  { id: 'eq-1', name: 'CNC Mill #3', location: 'Building A - Floor 2' },
  { id: 'eq-2', name: 'Conveyor Belt B-12', location: 'Warehouse North' },
  { id: 'eq-3', name: 'HVAC Unit H-7', location: 'Building C - Roof' },
  { id: 'eq-4', name: 'Hydraulic Press P-2', location: 'Building A - Floor 1' },
  { id: 'eq-5', name: 'Packaging Robot R-5', location: 'Line 3' },
  { id: 'eq-6', name: 'Boiler System BS-1', location: 'Utility Room' },
]

export const TECHNICIANS = [
  { id: 'tech-1', name: 'Marcus Chen', specialty: 'Mechanical' },
  { id: 'tech-2', name: 'Sarah Okafor', specialty: 'Electrical' },
  { id: 'tech-3', name: 'James Rodriguez', specialty: 'HVAC' },
  { id: 'tech-4', name: 'Emily Nakamura', specialty: 'Automation' },
]

export const USERS = [
  { email: 'operator@arckium.com', password: 'demo123', role: 'operator', name: 'Alex Rivera' },
  { email: 'technician@arckium.com', password: 'demo123', role: 'technician', name: 'Marcus Chen' },
  { email: 'manager@arckium.com', password: 'demo123', role: 'manager', name: 'Diana Walsh' },
]

export const STATUS_OPTIONS = ['open', 'assigned', 'in progress', 'resolved', 'closed']
export const URGENCY_OPTIONS = ['low', 'medium', 'critical']

export const INITIAL_TICKETS = [
  {
    id: 'TKT-2024-001',
    equipmentId: 'eq-1',
    title: 'Spindle vibration during high-speed operation',
    description: 'Operators report excessive vibration above 8000 RPM. Machine was stopped as a precaution.',
    urgency: 'critical',
    status: 'in progress',
    assignedTo: 'tech-1',
    createdBy: 'Alex Rivera',
    createdAt: '2024-08-20T08:30:00',
    updatedAt: '2024-08-22T14:15:00',
    photo: null,
    history: [
      { status: 'open', timestamp: '2024-08-20T08:30:00', user: 'Alex Rivera', note: 'Ticket created' },
      { status: 'assigned', timestamp: '2024-08-20T09:00:00', user: 'Diana Walsh', note: 'Assigned to Marcus Chen' },
      { status: 'in progress', timestamp: '2024-08-21T07:45:00', user: 'Marcus Chen', note: 'Started inspection — bearing wear suspected' },
    ],
    comments: [
      { id: 'c1', user: 'Marcus Chen', text: 'Ordered replacement bearings. ETA tomorrow.', timestamp: '2024-08-21T16:00:00' },
      { id: 'c2', user: 'Diana Walsh', text: 'Prioritize — this line is critical for Q3 output.', timestamp: '2024-08-22T09:30:00' },
    ],
  },
  {
    id: 'TKT-2024-002',
    equipmentId: 'eq-2',
    title: 'Belt misalignment on section 3',
    description: 'Belt drifting to the right side causing occasional jams.',
    urgency: 'medium',
    status: 'assigned',
    assignedTo: 'tech-1',
    createdBy: 'Alex Rivera',
    createdAt: '2024-08-21T10:15:00',
    updatedAt: '2024-08-21T11:00:00',
    photo: null,
    history: [
      { status: 'open', timestamp: '2024-08-21T10:15:00', user: 'Alex Rivera', note: 'Ticket created' },
      { status: 'assigned', timestamp: '2024-08-21T11:00:00', user: 'Diana Walsh', note: 'Assigned to Marcus Chen' },
    ],
    comments: [],
  },
  {
    id: 'TKT-2024-003',
    equipmentId: 'eq-3',
    title: 'AC unit not cooling — temperature rising',
    description: 'Server room temperature reached 28°C. Filter may be clogged.',
    urgency: 'critical',
    status: 'open',
    assignedTo: null,
    createdBy: 'Alex Rivera',
    createdAt: '2024-08-22T06:00:00',
    updatedAt: '2024-08-22T06:00:00',
    photo: null,
    history: [
      { status: 'open', timestamp: '2024-08-22T06:00:00', user: 'Alex Rivera', note: 'Ticket created' },
    ],
    comments: [],
  },
  {
    id: 'TKT-2024-004',
    equipmentId: 'eq-4',
    title: 'Hydraulic fluid leak at seal',
    description: 'Small puddle forming near the main cylinder seal. Pressure readings normal.',
    urgency: 'medium',
    status: 'resolved',
    assignedTo: 'tech-2',
    createdBy: 'Alex Rivera',
    createdAt: '2024-08-15T14:00:00',
    updatedAt: '2024-08-17T16:30:00',
    photo: null,
    history: [
      { status: 'open', timestamp: '2024-08-15T14:00:00', user: 'Alex Rivera', note: 'Ticket created' },
      { status: 'assigned', timestamp: '2024-08-15T15:00:00', user: 'Diana Walsh', note: 'Assigned to Sarah Okafor' },
      { status: 'in progress', timestamp: '2024-08-16T08:00:00', user: 'Sarah Okafor', note: 'Seal replaced' },
      { status: 'resolved', timestamp: '2024-08-17T16:30:00', user: 'Sarah Okafor', note: 'Leak stopped, pressure tested OK' },
    ],
    comments: [
      { id: 'c3', user: 'Sarah Okafor', text: 'Used OEM seal kit #HP-4420.', timestamp: '2024-08-16T12:00:00' },
    ],
  },
  {
    id: 'TKT-2024-005',
    equipmentId: 'eq-5',
    title: 'Robot arm calibration drift',
    description: 'Pick-and-place accuracy degraded by ~2mm over last shift.',
    urgency: 'low',
    status: 'closed',
    assignedTo: 'tech-4',
    createdBy: 'Alex Rivera',
    createdAt: '2024-08-10T09:00:00',
    updatedAt: '2024-08-12T11:00:00',
    photo: null,
    history: [
      { status: 'open', timestamp: '2024-08-10T09:00:00', user: 'Alex Rivera', note: 'Ticket created' },
      { status: 'assigned', timestamp: '2024-08-10T10:00:00', user: 'Diana Walsh', note: 'Assigned to Emily Nakamura' },
      { status: 'in progress', timestamp: '2024-08-11T08:30:00', user: 'Emily Nakamura', note: 'Recalibrated end effector' },
      { status: 'resolved', timestamp: '2024-08-12T10:00:00', user: 'Emily Nakamura', note: 'Accuracy within spec' },
      { status: 'closed', timestamp: '2024-08-12T11:00:00', user: 'Diana Walsh', note: 'Verified by operator' },
    ],
    comments: [],
  },
  {
    id: 'TKT-2024-006',
    equipmentId: 'eq-6',
    title: 'Boiler pressure gauge reading low',
    description: 'Gauge showing 1.2 bar vs expected 1.8 bar. Safety valve not triggered.',
    urgency: 'low',
    status: 'open',
    assignedTo: null,
    createdBy: 'Alex Rivera',
    createdAt: '2024-08-22T11:30:00',
    updatedAt: '2024-08-22T11:30:00',
    photo: null,
    history: [
      { status: 'open', timestamp: '2024-08-22T11:30:00', user: 'Alex Rivera', note: 'Ticket created' },
    ],
    comments: [],
  },
  {
    id: 'TKT-2024-007',
    equipmentId: 'eq-1',
    title: 'Coolant level sensor fault',
    description: 'Sensor showing empty tank but visual check confirms adequate level.',
    urgency: 'low',
    status: 'assigned',
    assignedTo: 'tech-4',
    createdBy: 'Alex Rivera',
    createdAt: '2024-08-19T13:00:00',
    updatedAt: '2024-08-19T14:00:00',
    photo: null,
    history: [
      { status: 'open', timestamp: '2024-08-19T13:00:00', user: 'Alex Rivera', note: 'Ticket created' },
      { status: 'assigned', timestamp: '2024-08-19T14:00:00', user: 'Diana Walsh', note: 'Assigned to Emily Nakamura' },
    ],
    comments: [],
  },
]

export const INITIAL_NOTIFICATIONS = [
  { id: 'n1', type: 'critical', title: 'Critical ticket opened', message: 'TKT-2024-003 — HVAC Unit H-7 not cooling', timestamp: '2024-08-22T06:05:00', read: false },
  { id: 'n2', type: 'assignment', title: 'Ticket assigned to you', message: 'TKT-2024-002 — Belt misalignment', timestamp: '2024-08-21T11:00:00', read: false },
  { id: 'n3', type: 'update', title: 'Status updated', message: 'TKT-2024-001 moved to In Progress', timestamp: '2024-08-21T07:45:00', read: true },
  { id: 'n4', type: 'resolved', title: 'Ticket resolved', message: 'TKT-2024-004 — Hydraulic fluid leak fixed', timestamp: '2024-08-17T16:30:00', read: true },
  { id: 'n5', type: 'comment', title: 'New comment', message: 'Marcus Chen commented on TKT-2024-001', timestamp: '2024-08-21T16:00:00', read: false },
]

export const CHART_TICKETS_BY_EQUIPMENT = [
  { equipment: 'CNC Mill #3', tickets: 12 },
  { equipment: 'Conveyor B-12', tickets: 8 },
  { equipment: 'HVAC H-7', tickets: 6 },
  { equipment: 'Hydraulic P-2', tickets: 5 },
  { equipment: 'Robot R-5', tickets: 4 },
  { equipment: 'Boiler BS-1', tickets: 3 },
]

export const CHART_TICKETS_OVER_TIME = [
  { date: 'Aug 12', tickets: 3 },
  { date: 'Aug 13', tickets: 5 },
  { date: 'Aug 14', tickets: 2 },
  { date: 'Aug 15', tickets: 7 },
  { date: 'Aug 16', tickets: 4 },
  { date: 'Aug 17', tickets: 6 },
  { date: 'Aug 18', tickets: 3 },
  { date: 'Aug 19', tickets: 8 },
  { date: 'Aug 20', tickets: 5 },
  { date: 'Aug 21', tickets: 9 },
  { date: 'Aug 22', tickets: 4 },
]

export function getEquipmentName(equipmentId) {
  return EQUIPMENT.find((e) => e.id === equipmentId)?.name ?? 'Unknown'
}

export function getTechnicianName(techId) {
  if (!techId) return 'Unassigned'
  return TECHNICIANS.find((t) => t.id === techId)?.name ?? 'Unknown'
}
