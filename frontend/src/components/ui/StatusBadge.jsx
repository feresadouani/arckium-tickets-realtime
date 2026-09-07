const STATUS_STYLES = {
  open: 'bg-blue-100 text-blue-700 ring-blue-200',
  assigned: 'bg-purple-100 text-purple-700 ring-purple-200',
  'in progress': 'bg-amber-100 text-amber-700 ring-amber-200',
  resolved: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  closed: 'bg-slate-100 text-slate-600 ring-slate-200',
}

const STATUS_LABELS = {
  open: 'Open',
  assigned: 'Assigned',
  'in progress': 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.open
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
