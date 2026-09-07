import { Injectable } from '@nestjs/common';
import {
  NotificationsGateway,
  RealtimeNotification,
} from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(private readonly gateway: NotificationsGateway) {}

  notify(notification: Omit<RealtimeNotification, 'timestamp'> & { timestamp?: string }) {
    this.gateway.emitNotification({
      ...notification,
      timestamp: notification.timestamp ?? new Date().toISOString(),
    });
  }

  notifyTicketCreated(numero: string, titre: string, urgence: string) {
    this.notify({
      type: urgence === 'elevee' || urgence === 'critical' ? 'critical' : 'update',
      title: 'New ticket',
      message: `${numero} — ${titre}`,
      targetRole: 'responsable',
    });
    this.notify({
      type: urgence === 'elevee' || urgence === 'critical' ? 'critical' : 'update',
      title: 'New ticket',
      message: `${numero} — ${titre}`,
      targetRole: 'admin',
    });
  }

  notifyAssignment(numero: string, titre: string, technicienId: string) {
    this.notify({
      type: 'assignment',
      title: 'Ticket assigned',
      message: `${numero} — ${titre}`,
      targetUserId: technicienId,
    });
  }

  notifyStatusChange(numero: string, titre: string, status: string) {
    const type =
      status === 'resolu' || status === 'resolved'
        ? 'resolved'
        : status === 'cloture' || status === 'closed'
          ? 'resolved'
          : 'update';

    this.notify({
      type,
      title: 'Status updated',
      message: `${numero} — ${titre} → ${status}`,
    });
  }

  notifyComment(
    numero: string,
    titre: string,
    authorName: string,
    authorId?: string,
  ) {
    this.notify({
      type: 'comment',
      title: 'New comment',
      message: `${authorName} commented on ${numero} — ${titre}`,
    });
  }
}
