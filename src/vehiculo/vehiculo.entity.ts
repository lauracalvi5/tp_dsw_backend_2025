import { Entity, PrimaryKey, Property, ManyToOne } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";
import { TipoVehiculo } from "../tipo_vehiculo/tipo_vehiculo.entity.js";
import { Usuario } from "../usuario/usuario.entity.js";


@Entity()
export class Vehiculo {
  @PrimaryKey()
  _id!: ObjectId;

  @Property()
  marca!: string;

  @Property()
  modelo!: string;

  @Property()
  patente!: string;

  @ManyToOne(() => TipoVehiculo)
  tipo!: TipoVehiculo;

  @ManyToOne(() => Usuario)
  usuario!: Usuario;
}