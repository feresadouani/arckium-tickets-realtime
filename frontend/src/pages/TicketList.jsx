import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTickets } from '../context/TicketContext'
import { useAuth } from '../context/AuthContext'
import { useEquipments } from '../context/EquipmentContext'
import { STATUS_OPTIONS, URGENCY_OPTIONS } from '../data/mockData'
import { filterTicketsByRole } from '../utils/ticketAccess'
import { exportTicketsPdf } from '../utils/exportTicketsPdf'
import StatusBadge from '../components/ui/StatusBadge'
import UrgencyBadge from '../components/ui/UrgencyBadge'
import Pagination from '../components/ui/Pagination'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const STATUS_LABELS = {
  open: 'Open',
  assigned: 'Assigned',
  'in progress': 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

const URGENCY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  critical: 'Critical',
}

const INITIAL_FILTERS = {
  search: '',
  status: 'all',
  urgency: 'all',
  equipment: 'all',
  technician: 'all',
  dateFrom: '',
  dateTo: '',
}

const PAGE_SIZE = 8

export default function TicketList() {
  const { tickets, loading, error, technicians, getTechnicianName } = useTickets()
  const { user } = useAuth()
  const { equipments, getEquipmentName } = useEquipments()
  const canCreate = ['admin', 'manager', 'technician', 'operator'].includes(user?.role)
  const isTechnician = user?.role === 'technician'
  const canFilterTechnician = !isTechnician

  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [page, setPage] = useState(1)

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS)
    setPage(1)
  }

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'search') return value.trim() !== ''
    return value !== INITIAL_FILTERS[key]
  })

  const visibleTickets = useMemo(
    () => filterTicketsByRole(tickets, user),
    [tickets, user]
  )

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase()
    const from = filters.dateFrom ? new Date(filters.dateFrom) : null
    const to = filters.dateTo ? new Date(filters.dateTo) : null
    if (to) to.setHours(23, 59, 59, 999)

    return visibleTickets.filter((t) => {
      const eqName = getEquipmentName(t.equipmentId).toLowerCase()
      const techName = getTechnicianName(t.assignedTo).toLowerCase()
      const createdBy = (t.createdBy ?? '').toLowerCase()
      const numero = (t.numero_ticket ?? t.id ?? '').toLowerCase()
      const title = (t.title ?? '').toLowerCase()

      const matchSearch =
        !search ||
        numero.includes(search) ||
        title.includes(search) ||
        eqName.includes(search) ||
        techName.includes(search) ||
        createdBy.includes(search)

      const matchStatus = filters.status === 'all' || t.status === filters.status
      const matchUrgency = filters.urgency === 'all' || t.urgency === filters.urgency
      const matchEquipment =
        filters.equipment === 'all' || String(t.equipmentId) === String(filters.equipment)
      const matchTechnician =
        filters.technician === 'all' ||
        (filters.technician === 'unassigned'
          ? !t.assignedTo
          : String(t.assignedTo) === String(filters.technician))

      const created = t.createdAt ? new Date(t.createdAt) : null
      const matchFrom = !from || (created && created >= from)
      const matchTo = !to || (created && created <= to)

      return (
        matchSearch &&
        matchStatus &&
        matchUrgency &&
        matchEquipment &&
        matchTechnician &&
        matchFrom &&
        matchTo
      )
    })
  }, [visibleTickets, filters, getEquipmentName, getTechnicianName])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, safePage])

  const handleExportPdf = () => {
    exportTicketsPdf({
      tickets: filtered,
      getEquipmentName,
      getTechnicianName,
      exportedBy: user?.name,
      title: isTechnician ? 'My tickets' : 'Ticket list',
    })
  }

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tickets</h2>
          <p className="text-sm text-slate-500">
            {isTechnician
              ? `${filtered.length} ticket${filtered.length !== 1 ? 's' : ''} assigned to you`
              : `${filtered.length} ticket${filtered.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export PDF
          </button>
          {canCreate && (
            <Link
              to="/tickets/new"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New ticket
            </Link>
          )}
        </div>
      </div>

      <div className="mb-6 space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Search & advanced filters
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              Reset filters
            </button>
          )}
        </div>

        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search #, title, equipment, technician, creator…"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm capitalize focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
            ))}
          </select>

          <select
            value={filters.urgency}
            onChange={(e) => updateFilter('urgency', e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="all">All urgencies</option>
            {URGENCY_OPTIONS.map((u) => (
              <option key={u} value={u}>{URGENCY_LABELS[u] ?? u}</option>
            ))}
          </select>

          <select
            value={filters.equipment}
            onChange={(e) => updateFilter('equipment', e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="all">All equipment</option>
            {equipments.map((eq) => (
              <option key={eq.id} value={eq.id}>{eq.name}</option>
            ))}
          </select>

          {canFilterTechnician && (
            <select
              value={filters.technician}
              onChange={(e) => updateFilter('technician', e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="all">All technicians</option>
              <option value="unassigned">Unassigned</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>{tech.name}</option>
              ))}
            </select>
          )}

          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => updateFilter('dateFrom', e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            title="Start date"
          />

          <input
            type="date"
            value={filters.dateTo}
            min={filters.dateFrom || undefined}
            onChange={(e) => updateFilter('dateTo', e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            title="End date"
          />
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">Loading tickets…</div>
        ) : (
          <>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 font-semibold text-slate-600">Ticket #</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Equipment</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Title</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Urgency</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Technician</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link to={`/tickets/${ticket.id}`} className="font-medium text-primary-600 hover:text-primary-700">
                        {ticket.numero_ticket ?? ticket.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{getEquipmentName(ticket.equipmentId)}</td>
                    <td className="max-w-xs truncate px-4 py-3 text-slate-700">{ticket.title}</td>
                    <td className="px-4 py-3"><UrgencyBadge urgency={ticket.urgency} /></td>
                    <td className="px-4 py-3"><StatusBadge status={ticket.status} /></td>
                    <td className="px-4 py-3 text-slate-600">{getTechnicianName(ticket.assignedTo)}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(ticket.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-slate-400">No tickets match the filters</div>
            )}
            <Pagination
              page={safePage}
              pageSize={PAGE_SIZE}
              total={filtered.length}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <div className="space-y-3 md:hidden">
        {loading && (
          <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400">
            Loading tickets…
          </div>
        )}
        {!loading && paginated.map((ticket) => (
          <Link
            key={ticket.id}
            to={`/tickets/${ticket.id}`}
            className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-semibold text-primary-600">{ticket.numero_ticket ?? ticket.id}</span>
              <UrgencyBadge urgency={ticket.urgency} />
            </div>
            <p className="mt-1 font-medium text-slate-900">{ticket.title}</p>
            <p className="mt-0.5 text-sm text-slate-500">{getEquipmentName(ticket.equipmentId)}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={ticket.status} />
              <span className="text-xs text-slate-400">{getTechnicianName(ticket.assignedTo)}</span>
              <span className="text-xs text-slate-400">· {formatDate(ticket.createdAt)}</span>
            </div>
          </Link>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-sm text-slate-400">
            No tickets match the filters
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <Pagination
              page={safePage}
              pageSize={PAGE_SIZE}
              total={filtered.length}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}
