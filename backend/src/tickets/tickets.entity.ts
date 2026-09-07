import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

export enum statut {
  ouvert = 'ouvert',
  assigne = 'assigne',
  en_cours = 'en_cours',
  resolu = 'resolu',
  cloture = 'cloture',
}

export enum urgence {
  faible = 'faible',
  moyenne = 'moyenne',
  elevee = 'elevee',
}

@Entity('ticket')
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

  @Column({ type: 'string', nullable: true })
  technicien_id?: string;

  @Column({ nullable: true })
  equipment_id?: string;

  @Column({ nullable: true })
  created_by?: string;

  @Column({ default: () => new Date() })
  date_creation!: Date;

  @Column({ nullable: true })
  date_resolution?: Date;

  @Column({ nullable: true })
  date_assignation?: Date;

  @Column({ nullable: true })
  comments?: {
    id: string;
    user_id?: string;
    user_name: string;
    user_role: string;
    text: string;
    created_at: Date | string;
  }[];

  @Column({ nullable: true })
  history?: {
    status: string;
    timestamp: Date | string;
    user: string;
    note?: string;
  }[];
}
