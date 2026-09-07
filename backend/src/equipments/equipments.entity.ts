import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@Entity('equipments')
export class Equipment {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column()
  nom!: string;

  @Column()
  localisation!: string;

  @Column({ nullable: true })
  reference?: string;

  @Column({ default: true })
  active!: boolean;

  @Column({ default: () => new Date() })
  date_creation!: Date;
}
