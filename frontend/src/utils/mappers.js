/** Mapping rôles backend (FR) ↔ frontend (EN) */
const ROLE_TO_BACKEND = {
  admin: 'admin',
  technician: 'technicien',
  manager: 'responsable',
  operator: 'operateur',
}

const ROLE_FROM_BACKEND = {
  admin: 'admin',
  technicien: 'technician',
  responsable: 'manager',
  operateur: 'operator',
}

/** Mapping statuts */
const STATUS_TO_BACKEND = {
  open: 'ouvert',
  assigned: 'assigne',
  'in progress': 'en_cours',
  resolved: 'resolu',
  closed: 'cloture',
}

const STATUS_FROM_BACKEND = {
  ouvert: 'open',
  assigne: 'assigned',
  en_cours: 'in progress',
  resolu: 'resolved',
  cloture: 'closed',
}

/** Mapping urgence */
const URGENCY_TO_BACKEND = {
  low: 'faible',
  medium: 'moyenne',
  critical: 'elevee',
}

const URGENCY_FROM_BACKEND = {
  faible: 'low',
  moyenne: 'medium',
  elevee: 'critical',
}

export function mapRoleToBackend(role) {
  return ROLE_TO_BACKEND[role] ?? role
}

export function mapRoleFromBackend(role) {
  return ROLE_FROM_BACKEND[role] ?? role
}

export function mapStatusToBackend(status) {
  return STATUS_TO_BACKEND[status] ?? status
}

export function mapStatusFromBackend(status) {
  return STATUS_FROM_BACKEND[status] ?? status
}

export function mapUrgencyToBackend(urgency) {
  return URGENCY_TO_BACKEND[urgency] ?? urgency
}

export function mapUrgencyFromBackend(urgency) {
  return URGENCY_FROM_BACKEND[urgency] ?? urgency
}

export function mapUserFromBackend(profile) {
  if (!profile) return null
  const id = profile._id?.toString?.() ?? profile._id ?? profile.id
  return {
    id: id != null ? String(id) : id,
    email: profile.email,
    name: `${profile.firstname ?? ''} ${profile.lastname ?? ''}`.trim() || profile.email,
    role: mapRoleFromBackend(profile.role),
    firstname: profile.firstname,
    lastname: profile.lastname,
    active: profile.active,
  }
}

export function mapCommentFromBackend(comment) {
  if (!comment) return null
  return {
    id: comment.id ?? `c-${Math.random().toString(36).slice(2, 9)}`,
    userId: comment.user_id != null ? String(comment.user_id) : null,
    user: comment.user_name ?? comment.user ?? 'User',
    role: mapRoleFromBackend(comment.user_role) ?? comment.role ?? null,
    text: comment.text ?? '',
    timestamp: comment.created_at ?? comment.timestamp ?? new Date().toISOString(),
  }
}

export function mapTicketFromBackend(ticket) {
  const id = ticket._id?.toString?.() ?? ticket._id ?? ticket.numero_ticket
  const createdAt = ticket.date_creation ?? new Date().toISOString()
  const technicienId = ticket.technicien_id?.toString?.() ?? ticket.technicien_id ?? null
  const equipmentId =
    ticket.equipment_id?.toString?.() ?? ticket.equipment_id ?? ticket.equipmentId ?? null
  const status = mapStatusFromBackend(ticket.status)
  const rawComments = Array.isArray(ticket.comments) ? ticket.comments : []
  const rawHistory = Array.isArray(ticket.history) ? ticket.history : null

  return {
    id: id != null ? String(id) : id,
    numero_ticket: ticket.numero_ticket,
    equipmentId: equipmentId != null ? String(equipmentId) : null,
    title: ticket.titre ?? ticket.title ?? '',
    description: ticket.description ?? '',
    urgency: mapUrgencyFromBackend(ticket.urgence),
    status,
    assignedTo: technicienId != null ? String(technicienId) : null,
    createdBy: ticket.created_by ?? ticket.createdBy ?? 'System',
    createdAt,
    updatedAt:
      ticket.date_resolution ??
      ticket.updated_at ??
      ticket.date_assignation ??
      createdAt,
    date_resolution: ticket.date_resolution ?? null,
    date_assignation: ticket.date_assignation ?? null,
    photo: ticket.photo ?? null,
    history: rawHistory
      ? rawHistory.map((h) => ({
          status: mapStatusFromBackend(h.status) ?? h.status,
          timestamp: h.timestamp,
          user: h.user,
          note: h.note,
        }))
      : [
          {
            status,
            timestamp: createdAt,
            user: ticket.created_by ?? ticket.createdBy ?? 'System',
            note: 'Ticket created',
          },
        ],
    comments: rawComments.map(mapCommentFromBackend).filter(Boolean),
  }
}

export function mapTicketToBackend(data) {
  const now = new Date()
  const hasAssignee = !!data.assignedTo
  const status = data.status ?? (hasAssignee ? 'assigned' : 'open')
  const isResolved = status === 'resolved' || status === 'closed'

  return {
    numero_ticket: data.numero_ticket ?? `TKT-${now.getFullYear()}-${String(now.getTime()).slice(-6)}`,
    titre: data.title,
    description: data.description,
    status: mapStatusToBackend(status),
    urgence: mapUrgencyToBackend(data.urgency ?? 'medium'),
    technicien_id: data.assignedTo ?? null,
    equipment_id: data.equipmentId ?? null,
    created_by: data.createdBy ?? null,
    date_creation: data.createdAt ?? now,
    date_resolution: isResolved
      ? (data.date_resolution ?? data.updatedAt ?? now)
      : (data.date_resolution ?? null),
    date_assignation: hasAssignee ? (data.date_assignation ?? now) : null,
  }
}

export function mapUserToTechnician(user) {
  const id = user._id?.toString?.() ?? user._id ?? user.id
  return {
    id: id != null ? String(id) : id,
    name: `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim() || user.email,
    specialty: mapRoleFromBackend(user.role),
  }
}
