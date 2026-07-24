import { ObjectId } from "mongodb";
import { Column, Entity, ObjectIdColumn } from "typeorm";

export enum UserRole {
    operateur = 'operateur',
    technicien = 'technicien',
    responsable = 'responsable'
}

@Entity('users')
export class Users{
    @ObjectIdColumn()
    _id!:ObjectId;

    @Column()
    firstname!: string;

    @Column()
    lastname!: string;
    @Column()
    email!:string;

    @Column()
    password!:string;

    @Column({ default: true })
    active!: boolean;

    @Column({ type: 'string', default: UserRole.technicien })
    role!: UserRole;
}