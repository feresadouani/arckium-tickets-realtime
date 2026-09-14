import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { usersApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { mapUserFromBackend, mapRoleFromBackend } from '../utils/mappers'
import Pagination from '../components/ui/Pagination'

const ROLE_LABELS = {
  admin: 'Administrator',
  manager: 'Manager',
  technician: 'Technician',
  operator: 'Operator',
}

const PAGE_SIZE = 8

export default function Users() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [page, setPage] = useState(1)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await usersApi.getAll()
      const list = (Array.isArray(data) ? data : []).map((u) => ({
        ...mapUserFromBackend(u),
        role: mapRoleFromBackend(u.role),
      }))
      setUsers(list)
    } catch (err) {
      setError(err.message || 'Unable to load users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadUsers() {
      // Yield so setState is not synchronous inside the effect body
      await Promise.resolve()
      if (cancelled) return
      await fetchUsers()
    }

    void loadUsers()
    return () => {
      cancelled = true
    }
  }, [fetchUsers])

  const handleEnable = async (id) => {
    setActionLoading(id)
    try {
      await usersApi.enable(id)
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: true } : u)))
    } catch (err) {
      setError(err.message || 'Error enabling user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDisable = async (id) => {
    if (id === currentUser?.id) {
      setError('You cannot disable your own account')
      return
    }
    setActionLoading(id)
    try {
      await usersApi.disable(id)
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: false } : u)))
    } catch (err) {
      setError(err.message || 'Error disabling user')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id) => {
    if (id === currentUser?.id) {
      setError('You cannot delete your own account')
      return
    }
    if (!window.confirm('Permanently delete this user?')) return

    setActionLoading(id)
    try {
      await usersApi.delete(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (err) {
      setError(err.message || 'Error deleting user')
    } finally {
      setActionLoading(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return users.slice(start, start + PAGE_SIZE)
  }, [users, safePage])

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Users</h2>
          <p className="text-sm text-slate-500">
            {users.length} account{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/users/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New user
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">Loading…</div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            No users.{' '}
            <Link to="/users/new" className="font-medium text-primary-600 hover:text-primary-700">
              Create one
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 font-semibold text-slate-600">Name</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Email</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Role</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((u) => {
                  const isSelf = u.id === currentUser?.id
                  const busy = actionLoading === u.id
                  return (
                    <tr key={u.id} className="border-b border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                      <td className="px-4 py-3 text-slate-600">{u.email}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {ROLE_LABELS[u.role] ?? u.role}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                            u.active !== false
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                              : 'bg-slate-100 text-slate-600 ring-slate-200'
                          }`}
                        >
                          {u.active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {u.active !== false ? (
                            <button
                              type="button"
                              disabled={busy || isSelf}
                              onClick={() => handleDisable(u.id)}
                              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                            >
                              Disable
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleEnable(u.id)}
                              className="rounded-md border border-emerald-300 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
                            >
                              Enable
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={busy || isSelf}
                            onClick={() => handleDelete(u.id)}
                            className="rounded-md border border-red-300 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-40"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <Pagination
              page={safePage}
              pageSize={PAGE_SIZE}
              total={users.length}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}
