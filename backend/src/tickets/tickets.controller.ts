import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Ticket } from './tickets.entity';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, TicketBodyDto } from './dto/ticket-body.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { UserRole } from 'src/users/users.entity';
import { UsersService } from 'src/users/users.service';
import { statut } from './tickets.entity';

@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly usersService: UsersService,
  ) {}

  private isManagerOrAdmin(role?: string) {
    return role === UserRole.admin || role === UserRole.responsable;
  }

  @Post('add')
  async addTicket(
    @Body() ticket: CreateTicketDto,
    @Req() req: { user?: { sub?: string; role?: string } },
  ): Promise<Ticket> {
    const role = req.user?.role;
    if (
      role !== UserRole.admin &&
      role !== UserRole.responsable &&
      role !== UserRole.technicien &&
      role !== UserRole.operateur
    ) {
      throw new ForbiddenException('Permission denied');
    }

    // Technicien : auto-assignation à soi-même
    if (role === UserRole.technicien && req.user?.sub) {
      ticket.technicien_id = req.user.sub;
      ticket.status = statut.assigne;
    }

    return this.ticketsService.createTicket(ticket);
  }

  @Get('all')
  async getAllTickets(
    @Req() req: { user?: { sub?: string; role?: string } },
  ): Promise<Ticket[]> {
    const tickets = await this.ticketsService.findAll();
    if (req.user?.role === UserRole.technicien) {
      return tickets.filter(
        (t) => String(t.technicien_id) === String(req.user?.sub),
      );
    }
    return tickets;
  }

  @Patch('update/:id')
  async updateTicket(
    @Param('id') id: string,
    @Body() ticket: TicketBodyDto,
    @Req() req: { user?: { sub?: string; role?: string; email?: string } },
  ): Promise<Ticket> {
    const role = req.user?.role;
    const existing = await this.ticketsService.findById(id);

    if (role === UserRole.technicien) {
      if (String(existing.technicien_id) !== String(req.user?.sub)) {
        throw new ForbiddenException(
          'You can only update your assigned tickets',
        );
      }
      // Technicien : statut seulement
      const allowed: TicketBodyDto = {};
      if (ticket.status) allowed.status = ticket.status;
      return this.ticketsService.updateTicket(id, allowed, {
        actorName: req.user?.email ?? 'Technician',
      });
    }

    if (!this.isManagerOrAdmin(role)) {
      throw new ForbiddenException('Permission denied');
    }

    return this.ticketsService.updateTicket(id, ticket, {
      actorName: req.user?.email ?? 'Manager',
    });
  }

  @Post(':id/comments')
  async addComment(
    @Param('id') id: string,
    @Body() dto: AddCommentDto,
    @Req() req: { user?: { sub?: string; role?: string } },
  ): Promise<Ticket> {
    if (!req.user?.sub) {
      throw new ForbiddenException('Unauthenticated');
    }

    const existing = await this.ticketsService.findById(id);
    if (
      req.user.role === UserRole.technicien &&
      String(existing.technicien_id) !== String(req.user.sub)
    ) {
      throw new ForbiddenException(
        'You can only comment on your assigned tickets',
      );
    }

    const profile = await this.usersService.findById(req.user.sub);
    const userName = profile
      ? `${profile.firstname} ${profile.lastname}`.trim()
      : 'User';

    return this.ticketsService.addComment(id, {
      text: dto.text,
      user_id: req.user.sub,
      user_name: userName,
      user_role: req.user.role ?? profile?.role ?? 'technicien',
    });
  }

  @Delete('delete/:id')
  async deleteTicket(
    @Param('id') id: string,
    @Req() req: { user?: { role?: string } },
  ): Promise<void> {
    if (!this.isManagerOrAdmin(req.user?.role)) {
      throw new ForbiddenException('Only admin or manager can delete a ticket');
    }
    return this.ticketsService.deleteTicket(id);
  }
}
