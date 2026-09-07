import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useTickets } from '../context/TicketContext'
import { useEquipments } from '../context/EquipmentContext'

const STATUS_COLORS = {
  open: '#3b82f6',
  assigned: '#8b5cf6',
  'in progress': '#f59e0b',
  resolved: '#10b981',
  closed: '#64748b',
}

const URGENCY_COLORS = {
  low: '#94a3b8',
  medium: '#f59e0b',
  critical: '#ef4444',
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

function KpiCard({ label, value, sub, icon, color }) {
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

function emptyChartMessage(message) {
  return (
    <div className="flex h-72 items-center justify-center text-sm text-slate-400">
      {message}
    </div>
  )
}

export default function Dashboard() {
  const { tickets, loading } = useTickets()
  const { equipments, getEquipmentName } = useEquipments()

  const stats = useMemo(() => {
    const openTickets = tickets.filter(
      (t) => !['resolved', 'closed'].includes(t.status)
    ).length

    const criticalOpen = tickets.filter(
      (t) => t.urgency === 'critical' && !['resolved', 'closed'].includes(t.status)
    ).length

    const unassigned = tickets.filter(
      (t) => !t.assignedTo && !['resolved', 'closed'].includes(t.status)
    ).length

    const resolvedThisWeek = tickets.filter((t) => {
      if (!['resolved', 'closed'].includes(t.status)) return false
      const updated = new Date(t.updatedAt)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return updated >= weekAgo
    }).length

    const resolvedTickets = tickets.filter((t) =>
      ['resolved', 'closed'].includes(t.status)
    )
    let avgHours = 0
    if (resolvedTickets.length > 0) {
      const totalHours = resolvedTickets.reduce((sum, t) => {
        const created = new Date(t.createdAt)
        const resolved = new Date(t.updatedAt)
        return sum + (resolved - created) / 3600000
      }, 0)
      avgHours = Math.round(totalHours / resolvedTickets.length)
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentTickets = tickets.filter((t) => new Date(t.createdAt) >= thirtyDaysAgo)

    const byEquipmentMap = {}
    for (const t of recentTickets) {
      const name = getEquipmentName(t.equipmentId) || 'No equipment'
      byEquipmentMap[name] = (byEquipmentMap[name] ?? 0) + 1
    }
    const byEquipment = Object.entries(byEquipmentMap)
      .map(([equipment, count]) => ({ equipment, tickets: count }))
      .sort((a, b) => b.tickets - a.tickets)
      .slice(0, 8)

    if (byEquipment.length === 0 && equipments.length > 0) {
      // show equipment with 0 if no recent tickets but assets exist
    }

    const byDayMap = {}
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      byDayMap[key] = 0
    }
    for (const t of tickets) {
      const key = new Date(t.createdAt).toISOString().slice(0, 10)
      if (key in byDayMap) byDayMap[key] += 1
    }
    const overTime = Object.entries(byDayMap).map(([iso, count]) => ({
      date: new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      tickets: count,
    }))

    const byStatus = Object.entries(
      tickets.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] ?? 0) + 1
        return acc
      }, {})
    ).map(([status, value]) => ({
      name: STATUS_LABELS[status] ?? status,
      value,
      status,
    }))

    const byUrgency = Object.entries(
      tickets.reduce((acc, t) => {
        acc[t.urgency] = (acc[t.urgency] ?? 0) + 1
        return acc
      }, {})
    ).map(([urgency, value]) => ({
      name: URGENCY_LABELS[urgency] ?? urgency,
      value,
      urgency,
    }))

    return {
      total: tickets.length,
      openTickets,
      criticalOpen,
      unassigned,
      resolvedThisWeek,
      avgHours,
      byEquipment,
      overTime,
      byStatus,
      byUrgency,
    }
  }, [tickets, equipments, getEquipmentName])

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-slate-400">
        Loading statistics…
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-500">
          Maintenance statistics · {stats.total} ticket{stats.total !== 1 ? 's' : ''} total
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Open tickets"
          value={stats.openTickets}
          sub="Awaiting resolution"
          color="bg-blue-100"
          icon={
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
          }
        />
        <KpiCard
          label="Average resolution time"
          value={`${stats.avgHours}h`}
          sub="On resolved tickets"
          color="bg-amber-100"
          icon={
            <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KpiCard
          label="Resolved this week"
          value={stats.resolvedThisWeek}
          sub="Last 7 days"
          color="bg-emerald-100"
          icon={
            <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KpiCard
          label="Critical / unassigned"
          value={`${stats.criticalOpen} / ${stats.unassigned}`}
          sub="Open urgent · no technician"
          color="bg-red-100"
          icon={
            <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          }
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Tickets by equipment</h3>
          <p className="text-xs text-slate-500">Last 30 days</p>
          {stats.byEquipment.length === 0 ? (
            emptyChartMessage('No recent tickets')
          ) : (
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byEquipment} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="equipment"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    angle={-25}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="tickets" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Tickets over time</h3>
          <p className="text-xs text-slate-500">Daily volume (14 days)</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.overTime} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '13px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="tickets"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: '#2563eb', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Breakdown by status</h3>
          <p className="text-xs text-slate-500">All tickets</p>
          {stats.byStatus.length === 0 ? (
            emptyChartMessage('No data')
          ) : (
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.byStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {stats.byStatus.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status] ?? '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '13px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Breakdown by urgency</h3>
          <p className="text-xs text-slate-500">All tickets</p>
          {stats.byUrgency.length === 0 ? (
            emptyChartMessage('No data')
          ) : (
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.byUrgency}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {stats.byUrgency.map((entry) => (
                      <Cell
                        key={entry.urgency}
                        fill={URGENCY_COLORS[entry.urgency] ?? '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '13px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
