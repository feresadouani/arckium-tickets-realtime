import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket, statut } from './tickets.entity';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly TicketRepository: MongoRepository<Ticket>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(): Promise<Ticket[]> {
    try {
      return await this.TicketRepository.find();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error fetching tickets');
    }
  }

  async createTicket(ticket: Partial<Ticket>): Promise<Ticket> {
    const createdBy = ticket.created_by ?? 'System';
    const now = new Date();
    const newTicket = this.TicketRepository.create({
      ...ticket,
      date_creation: ticket.date_creation ?? now,
      comments: ticket.comments ?? [],
      history: ticket.history ?? [
        {
          status: ticket.status ?? statut.ouvert,
          timestamp: now,
          user: createdBy,
          note: 'Ticket created',
        },
      ],
    });

    // Auto status if assigned
    if (newTicket.technicien_id && newTicket.status === statut.ouvert) {
      newTicket.status = statut.assigne;
      newTicket.date_assignation = now;
    }

    const saved = await this.TicketRepository.save(newTicket);

    this.notificationsService.notifyTicketCreated(
      saved.numero_ticket,
      saved.titre,
      saved.urgence,
    );

    if (saved.technicien_id) {
      this.notificationsService.notifyAssignment(
        saved.numero_ticket,
        saved.titre,
        String(saved.technicien_id),
      );
    }

    return saved;
  }

  async findById(id: string): Promise<Ticket> {
    try {
      const ticket = await this.TicketRepository.findOneBy({
        _id: new ObjectId(id),
      });
      if (!ticket) {
        throw new NotFoundException('Ticket not found');
      }
      return ticket;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.log(error);
      throw new InternalServerErrorException('Error fetching ticket');
    }
  }

  async deleteTicket(id: string): Promise<void> {
    try {
      await this.findById(id);
      await this.TicketRepository.delete({ _id: new ObjectId(id) });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.log(error);
      throw new InternalServerErrorException('Error deleting ticket');
    }
  }

  async updateTicket(
    id: string,
    updates: Partial<Ticket>,
    meta?: { actorName?: string },
  ): Promise<Ticket> {
    try {
      const ticket = await this.findById(id);
      const previousAssignee = ticket.technicien_id;
      const previousStatus = ticket.status;
      const actor = meta?.actorName ?? 'System';
      const now = new Date();

      Object.assign(ticket, updates);

      if (
        updates.technicien_id &&
        String(updates.technicien_id) !== String(previousAssignee)
      ) {
        ticket.date_assignation = now;
        if (!updates.status) {
          ticket.status = statut.assigne;
        }
        ticket.history = [
          ...(ticket.history ?? []),
          {
            status: ticket.status,
            timestamp: now,
            user: actor,
            note: 'Technician assigned',
          },
        ];
      }

      if (updates.status && updates.status !== previousStatus) {
        if (
          updates.status === statut.resolu ||
          updates.status === statut.cloture
        ) {
          ticket.date_resolution = now;
        }
        ticket.history = [
          ...(ticket.history ?? []),
          {
            status: updates.status,
            timestamp: now,
            user: actor,
            note: `Status changed to ${updates.status}`,
          },
        ];
      }

      const saved = await this.TicketRepository.save(ticket);

      if (
        updates.technicien_id &&
        String(updates.technicien_id) !== String(previousAssignee)
      ) {
        this.notificationsService.notifyAssignment(
          saved.numero_ticket,
          saved.titre,
          String(updates.technicien_id),
        );
      }

      if (updates.status && updates.status !== previousStatus) {
        this.notificationsService.notifyStatusChange(
          saved.numero_ticket,
          saved.titre,
          String(updates.status),
        );
      }

      return saved;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error updating ticket');
    }
  }

  async assignTechnician(id: string, technicienId: string): Promise<Ticket> {
    return this.updateTicket(id, {
      technicien_id: technicienId,
      status: statut.assigne,
      date_assignation: new Date(),
    });
  }

  async addComment(
    id: string,
    data: {
      text: string;
      user_id?: string;
      user_name: string;
      user_role: string;
    },
  ): Promise<Ticket> {
    const ticket = await this.findById(id);
    const comment = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      user_id: data.user_id,
      user_name: data.user_name,
      user_role: data.user_role,
      text: data.text.trim(),
      created_at: new Date(),
    };

    ticket.comments = [...(ticket.comments ?? []), comment];
    const saved = await this.TicketRepository.save(ticket);

    this.notificationsService.notifyComment(
      saved.numero_ticket,
      saved.titre,
      data.user_name,
    );

    return saved;
  }
}
