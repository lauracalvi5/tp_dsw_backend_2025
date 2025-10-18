import { TipoVehiculo } from "./tipo_vehiculo.entity.js";
import { ObjectId } from "@mikro-orm/mongodb";
import { DI } from "../shared/db/orm.js";

export class TipoVehiculoService {
  async listar() {
    return await DI.em.find(TipoVehiculo, {});
  }

  async crear(datos: any) {
    const tipo = DI.em.create(TipoVehiculo, datos);
    await DI.em.persistAndFlush(tipo);
    return tipo;
  }

  async actualizar(id: string, datos: any) {
    const tipo = await DI.em.findOne(TipoVehiculo, { _id: new ObjectId(id) });
    if (!tipo) throw new Error("Tipo de vehículo no encontrado");
    DI.em.assign(tipo, datos);
    await DI.em.persistAndFlush(tipo);
    return tipo;
  }

  async eliminar(id: string) {
    const tipo = await DI.em.findOne(TipoVehiculo, { _id: new ObjectId(id) });
    if (!tipo) throw new Error("Tipo de vehículo no encontrado");
    await DI.em.removeAndFlush(tipo);
    return true;
  }
}