/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { equipmentsApi } from '../services/api'
import { useAuth } from './AuthContext'

const EquipmentContext = createContext(null)

function mapEquipmentFromBackend(item) {
  const id = item._id?.toString?.() ?? item._id ?? item.id
  return {
    id,
    name: item.nom,
    location: item.localisation,
    reference: item.reference ?? null,
  }
}

export function EquipmentProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [equipments, setEquipments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchEquipments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await equipmentsApi.getAll()
      const list = Array.isArray(data) ? data : []
      setEquipments(list.map(mapEquipmentFromBackend))
    } catch (err) {
      setError(err.message || 'Unable to load equipment')
      setEquipments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function syncEquipments() {
      // Yield so setState is not synchronous inside the effect body
      await Promise.resolve()
      if (cancelled) return

      if (!isAuthenticated) {
        setEquipments([])
        return
      }
      await fetchEquipments()
    }

    void syncEquipments()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, fetchEquipments])

  const createEquipment = useCallback(async (data) => {
    const created = await equipmentsApi.create({
      nom: data.name,
      localisation: data.location,
      reference: data.reference || undefined,
    })
    const mapped = mapEquipmentFromBackend(created)
    setEquipments((prev) => [...prev, mapped])
    return mapped
  }, [])

  const getEquipmentName = useCallback(
    (equipmentId) => {
      if (!equipmentId) return '—'
      const normalizedId = String(equipmentId)
      const eq = equipments.find((e) => String(e.id) === normalizedId)
      return eq?.name ?? 'Unknown equipment'
    },
    [equipments]
  )

  return (
    <EquipmentContext.Provider
      value={{
        equipments,
        loading,
        error,
        fetchEquipments,
        createEquipment,
        getEquipmentName,
      }}
    >
      {children}
    </EquipmentContext.Provider>
  )
}

export function useEquipments() {
  const ctx = useContext(EquipmentContext)
  if (!ctx) throw new Error('useEquipments must be used within EquipmentProvider')
  return ctx
}
