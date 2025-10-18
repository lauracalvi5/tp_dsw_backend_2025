import { Entity, PrimaryKey, Property, ManyToOne, Index } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";
import { BaseEntity } from '../shared/db/baseEntity.entity.js';

@Entity()
@Index({ properties: ['estacionamiento', 'estado', 'fechaFin'] })
export class Cochera extends BaseEntity {
  @PrimaryKey()
  _id!: ObjectId;

  @Property()
  numero!: number;

  @Property({ default: "libre" })
  estado: string = "libre";

  @Property({ type: Date, nullable: true })
  fechaInicio?: Date;

  @Property({ type: Date, nullable: true })
  fechaFin?: Date;


  @ManyToOne('Estacionamiento')
  estacionamiento!: any; 

  @ManyToOne('Usuario', { nullable: true })
  usuario!: any;
  
}