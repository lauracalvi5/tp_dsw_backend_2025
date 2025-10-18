import { Vehiculo } from "./vehiculo.entity.js";
import { ObjectId } from "@mikro-orm/mongodb";
import { DI } from "../shared/db/orm.js";
import { TipoVehiculo } from "../tipo_vehiculo/tipo_vehiculo.entity.js";

export class VehiculoService {
  async listarTodos() {
    
    return await DI.em.find(Vehiculo, {}, { populate: ["tipo", "usuario"] });
  }
  async listar(usuarioId: string) {
    
    return await DI.em.find(Vehiculo, { usuario: usuarioId }, { populate: ["tipo", "usuario"] });
  }

  async crear(datos: any, usuarioId: string) {
  const tipoObj = await DI.em.findOne(TipoVehiculo, { _id: new ObjectId(datos.tipo) });
    if (!tipoObj) throw new Error("Tipo de vehículo no encontrado");
    const vehiculo = DI.em.create(Vehiculo, {
      marca: datos.marca,
      modelo: datos.modelo,
      patente: datos.patente,
      tipo: tipoObj, 
      usuario: usuarioId
    });
    await DI.em.persistAndFlush(vehiculo);
    return vehiculo;
  }
        

  async actualizar(id: string, datos: any) {
    const vehiculo = await DI.em.findOne(Vehiculo, { _id: new ObjectId(id) });
    if (!vehiculo) throw new Error("Vehículo no encontrado");
    let tipoObj = vehiculo.tipo;
    if (datos.tipo && typeof datos.tipo === "string") {
      const tipoEncontrado = await DI.em.findOne(TipoVehiculo, { _id: new ObjectId(datos.tipo) });
      if (!tipoEncontrado) throw new Error("Tipo de vehículo no encontrado");
      tipoObj = tipoEncontrado;
    }
    DI.em.assign(vehiculo, {
      marca: datos.marca,
      modelo: datos.modelo,
      patente: datos.patente,
      tipo: tipoObj,
      usuario: datos.usuario
    });
    await DI.em.persistAndFlush(vehiculo);
    return vehiculo;
  }

  async eliminar(id: string) {
    const vehiculo = await DI.em.findOne(Vehiculo, { _id: new ObjectId(id) });
    if (!vehiculo) throw new Error("Vehículo no encontrado");
    await DI.em.removeAndFlush(vehiculo);
    return true;
  }
}