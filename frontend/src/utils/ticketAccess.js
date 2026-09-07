/** Filtre les tickets visibles selon le rôle de l'utilisateur */
export function filterTicketsByRole(tickets, user) {
  if (!user) return tickets

  if (user.role === 'technician') {
    return tickets.filter((t) => String(t.assignedTo) === String(user.id))
  }

  // Opérateur : tickets qu'il a créés (par nom) — accès large pour admin/manager
  if (user.role === 'operator') {
    return tickets.filter(
      (t) =>
        String(t.createdBy).toLowerCase() === String(user.name).toLowerCase() ||
        !t.assignedTo
    )
  }

  return tickets
}

/** Vérifie si un utilisateur peut accéder à un ticket */
export function canAccessTicket(ticket, user) {
  if (!ticket || !user) return false
  if (user.role === 'admin' || user.role === 'manager') return true
  if (user.role === 'technician') {
    return String(ticket.assignedTo) === String(user.id)
  }
  if (user.role === 'operator') {
    return String(ticket.createdBy).toLowerCase() === String(user.name).toLowerCase()
  }
  return true
}
