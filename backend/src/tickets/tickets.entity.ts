import { ObjectId } from "mongodb";
import { Column, Entity, ObjectIdColumn } from "typeorm";

export enum statut{
    ouvert = 'ouvert',
    assigne = 'assigne',
    en_cours = 'en_cours',
    resolu = 'resolu',
    cloture = 'cloture'
}
export enum urgence{
    faible = 'faible',
    moyenne = 'moyenne',
    elevee = 'elevee'
}
@Entity()
export class Ticket {

    @ObjectIdColumn()
    _id!: ObjectId;

    @Column()
    numero_ticket!: string; 

    @Column()
    titre!: string;

    @Column()
    description!: string;

    @Column({ type: 'string' })
    status!: statut;
    
    @Column({ type: 'string' })
    urgence!: urgence;
    
    @Column({default: Date.now()})
    date_creation!: Date;

    @Column()
    date_resolution!: Date;

    @Column()
    date_assignation!: Date;
    

}