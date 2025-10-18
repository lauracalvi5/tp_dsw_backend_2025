import { DI } from '../shared/db/orm.js';
import { Cochera } from './cochera.entity.js';
import { Estacionamiento } from '../estacionamiento/estacionamiento.entity.js';
import { ObjectId } from '@mikro-orm/mongodb';
import { Request, Response } from 'express';


export class CocheraService {

 
  async inicializarCocheras(estacionamientoId: string, capacidad: number) {
    if (!ObjectId.isValid(estacionamientoId)) throw new Error("ID de estacionamiento inválido");
    if (!Number.isFinite(capacidad) || capacidad <= 0) throw new Error("Capacidad inválida");

    
    const delCount = await DI.em.nativeDelete(Cochera, { estacionamiento: new ObjectId(estacionamientoId) });
    console.log(`[INFO] inicializarCocheras: eliminadas ${delCount} cocheras previas (${estacionamientoId}).`);

    
    const BATCH_SIZE = 500;
    let batch: Cochera[] = [];

    for (let i = 1; i <= capacidad; i++) {
      const nueva = DI.em.create(Cochera, {
        estacionamiento: new ObjectId(estacionamientoId),
        numero: i,
        estado: 'libre',         
        usuario: null,
        fechaInicio: undefined,
        fechaFin: undefined,
      });
      batch.push(nueva);

      if (batch.length === BATCH_SIZE) {
        await DI.em.persistAndFlush(batch);
        batch = [];
      }
    }

    if (batch.length > 0) {
      await DI.em.persistAndFlush(batch);
    }

    console.log(`[INFO] inicializarCocheras: creadas ${capacidad} cocheras libres (${estacionamientoId}).`);
    return true;
  }

 
  async listarOcupadas(estacionamientoId?: string, opts?: { page?: number; limit?: number }) {
    const filtro: any = { estado: 'ocupado' };
    if (estacionamientoId) {
      if (!ObjectId.isValid(estacionamientoId)) throw new Error("ID de estacionamiento inválido");
      filtro.estacionamiento = new ObjectId(estacionamientoId);
    }

    try {
      const ahora = new Date();
      const where: any = { estado: 'ocupado', fechaFin: { $lt: ahora } };
      if (filtro.estacionamiento) where.estacionamiento = filtro.estacionamiento;
      const updated = await DI.em.nativeUpdate(Cochera, where, { estado: 'libre', usuario: null, fechaInicio: null, fechaFin: null });
      if (updated) {
        console.log(`[INFO] listarOcupadas: auto-liberadas ${updated} cocheras vencidas.`);
      }
    } catch (e) {
      console.warn('[WARN] listarOcupadas: no se pudo ejecutar bulk update nativo:', e);
    }

    const page = opts?.page && opts.page > 0 ? opts.page : undefined;
    const limit = opts?.limit && opts.limit > 0 ? opts.limit : undefined;

    
    const total = await DI.em.count(Cochera, filtro);

    const findOptions: any = { populate: ['estacionamiento'], orderBy: { numero: 'asc' } };
    if (page && limit) {
      findOptions.limit = limit;
      findOptions.offset = (page - 1) * limit;
    } else if (limit) {
      findOptions.limit = limit;
    }

    const items = await DI.em.find(Cochera, filtro, findOptions);

    if (!opts) {
      return items;
    }

    return {
      items,
      total,
      page: page ?? 1,
      limit: limit ?? total,
      totalPages: limit ? Math.ceil(total / limit) : 1,
    };
  }

  
  async reservar(estacionamientoId: string, usuarioId: string, duracionMinutos: number = 60) {
    if (!ObjectId.isValid(estacionamientoId)) throw new Error('ID de estacionamiento inválido');
    if (!ObjectId.isValid(usuarioId)) throw new Error('ID de usuario inválido');

    const estacionamiento = await DI.em.findOne(Estacionamiento, { _id: new ObjectId(estacionamientoId) });
    if (!estacionamiento) throw new Error('Estacionamiento no encontrado');

   
    const cocheraLibre = await DI.em.findOne(
      Cochera,
      { estacionamiento: new ObjectId(estacionamientoId), estado: 'libre' },
      { orderBy: { numero: 'asc' } }
    );
    if (!cocheraLibre) throw new Error('No hay cocheras libres');

    const fechaInicio = new Date();
    const fechaFin = new Date(fechaInicio.getTime() + (duracionMinutos ?? 60) * 60000);

    cocheraLibre.estado = 'ocupado';
    cocheraLibre.usuario = new ObjectId(usuarioId);
    cocheraLibre.fechaInicio = fechaInicio;
    cocheraLibre.fechaFin = fechaFin;

    await DI.em.persistAndFlush(cocheraLibre);

    return cocheraLibre;
  }

  async cancelarReserva(cocheraId: string, usuarioId: string, rol?: string) {
    if (!ObjectId.isValid(cocheraId)) throw new Error('ID de cochera inválido');
    if (!ObjectId.isValid(usuarioId)) throw new Error('ID de usuario inválido');

    console.log('[DEBUG cancelarReserva] Params:', { cocheraId, usuarioId, rol });
    const cochera = await DI.em.findOne(Cochera, { _id: new ObjectId(cocheraId) });
    if (!cochera) throw new Error('Cochera no encontrada');
    console.log('[DEBUG cancelarReserva] Cochera encontrada:', {
      cocheraId: cochera._id?.toString(),
      cocheraUsuario: cochera.usuario ? cochera.usuario.toString() : null,
      cocheraEstado: cochera.estado
    });
    if (!cochera.usuario) {
      throw new Error('La cochera ya está libre, no hay reserva para cancelar');
    }
    console.log('[DEBUG cancelarReserva] Comparando:', {
      cocheraUsuario: cochera.usuario.toString(),
      usuarioId,
      rol
    });
    console.log('[DEBUG cancelarReserva] Tipo y valor cochera.usuario:', {
      tipo: typeof cochera.usuario,
      esObjectId: cochera.usuario instanceof ObjectId,
      valor: cochera.usuario
    });
    let esCliente = false;
    if (cochera.usuario instanceof ObjectId) {
      esCliente = cochera.usuario.equals(new ObjectId(usuarioId));
    } else if (cochera.usuario && cochera.usuario._id instanceof ObjectId) {
      esCliente = cochera.usuario._id.equals(new ObjectId(usuarioId));
    } else if (cochera.usuario) {
      esCliente = cochera.usuario?.toString() === usuarioId;
    }
    if (!esCliente && rol !== 'admin') {
      throw new Error('No tienes permiso para cancelar esta reserva');
    }

    cochera.estado = "libre";
    cochera.usuario = null;
    cochera.fechaInicio = undefined;
    cochera.fechaFin = undefined;

    await DI.em.persistAndFlush(cochera);
    return true;
  }



    async getReservasUsuario(req: Request, res: Response) {
        const usuarioId = req.user?.id;
        if (!usuarioId) {
          return res.status(401).json({ mensaje: "Usuario no autenticado" });
        }
        const reservas = await DI.em.find(Cochera, {
          usuario: new ObjectId(usuarioId),
          estado: { $in: ["ocupado", "reservada"] }
        }, { populate: ["estacionamiento"] });
        res.json(reservas);
    }

  async liberar(cocheraId: string) {
    if (!ObjectId.isValid(cocheraId)) throw new Error('ID de cochera inválido');

    const cochera = await DI.em.findOne(Cochera, { _id: new ObjectId(cocheraId) });
    if (!cochera) throw new Error('Cochera no encontrada');

    cochera.estado = "libre";
    cochera.usuario = null;
    cochera.fechaInicio = undefined;
    cochera.fechaFin = undefined;

    await DI.em.persistAndFlush(cochera);
    return true;
  }

  async obtenerLibres(estacionamientoId: string) {
    if (!ObjectId.isValid(estacionamientoId)) throw new Error("ID de estacionamiento inválido");

    const libres = await DI.em.find(
      Cochera,
      { estacionamiento: new ObjectId(estacionamientoId), estado: 'libre' },
      { orderBy: { numero: 'asc' } }
    );

    return libres.map(c => ({
      _id: c._id?.toString?.() ?? '',
      numero: c.numero,
      estado: c.estado,
      estacionamiento: c.estacionamiento?.toString?.() ?? estacionamientoId
    }));
  }

  
  async eliminarPorEstacionamiento(idEstacionamiento: string) {
    if (!ObjectId.isValid(idEstacionamiento)) throw new Error("ID de estacionamiento inválido");
    const res = await DI.em.nativeDelete(Cochera, { estacionamiento: new ObjectId(idEstacionamiento) });
    console.log(`[INFO] eliminarPorEstacionamiento: eliminadas ${res} cocheras (${idEstacionamiento}).`);
    return res;
  }
}
