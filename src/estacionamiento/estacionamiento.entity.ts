import { Entity, PrimaryKey, Property, OneToMany, Collection, Index } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";
import { Cochera } from '../cochera/cochera.entity.js';


@Entity()
@Index({ properties: ['activo', 'nombre', 'direccion', 'lat', 'lng'] })
export class Estacionamiento {

  @PrimaryKey()
  _id!: ObjectId; 

  @Property()
  nombre!: string;

  @Property()
  direccion!: string;

  @Property({ type: 'number' })
  capacidad!: number; 

  @Property({ type: 'number' })
  precioHora!: number; 

  @Property({ default: true })
  activo: boolean = true;

  @Property({ type: 'number' })
  lat!: number;

  @Property({ type: 'number' })
  lng!: number;

  @Property({ type: 'string', nullable: true })
  horarioApertura?: string; 

  @Property({ type: 'string', nullable: true })
  horarioCierre?: string; 

  @OneToMany(() => Cochera, cochera => cochera.estacionamiento)
  cocheras = new Collection<Cochera>(this);
}