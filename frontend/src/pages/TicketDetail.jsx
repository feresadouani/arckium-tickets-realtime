import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useTickets } from '../context/TicketContext'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { useEquipments } from '../context/EquipmentContext'
import { canAccessTicket } from '../utils/ticketAccess'
import StatusBadge from '../components/ui/StatusBadge'
import UrgencyBadge from '../components/ui/UrgencyBadge'

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const ROLE_LABELS = {
  admin: 'Admin',
  manager: 'Manager',
  technician: 'Technician',
  operator: 'Operator',
}

const ROLE_BADGE = {
  admin: 'bg-violet-100 text-violet-700 ring-violet-200',
  manager: 'bg-sky-100 text-sky-700 ring-sky-200',
  technician: 'bg-amber-100 text-amber-800 ring-amber-200',
  operator: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
}

const STATUS_LABELS = {
  open: 'Open',
  assigned: 'Assigned',
  'in progress': 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

export default function TicketDetail() {
  const { id } = useParams()
  const { getTicket, assignTechnician, addComment, updateTicket, technicians, getTechnicianName, loading } = useTickets()
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const { equipments } = useEquipments()
  const ticket = getTicket(id)

  const [comment, setComment] = useState('')
  const [posting, setPosting] = useState(false)
  const [commentError, setCommentError] = useState('')
  const [actionError, setActionError] = useState('')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedTech, setSelectedTech] = useState('')

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-slate-400">
        Loading ticket…
      </div>
    )
  }

  if (!ticket) return <Navigate to="/tickets" replace />
  if (!canAccessTicket(ticket, user)) return <Navigate to="/tickets" replace />

  const equipment = equipments.find((e) => String(e.id) === String(ticket.equipmentId))
  const canAssign = ['admin', 'manager'].includes(user.role)
  const canComment = ['admin', 'manager', 'technician', 'operator'].includes(user.role)
  const canUpdateStatus =
    ['admin', 'manager'].includes(user.role) ||
    (user.role === 'technician' && String(ticket.assignedTo) === String(user.id))

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim() || posting) return

    setPosting(true)
    setCommentError('')
    try {
      await addComment(ticket.id, { text: comment.trim() })
      setComment('')
    } catch (err) {
      setCommentError(err.message || 'Unable to send comment')
    } finally {
      setPosting(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedTech) return
    setActionError('')
    try {
      await assignTechnician(ticket.id, selectedTech, user.name)
      addNotification({
        type: 'assignment',
        title: 'Ticket assigned',
        message: `${ticket.numero_ticket ?? ticket.id} assigned to ${getTechnicianName(selectedTech)}`,
        timestamp: new Date().toISOString(),
      })
      setShowAssignModal(false)
      setSelectedTech('')
    } catch (err) {
      setActionError(err.message || 'Unable to assign technician')
    }
  }

  const handleStatusChange = async (newStatus) => {
    setActionError('')
    try {
      await updateTicket(ticket.id, {
        status: newStatus,
        updatedBy: user.name,
        statusNote: `Status changed to ${STATUS_LABELS[newStatus] ?? newStatus}`,
      })
    } catch (err) {
      setActionError(err.message || 'Unable to change status')
    }
  }

  const sortedComments = [...(ticket.comments ?? [])].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  )

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/tickets" className="mb-4 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to tickets
      </Link>

      {actionError && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {actionError}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-primary-600">
                  {ticket.numero_ticket ?? ticket.id}
                </span>
                <UrgencyBadge urgency={ticket.urgency} />
                <StatusBadge status={ticket.status} />
              </div>
              <h2 className="mt-2 text-xl font-bold text-slate-900">{ticket.title}</h2>
              <p className="mt-1 text-sm text-slate-500">
                Created by {ticket.createdBy} · {formatDateTime(ticket.createdAt)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {canAssign && (
                <button
                  type="button"
                  onClick={() => setShowAssignModal(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Assign technician
                </button>
              )}
              {canUpdateStatus && ticket.status !== 'closed' && (
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  {['open', 'assigned', 'in progress', 'resolved', 'closed'].map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Description</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{ticket.description}</p>
            </div>

            {ticket.photo && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Attached photo</h3>
                <p className="mt-1 text-sm text-slate-500">{ticket.photo}</p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900">Discussion</h3>
                <span className="text-xs text-slate-400">
                  {sortedComments.length} message{sortedComments.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Discussion thread between operators, technicians, and managers
              </p>

              <div className="mt-4 max-h-96 space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                {sortedComments.length === 0 && (
                  <p className="py-8 text-center text-sm text-slate-400">
                    No messages yet. Start the discussion below.
                  </p>
                )}
                {sortedComments.map((c) => {
                  const isMine = c.userId && String(c.userId) === String(user.id)
                  const roleKey = c.role ?? 'technician'
                  return (
                    <div
                      key={c.id}
                      className={`flex gap-3 ${isMine ? 'flex-row-reverse' : ''}`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${
                          isMine ? 'bg-primary-600' : 'bg-slate-500'
                        }`}
                      >
                        {(c.user ?? '?').charAt(0).toUpperCase()}
                      </div>
                      <div
                        className={`min-w-0 max-w-[85%] rounded-xl px-3.5 py-2.5 shadow-sm ring-1 ring-slate-200 ${
                          isMine ? 'bg-primary-50 ring-primary-100' : 'bg-white'
                        }`}
                      >
                        <div className={`flex flex-wrap items-center gap-2 ${isMine ? 'justify-end' : ''}`}>
                          <span className="text-sm font-medium text-slate-800">{c.user}</span>
                          {ROLE_LABELS[roleKey] && (
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${
                                ROLE_BADGE[roleKey] ?? 'bg-slate-100 text-slate-600 ring-slate-200'
                              }`}
                            >
                              {ROLE_LABELS[roleKey]}
                            </span>
                          )}
                        </div>
                        <p className={`mt-1 whitespace-pre-wrap text-sm text-slate-700 ${isMine ? 'text-right' : ''}`}>
                          {c.text}
                        </p>
                        <p className={`mt-1 text-[11px] text-slate-400 ${isMine ? 'text-right' : ''}`}>
                          {formatDateTime(c.timestamp)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {canComment && (
                <form onSubmit={handleComment} className="mt-4">
                  {commentError && (
                    <div className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
                      {commentError}
                    </div>
                  )}
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="Write a message in the discussion…"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={!comment.trim() || posting}
                      className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                    >
                      {posting ? 'Sending…' : 'Send'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Details</h3>
              <dl className="mt-3 space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">Equipment</dt>
                  <dd className="font-medium text-slate-800">{equipment?.name}</dd>
                  <dd className="text-xs text-slate-400">{equipment?.location}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Assigned to</dt>
                  <dd className="font-medium text-slate-800">{getTechnicianName(ticket.assignedTo)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Last updated</dt>
                  <dd className="text-slate-700">{formatDateTime(ticket.updatedAt)}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Status history</h3>
              <ol className="mt-4 space-y-0">
                {ticket.history.map((entry, i) => (
                  <li key={i} className="relative flex gap-3 pb-6 last:pb-0">
                    {i < ticket.history.length - 1 && (
                      <span className="absolute left-[11px] top-6 h-full w-0.5 bg-slate-200" />
                    )}
                    <span className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 ring-4 ring-white">
                      <span className="h-2 w-2 rounded-full bg-primary-600" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{STATUS_LABELS[entry.status] ?? entry.status}</p>
                      <p className="text-xs text-slate-500">{entry.note}</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {entry.user} · {formatDateTime(entry.timestamp)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      {showAssignModal && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/50" onClick={() => setShowAssignModal(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Assign technician</h3>
            <p className="mt-1 text-sm text-slate-500">
              Select a technician for {ticket.numero_ticket ?? ticket.id}
            </p>

            <div className="mt-4 space-y-2">
              {technicians.map((tech) => (
                <label
                  key={tech.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    selectedTech === tech.id
                      ? 'border-primary-300 bg-primary-50 ring-2 ring-primary-200'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="technician"
                    value={tech.id}
                    checked={selectedTech === tech.id}
                    onChange={(e) => setSelectedTech(e.target.value)}
                    className="text-primary-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{tech.name}</p>
                    <p className="text-xs text-slate-500">{tech.specialty}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssign}
                disabled={!selectedTech}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
              >
                Assign
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
