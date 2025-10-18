import { Request, Response } from 'express';
import { EstacionamientoService } from './estacionamiento.service.js';

const estacionamientoService = new EstacionamientoService();


export const crearEstacionamiento = async (req: Request, res: Response): Promise<void> => {
  try {
    const camposObligatorios = [
      "nombre", "direccion", "capacidad", "precioHora",
      "activo", "lat", "lng", "horarioApertura", "horarioCierre"
    ];
    const faltantes = camposObligatorios.filter(campo => req.body[campo] === undefined);
    if (faltantes.length > 0) {
      res.status(400).json({ mensaje: `Faltan campos obligatorios: ${faltantes.join(", ")}` });
      return;
    }
    const estacionamiento = await estacionamientoService.crear(req.body);
    const { CocheraService } = await import("../cochera/cochera.service.js");
    const cocheraService = new CocheraService();
    const capacidadNum = Number(estacionamiento.capacidad);
    await cocheraService.inicializarCocheras(estacionamiento._id.toString(), capacidadNum);
    res.status(201).json(estacionamiento);

  } catch (error: any) {
    console.error('[ERROR] POST /estacionamientos:', error);
    res.status(500).json({
      mensaje: "Error al crear estacionamiento",
      detalle: error.message || error.toString()
    });
  }
};


export const listarEstacionamientos = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('[DEBUG] GET /estacionamientos llamada');
    const estacionamientos = await estacionamientoService.listar();
    res.json(estacionamientos);
  } catch (error: any) {
    console.error('[ERROR] GET /estacionamientos:', error);
    res.status(500).json({
      mensaje: "Error al listar estacionamientos",
      detalle: error.message || error.toString()
    });
  }
};

export const obtenerEstacionamiento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const estacionamiento = await estacionamientoService.obtenerPorId(id);
    res.json(estacionamiento);
  } catch (error: any) {
    console.error('[ERROR] GET /estacionamientos/:id:', error);
    const status = error.message?.includes('inválido') ? 400 :
                   error.message?.includes('no encontrado') ? 404 : 500;
    res.status(status).json({
      mensaje: "Error al obtener estacionamiento",
      detalle: error.message || error.toString()
    });
  }
};


export const actualizarEstacionamiento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const estacionamiento = await estacionamientoService.actualizar(id, req.body);
    res.json(estacionamiento);
  } catch (error: any) {
    console.error('[ERROR] PUT /estacionamientos/:id:', error);
    const status = error.message?.includes('inválido') ? 400 :
                   error.message?.includes('no encontrado') ? 404 : 500;
    res.status(status).json({
      mensaje: "Error al actualizar estacionamiento",
      detalle: error.message || error.toString()
    });
  }
};


export const eliminarEstacionamiento = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await estacionamientoService.eliminar(id);
    res.json({ mensaje: "Estacionamiento eliminado correctamente" });
  } catch (error: any) {
    console.error('[ERROR] DELETE /estacionamientos/:id:', error);
    const status = error.message?.includes('inválido') ? 400 :
                   error.message?.includes('no encontrado') ? 404 : 500;
    res.status(status).json({
      mensaje: "Error al eliminar estacionamiento",
      detalle: error.message || error.toString()
    });
  }
};



export const listarDisponibles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, maxDistanciaKm, nombre, direccion, precioMin, precioMax, resumen } = req.query;

    const filtros: any = {};
    if (lat !== undefined && lng !== undefined) {
      filtros.lat = parseFloat(lat as string);
      filtros.lng = parseFloat(lng as string);
    }
    if (maxDistanciaKm !== undefined) filtros.maxDistanciaKm = parseFloat(maxDistanciaKm as string);
    if (nombre) filtros.nombre = nombre as string;
    if (direccion) filtros.direccion = direccion as string;
    if (precioMin !== undefined) filtros.precioMin = parseFloat(precioMin as string);
    if (precioMax !== undefined) filtros.precioMax = parseFloat(precioMax as string);

  const opciones = { resumen: String(resumen).toLowerCase() === 'true' };

    const data = await estacionamientoService.listarDisponibles(filtros, opciones);
    res.json(data);
  } catch (error: any) {
    console.error('[ERROR] GET /estacionamientos-disponibles:', error);
    res.status(500).json({ mensaje: "Error al listar estacionamientos disponibles", detalle: error.message || error.toString() });
  }
};


export const buscarEstacionamientos2 = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre } = req.query;
    const resultados = await estacionamientoService.buscarPorNombreEnEstacionamientos2((nombre as string) || "");
    res.json(resultados);
  } catch (error: any) {
    console.error('[ERROR] GET /estacionamientos2:', error);
    res.status(500).json({
      mensaje: "Error al buscar estacionamientos2",
      detalle: error.message || error.toString()
    });
  }
};



