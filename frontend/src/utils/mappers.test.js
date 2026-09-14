import { describe, it, expect } from 'vitest'
import {
  mapRoleFromBackend,
  mapRoleToBackend,
  mapStatusFromBackend,
  mapStatusToBackend,
  mapUrgencyFromBackend,
  mapUrgencyToBackend,
  mapUserFromBackend,
} from './mappers'

describe('mappers', () => {
  it('maps roles both ways', () => {
    expect(mapRoleToBackend('technician')).toBe('technicien')
    expect(mapRoleFromBackend('technicien')).toBe('technician')
    expect(mapRoleToBackend('manager')).toBe('responsable')
    expect(mapRoleFromBackend('responsable')).toBe('manager')
  })

  it('maps statuses both ways', () => {
    expect(mapStatusToBackend('in progress')).toBe('en_cours')
    expect(mapStatusFromBackend('en_cours')).toBe('in progress')
    expect(mapStatusToBackend('open')).toBe('ouvert')
  })

  it('maps urgency both ways', () => {
    expect(mapUrgencyToBackend('critical')).toBe('elevee')
    expect(mapUrgencyFromBackend('elevee')).toBe('critical')
  })

  it('maps user profile from backend', () => {
    const user = mapUserFromBackend({
      _id: 'abc123',
      email: 'tech@test.com',
      firstname: 'Ada',
      lastname: 'Lovelace',
      role: 'technicien',
      active: true,
    })

    expect(user).toEqual({
      id: 'abc123',
      email: 'tech@test.com',
      name: 'Ada Lovelace',
      role: 'technician',
      firstname: 'Ada',
      lastname: 'Lovelace',
      active: true,
    })
  })

  it('returns null for missing profile', () => {
    expect(mapUserFromBackend(null)).toBeNull()
  })
})
