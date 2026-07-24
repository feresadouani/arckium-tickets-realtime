import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Ticket } from './tickets.entity';
import { TicketsService } from './tickets.service';
import { ObjectId } from 'mongodb';

@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService){}

    @Post('add')
    async addTicket(@Body() Ticket:Partial<Ticket>):Promise<Ticket>{
        return this.ticketsService.createTicket(Ticket);
    }

    @Get('all')
    async getAllTickets():Promise<Ticket[]>{
        return this.ticketsService.findAll();
    }

    @Delete('delete/:id')
    async deleteTicket(@Param('id') id:string):Promise<void>{
        return this.ticketsService.deleteTicket(id);
    }
}

