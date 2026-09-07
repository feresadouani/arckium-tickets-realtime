import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const STATUS_EN = {
  open: 'Open',
  assigned: 'Assigned',
  'in progress': 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
}

const URGENCY_EN = {
  low: 'Low',
  medium: 'Medium',
  critical: 'Critical',
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/** Export filtered tickets list as PDF. */
export function exportTicketsPdf({
  tickets,
  getEquipmentName,
  getTechnicianName,
  exportedBy,
  title = 'Ticket list',
}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const now = new Date()

  doc.setFontSize(16)
  doc.text('Arckium Tickets — ' + title, 14, 16)

  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(
    `Exported on ${now.toLocaleString('en-US')} · ${tickets.length} ticket(s)` +
      (exportedBy ? ` · By ${exportedBy}` : ''),
    14,
    22
  )
  doc.setTextColor(0)

  const rows = tickets.map((t) => [
    t.numero_ticket ?? t.id,
    t.title ?? '',
    getEquipmentName?.(t.equipmentId) ?? '—',
    URGENCY_EN[t.urgency] ?? t.urgency ?? '—',
    STATUS_EN[t.status] ?? t.status ?? '—',
    getTechnicianName?.(t.assignedTo) ?? '—',
    formatDate(t.createdAt),
  ])

  autoTable(doc, {
    startY: 28,
    head: [['#', 'Title', 'Equipment', 'Urgency', 'Status', 'Technician', 'Date']],
    body: rows,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 55 },
      2: { cellWidth: 40 },
      3: { cellWidth: 22 },
      4: { cellWidth: 24 },
      5: { cellWidth: 35 },
      6: { cellWidth: 24 },
    },
  })

  const filename = `tickets-arckium-${now.toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
}
