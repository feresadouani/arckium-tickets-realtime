/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { ticketsApi, usersApi } from '../services/api'
import { mapTicketFromBackend, mapTicketToBackend, mapUserToTechnician } from '../utils/mappers'
import { useAuth } from './AuthContext'

const TicketContext = createContext(null)

export function TicketProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [tickets, setTickets] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const ticketsData = await ticketsApi.getAll()
      const list = Array.isArray(ticketsData) ? ticketsData : []
      setTickets(list.map(mapTicketFromBackend))
    } catch (err) {
      setError(err.message || 'Unable to load tickets')
      setTickets([])
    }

    try {
      const usersData = await usersApi.getAll()
      const techs = (Array.isArray(usersData) ? usersData : [])
        .filter((u) => u.role === 'technicien' && u.active !== false)
        .map(mapUserToTechnician)
      setTechnicians(techs)
    } catch {
      setTechnicians([])
    } finally {
      setLoading(false)
    }
  }, [])

  const getTechnicianName = useCallback(
    (techId) => {
      if (!techId) return 'Unassigned'
      const normalizedId = String(techId)
      return technicians.find((t) => String(t.id) === normalizedId)?.name ?? 'Unassigned'
    },
    [technicians]
  )

  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets()
    } else {
      setTickets([])
    }
  }, [isAuthenticated, fetchTickets])

  const getTicket = useCallback(
    (id) =>
      tickets.find(
        (t) => String(t.id) === String(id) || String(t.numero_ticket) === String(id)
      ),
    [tickets]
  )

  const createTicket = useCallback(async (data) => {
    const payload = mapTicketToBackend({
      ...data,
      status: data.assignedTo ? 'assigned' : 'open',
      createdAt: new Date().toISOString(),
    })

    const created = await ticketsApi.create(payload)
    const ticket = mapTicketFromBackend(created)
    setTickets((prev) => [ticket, ...prev])
    return ticket
  }, [])

  const deleteTicket = useCallback(async (id) => {
    await ticketsApi.delete(id)
    setTickets((prev) => prev.filter((t) => String(t.id) !== String(id)))
  }, [])

  const updateTicket = useCallback(async (id, updates) => {
    const current = tickets.find((t) => String(t.id) === String(id))
    if (!current) return

    const merged = { ...current, ...updates }
    const payload = mapTicketToBackend({
      title: merged.title,
      description: merged.description,
      urgency: merged.urgency,
      status: merged.status,
      assignedTo: merged.assignedTo,
      equipmentId: merged.equipmentId,
      createdBy: merged.createdBy,
      createdAt: merged.createdAt,
      numero_ticket: merged.numero_ticket,
      date_assignation: updates.assignedTo
        ? new Date().toISOString()
        : merged.date_assignation,
      date_resolution: merged.date_resolution,
      updatedAt: new Date().toISOString(),
    })

    const saved = await ticketsApi.update(id, payload)
    const mapped = mapTicketFromBackend(saved)

    setTickets((prev) =>
      prev.map((t) => {
        if (String(t.id) !== String(id)) return t
        return {
          ...mapped,
          photo: t.photo ?? mapped.photo,
        }
      })
    )
  }, [tickets])

  const assignTechnician = useCallback(
    async (id, techId, assignedBy) => {
      await updateTicket(id, {
        assignedTo: techId,
        status: 'assigned',
        updatedBy: assignedBy,
        statusNote: 'Technician assigned',
      })
    },
    [updateTicket]
  )

  const addComment = useCallback(async (id, comment) => {
    const saved = await ticketsApi.addComment(id, {
      text: comment.text,
    })
    const mapped = mapTicketFromBackend(saved)
    setTickets((prev) =>
      prev.map((t) => {
        if (String(t.id) !== String(id)) return t
        return {
          ...t,
          ...mapped,
          photo: t.photo ?? mapped.photo,
        }
      })
    )
    return mapped.comments
  }, [])

  return (
    <TicketContext.Provider
      value={{
        tickets,
        technicians,
        loading,
        error,
        fetchTickets,
        getTicket,
        getTechnicianName,
        createTicket,
        updateTicket,
        assignTechnician,
        addComment,
        deleteTicket,
      }}
    >
      {children}
    </TicketContext.Provider>
  )
}

export function useTickets() {
  const ctx = useContext(TicketContext)
  if (!ctx) throw new Error('useTickets must be used within TicketProvider')
  return ctx
}
