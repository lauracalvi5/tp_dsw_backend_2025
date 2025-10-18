import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";

@Entity()
export class TipoVehiculo {
  @PrimaryKey()
  _id!: ObjectId;

  @Property()
  descripcion!: string; 
}