import { describe, it, expect } from 'vitest'
import { filterTicketsByRole, canAccessTicket } from './ticketAccess'

const tickets = [
  { id: '1', assignedTo: 't1', createdBy: 'Op One' },
  { id: '2', assignedTo: 't2', createdBy: 'Op Two' },
  { id: '3', assignedTo: null, createdBy: 'Op One' },
]

describe('ticketAccess', () => {
  it('returns all tickets when user is missing', () => {
    expect(filterTicketsByRole(tickets, null)).toEqual(tickets)
  })

  it('filters tickets for technician', () => {
    const user = { id: 't1', role: 'technician', name: 'Tech' }
    expect(filterTicketsByRole(tickets, user)).toEqual([tickets[0]])
  })

  it('filters tickets for operator', () => {
    const user = { id: 'o1', role: 'operator', name: 'Op One' }
    const result = filterTicketsByRole(tickets, user)
    expect(result.map((t) => t.id)).toEqual(['1', '3'])
  })

  it('allows admin to access any ticket', () => {
    const admin = { id: 'a1', role: 'admin', name: 'Admin' }
    expect(canAccessTicket(tickets[1], admin)).toBe(true)
  })

  it('restricts technician to assigned tickets', () => {
    const tech = { id: 't1', role: 'technician', name: 'Tech' }
    expect(canAccessTicket(tickets[0], tech)).toBe(true)
    expect(canAccessTicket(tickets[1], tech)).toBe(false)
  })
})
