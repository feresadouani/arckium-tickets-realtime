import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTickets } from '../context/TicketContext'
import { useAuth } from '../context/AuthContext'
import { useEquipments } from '../context/EquipmentContext'
import { filterTicketsByRole } from '../utils/ticketAccess'
import StatusBadge from '../components/ui/StatusBadge'
import UrgencyBadge from '../components/ui/UrgencyBadge'

function KpiCard({ label, value, sub, color, icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const OPEN_STATUSES = ['open', 'assigned', 'in progress']

export default function TechnicianDashboard() {
  const { tickets, loading, getTechnicianName } = useTickets()
  const { user } = useAuth()
  const { getEquipmentName } = useEquipments()

  const myTickets = useMemo(
    () => filterTicketsByRole(tickets, user),
    [tickets, user]
  )

  const stats = useMemo(() => {
    const active = myTickets.filter((t) => OPEN_STATUSES.includes(t.status))
    const critical = active.filter((t) => t.urgency === 'critical')
    const inProgress = myTickets.filter((t) => t.status === 'in progress')
    const assigned = myTickets.filter((t) => t.status === 'assigned')

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const resolvedWeek = myTickets.filter((t) => {
      if (!['resolved', 'closed'].includes(t.status)) return false
      return new Date(t.updatedAt) >= weekAgo
    }).length

    const priorityQueue = [...active].sort((a, b) => {
      const urgencyRank = { critical: 0, medium: 1, low: 2 }
      const statusRank = { 'in progress': 0, assigned: 1, open: 2 }
      const u = (urgencyRank[a.urgency] ?? 9) - (urgencyRank[b.urgency] ?? 9)
      if (u !== 0) return u
      return (statusRank[a.status] ?? 9) - (statusRank[b.status] ?? 9)
    })

    return {
      activeCount: active.length,
      criticalCount: critical.length,
      inProgressCount: inProgress.length,
      assignedCount: assigned.length,
      resolvedWeek,
      priorityQueue: priorityQueue.slice(0, 8),
    }
  }, [myTickets])

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-slate-400">
        Loading dashboard…
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My dashboard</h2>
          <p className="text-sm text-slate-500">
            Hello {user?.name?.split(' ')[0] ?? ''} — overview of your assigned tickets
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/tickets"
            className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            All my tickets
          </Link>
          <Link
            to="/tickets/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
          >
            New ticket
          </Link>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Active tickets"
          value={stats.activeCount}
          sub="Open / assigned / in progress"
          color="bg-blue-100"
          icon={
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
          }
        />
        <KpiCard
          label="Critical"
          value={stats.criticalCount}
          sub="Handle first"
          color="bg-red-100"
          icon={
            <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          }
        />
        <KpiCard
          label="In progress"
          value={stats.inProgressCount}
          sub={`${stats.assignedCount} waiting (assigned)`}
          color="bg-amber-100"
          icon={
            <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KpiCard
          label="Resolved (7 d)"
          value={stats.resolvedWeek}
          sub="This week"
          color="bg-emerald-100"
          icon={
            <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Priority queue</h3>
            <p className="text-xs text-slate-500">Active tickets sorted by urgency</p>
          </div>
          <Link to="/tickets" className="text-xs font-medium text-primary-600 hover:text-primary-700">
            View all
          </Link>
        </div>

        {stats.priorityQueue.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            No active assigned tickets. Have a great day!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.priorityQueue.map((ticket) => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-primary-600">
                      {ticket.numero_ticket ?? ticket.id}
                    </span>
                    <UrgencyBadge urgency={ticket.urgency} />
                    <StatusBadge status={ticket.status} />
                  </div>
                  <p className="mt-1 truncate text-sm font-medium text-slate-900">{ticket.title}</p>
                  <p className="text-xs text-slate-500">
                    {getEquipmentName(ticket.equipmentId)} · {formatDate(ticket.createdAt)}
                  </p>
                </div>
                <span className="text-xs text-slate-400 sm:shrink-0">
                  {getTechnicianName(ticket.assignedTo)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
