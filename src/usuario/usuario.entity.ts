import { Entity, Property, PrimaryKey } from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js'; 
import { ObjectId } from "@mikro-orm/mongodb";
 
@Entity()
export class Usuario extends BaseEntity {

 @PrimaryKey()
  _id!: ObjectId; 

  @Property()
  nombre!: string;

  @Property()
  apellido!: string;

  @Property({ unique: true })
  email!: string;

  @Property()
  contrasena!: string;

  @Property({ nullable: true })
  resetToken?: string;

  @Property({ nullable: true })
  resetTokenExpira?: Date;

  @Property({ default: "cliente" }) 
  rol!: "cliente" | "admin"; 

}
