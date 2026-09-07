const URGENCY_STYLES = {
  low: { badge: 'bg-slate-100 text-slate-600 ring-slate-200', dot: 'bg-slate-400' },
  medium: { badge: 'bg-amber-100 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
  critical: { badge: 'bg-red-100 text-red-700 ring-red-200', dot: 'bg-red-500' },
}

const URGENCY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  critical: 'Critical',
}

export default function UrgencyBadge({ urgency, showDot = true }) {
  const style = URGENCY_STYLES[urgency] ?? URGENCY_STYLES.low
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style.badge}`}>
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />}
      {URGENCY_LABELS[urgency] ?? urgency}
    </span>
  )
}
