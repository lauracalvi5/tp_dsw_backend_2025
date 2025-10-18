import { ObjectId } from '@mikro-orm/mongodb';
import { DI } from '../shared/db/orm.js';
import { Estacionamiento } from './estacionamiento.entity.js';

async function getEstacionamientos2Collection() {
  const driver = DI.em.getDriver() as import('@mikro-orm/mongodb').MongoDriver;
  const connection = driver.getConnection();
  const client = connection.getClient();
  const dbName = (DI as any)?.orm?.config?.get?.('dbName') ?? 'parkEasy';
  const db = client.db(dbName);
  return db.collection('estacionamientos2');
}

export class EstacionamientoService {

  
  async crear(datos: any) {
    const estacionamiento = DI.em.create(Estacionamiento, datos);
    await DI.em.persistAndFlush(estacionamiento);

    try {
      const coleccion = await getEstacionamientos2Collection();
      const key = { nombre: datos.nombre, direccion: datos.direccion };
      const r = await coleccion.deleteOne(key);
      if (r.deletedCount) {
        console.log('[INFO] Borrado espejo en estacionamientos2 por creación:', key);
      }
    } catch (err) {
      console.error('[WARN] No se pudo sincronizar estacionamientos2 (crear):', err);
    }

    return estacionamiento;
  }


  async listar() {
    try {
      const estacionamientos = await DI.em.find(Estacionamiento, {}, { orderBy: { nombre: 'asc' } });
      if (!estacionamientos || estacionamientos.length === 0) return [];

      const driver = DI.em.getDriver() as import('@mikro-orm/mongodb').MongoDriver;
      const connection = driver.getConnection();
      const client = connection.getClient();
      const dbName = (DI as any)?.orm?.config?.get?.('dbName') ?? 'parkEasy';
      const db = client.db(dbName);
      const possibleNames = ['cochera', 'Cochera'];
      let cocheraCol: any = null;
      for (const n of possibleNames) {
        const col = db.collection(n);
        if (col) { cocheraCol = col; break; }
      }

      const ids = estacionamientos.map(e => e._id);
      let aggRes: any[] = [];
      if (cocheraCol && ids.length) {
        aggRes = await cocheraCol.aggregate([
          { $match: { estacionamiento: { $in: ids }, estado: { $ne: 'libre' } } },
          { $group: { _id: '$estacionamiento', ocupadas: { $sum: 1 } } }
        ]).toArray();
      }
      const ocupadasMap = new Map<string, number>(aggRes.map(a => [a._id.toString(), a.ocupadas]));

      return estacionamientos.map(e => {
        const ocupadas = ocupadasMap.get(e._id?.toString?.() ?? '') || 0;
        const libres = (e.capacidad ?? 0) - ocupadas;
        return {
          _id: e._id?.toString?.() ?? '',
          nombre: e.nombre,
          direccion: e.direccion,
          capacidad: e.capacidad,
          precioHora: e.precioHora,
          activo: e.activo,
          lat: e.lat,
          lng: e.lng,
          horarioApertura: e.horarioApertura,
          horarioCierre: e.horarioCierre,
          libres: libres
        };
      });
    } catch (error) {
      throw error;
    }
  }

  
  async obtenerPorId(id: string) {
    if (!ObjectId.isValid(id)) {
      throw new Error('ID inválido');
    }

    const estacionamiento = await DI.em.findOne(
      Estacionamiento,
      { _id: new ObjectId(id) },
      { populate: ['cocheras'] }
    );
    if (!estacionamiento) {
      throw new Error('Estacionamiento no encontrado');
    }

    return {
      _id: estacionamiento._id?.toString?.() ?? (estacionamiento as any)._id,
      nombre: estacionamiento.nombre,
      direccion: estacionamiento.direccion,
      capacidad: estacionamiento.capacidad,
      precioHora: estacionamiento.precioHora,
      activo: estacionamiento.activo,
      lat: estacionamiento.lat,
      lng: estacionamiento.lng,
      horarioApertura: estacionamiento.horarioApertura,
      horarioCierre: estacionamiento.horarioCierre,
      libres: estacionamiento.cocheras.getItems().filter(c => c.estado === 'libre').length,
      cocheras: estacionamiento.cocheras,
    };
  }

  async actualizar(id: string, datos: any) {
    if (!ObjectId.isValid(id)) {
      throw new Error('ID inválido');
    }

    const estacionamiento = await DI.em.findOne(Estacionamiento, { _id: new ObjectId(id) });
    if (!estacionamiento) {
      throw new Error('Estacionamiento no encontrado');
    }

    DI.em.assign(estacionamiento, datos);
    await DI.em.persistAndFlush(estacionamiento);
    return estacionamiento;
  }

  
  async eliminar(id: string) {
    if (!ObjectId.isValid(id)) {
      throw new Error('ID inválido');
    }

    const estacionamiento = await DI.em.findOne(Estacionamiento, { _id: new ObjectId(id) });
    if (!estacionamiento) {
      throw new Error('Estacionamiento no encontrado');
    }

  
    await DI.em.nativeDelete('Cochera', { estacionamiento: new ObjectId(id) });

    try {
      const coleccion = await getEstacionamientos2Collection();
      const key = { nombre: estacionamiento.nombre, direccion: estacionamiento.direccion };
      const up = await coleccion.updateOne(
        key,
        {
          $set: {
            nombre: estacionamiento.nombre,
            direccion: estacionamiento.direccion,
            lat: estacionamiento.lat,
            lng: estacionamiento.lng,
          },
        },
        { upsert: true }
      );
    } catch (err) {}
    await DI.em.removeAndFlush(estacionamiento);
    return true;
  }


async listarDisponibles(
  filtros?: {
    lat?: number;
    lng?: number;
    maxDistanciaKm?: number;
    nombre?: string;
    direccion?: string;
    precioMin?: number;
    precioMax?: number;
  },
  opciones?: { resumen?: boolean } 
) {

  const query: any = { activo: true };
  if (filtros?.precioMin !== undefined || filtros?.precioMax !== undefined) {
    query.precioHora = {} as any;
    if (filtros?.precioMin !== undefined) query.precioHora.$gte = filtros!.precioMin;
    if (filtros?.precioMax !== undefined) query.precioHora.$lte = filtros!.precioMax;
  }
  if (filtros?.nombre) {
    query.nombre = { $regex: filtros.nombre, $options: 'i' };
  }
  if (filtros?.direccion) {
    query.direccion = { $regex: filtros.direccion, $options: 'i' };
  }

  const activos = await DI.em.find(Estacionamiento, query, { orderBy: { nombre: 'asc' } });

  type EstConMeta = Estacionamiento & { distancia?: number; libres?: number };

  const idsToCheck = activos.map(a => a._id);
  const driver = DI.em.getDriver() as import('@mikro-orm/mongodb').MongoDriver;
  const connection = driver.getConnection();
  const client = connection.getClient();
  const dbName = (DI as any)?.orm?.config?.get?.('dbName') ?? 'parkEasy';
  const db = client.db(dbName);
  const possibleNames = ['cochera', 'Cochera'];
  let cocheraCol: any = null;
  for (const n of possibleNames) {
    const col = db.collection(n);
    if (col) { cocheraCol = col; break; }
  }
  let aggRes: any[] = [];
  if (cocheraCol && idsToCheck.length) {
    aggRes = await cocheraCol.aggregate([
      { $match: { estacionamiento: { $in: idsToCheck }, estado: { $ne: 'libre' } } },
      { $group: { _id: '$estacionamiento', ocupadas: { $sum: 1 } } }
    ]).toArray();
  }
  const ocupadasMap = new Map<string, number>(aggRes.map(a => [a._id.toString(), a.ocupadas]));

  let arr: (Estacionamiento | EstConMeta)[] = activos.map(e => {
    const ocupadas = ocupadasMap.get(e._id?.toString?.() ?? '') || 0;
    const libres = (e.capacidad ?? 0) - ocupadas;
    return { ...e, libres };
  });

  
  if (filtros?.direccion) {
    const norm = (s: string) =>
      (s || '')
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ').trim();
    const f = norm(filtros.direccion);
    arr = arr.filter(e => norm((e as any).direccion).includes(f));
  }
  if (filtros?.precioMin !== undefined) arr = arr.filter(e => (e as any).precioHora >= filtros.precioMin!);
  if (filtros?.precioMax !== undefined) arr = arr.filter(e => (e as any).precioHora <= filtros.precioMax!);

  if (filtros?.lat !== undefined && filtros?.lng !== undefined) {
    const rad = (x: number) => x * Math.PI / 180;
    const haversine = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 6371;
      const dLat = rad(lat2 - lat1);
      const dLng = rad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(rad(lat1)) * Math.cos(rad(lat2)) *
        Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    if (filtros.maxDistanciaKm !== undefined) {
      const R = 6371; 
      const lat = filtros.lat!;
      const lng = filtros.lng!;
      const radius = filtros.maxDistanciaKm!;
      const degLat = (radius / R) * (180 / Math.PI);
      const degLng = (radius / R) * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);
      const minLat = lat - degLat;
      const maxLat = lat + degLat;
      const minLng = lng - degLng;
      const maxLng = lng + degLng;
      arr = arr.filter(e => {
        const elat = (e as any).lat;
        const elng = (e as any).lng;
        return elat !== undefined && elng !== undefined && elat >= minLat && elat <= maxLat && elng >= minLng && elng <= maxLng;
      });
    }

    arr = arr.map(e => {
      const distancia = ((e as any).lat && (e as any).lng)
        ? haversine(filtros.lat!, filtros.lng!, (e as any).lat, (e as any).lng)
        : Infinity;
      return { ...e, distancia } as EstConMeta;
    });

    if (filtros.maxDistanciaKm !== undefined) {
      arr = (arr as EstConMeta[]).filter(e => e.distancia !== undefined && e.distancia <= filtros.maxDistanciaKm!);
    }

    arr = (arr as EstConMeta[]).sort((a, b) => (a.distancia ?? Infinity) - (b.distancia ?? Infinity));
  }

  
  if (opciones?.resumen) {
    return arr.map(e => ({
      _id: (e as any)._id?.toString?.() ?? '',
      nombre: (e as any).nombre,
      direccion: (e as any).direccion,
      libres: (e as any).libres ?? 0,
    }));
  }

  
  return arr.map(e => ({
    _id: (e as any)._id?.toString?.() ?? '',
    nombre: (e as any).nombre,
    direccion: (e as any).direccion,
    capacidad: (e as any).capacidad,
    precioHora: (e as any).precioHora,
    activo: (e as any).activo,
    lat: (e as any).lat,
    lng: (e as any).lng,
    horarioApertura: (e as any).horarioApertura,
    horarioCierre: (e as any).horarioCierre,
    libres: (e as any).libres ?? 0,
    distancia: (e as any).distancia,
  }));
}

  async buscarPorNombreEnEstacionamientos2(nombre: string) {
    const coleccion = await getEstacionamientos2Collection();
    const query = nombre
      ? { nombre: { $regex: nombre, $options: 'i' } }
      : {};
    const docs = await coleccion.find(query).limit(10).toArray();
    return docs;
  }
}
