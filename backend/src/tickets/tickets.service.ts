import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket} from './tickets.entity';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';

@Injectable()
export class TicketsService {
    constructor(@InjectRepository(Ticket) private readonly TicketRepository: MongoRepository<Ticket>) { }

    async findAll():Promise<Ticket[]>{
        try{
            const tickets = await this.TicketRepository.find();
            if(tickets.length === 0){
                throw new Error("Aucun ticket trouvé");
            }
            return tickets;
        }
        catch(error){
            console.error(error);
            throw new Error("Erreur lors de la récupération des tickets");
    }
}

async createTicket(Ticket: Partial<Ticket>): Promise<Ticket> {
    const newTicket = this.TicketRepository.create(Ticket);
    return this.TicketRepository.save(newTicket);
}

async findById(id:string):Promise<Ticket>{
    try{
        const ticket = await this.TicketRepository.findOneBy({_id: new ObjectId(id)});
        if(!ticket){
            throw new Error("Ticket non trouvé");
        }
        return ticket;
    }catch(error){
        console.log(error)
        throw new Error("Erreur lors de la recuperation du ticket")
    }
}
async deleteTicket(id:string):Promise<void>{
    try{
        const ticket = await this.findById(id);
        if(!ticket){
            throw new Error("Ticket non trouvé");
        }
        await this.TicketRepository.delete({_id: new ObjectId(id)});
    }catch(error){
        console.log(error)
        throw new Error("Erreur lors de la suppression du ticket")

    }
}

async updateTicket(id:string,Ticket:Partial<Ticket>){
    try{
        const ticket = this.findById(id);
       if(!ticket){
            throw new Error("Ticket non trouvé");
        }
        Object.assign(ticket,Ticket);
        await this.TicketRepository.save(Ticket);
       return { message: "Profil mis à jour avec succès" };
    }
    catch(error){
        throw new InternalServerErrorException("Erreur lors de la mise à jour du profil");
    }
}
}
