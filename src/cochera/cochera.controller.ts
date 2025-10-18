import { Request, Response } from "express";
import { CocheraService } from "./cochera.service.js";

const cocheraService = new CocheraService();

export const getReservasUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    await cocheraService.getReservasUsuario(req, res);
  } catch (error: any) {
    console.error('[ERROR] GET /cocheras/mis-reservas:', error);
    res.status(400).json({ mensaje: error.message || "Error al obtener reservas del usuario" });
  }
};

export const listarCocherasOcupadas = async (req: Request, res: Response): Promise<void> => {
  try {
    const { estacionamientoId } = req.query;
    const hasPage = Object.prototype.hasOwnProperty.call(req.query, 'page');
    const hasLimit = Object.prototype.hasOwnProperty.call(req.query, 'limit');

    if (!hasPage && !hasLimit) {
      const cocheras = await cocheraService.listarOcupadas(estacionamientoId as string | undefined);
      res.json(cocheras);
      return;
    }

    const { page = '1', limit = '50' } = req.query;
    const p = Math.max(1, parseInt(page as string, 10) || 1);
    const l = Math.max(1, Math.min(1000, parseInt(limit as string, 10) || 50));
    const result = await cocheraService.listarOcupadas(estacionamientoId as string | undefined, { page: p, limit: l });
    res.json(result);
  } catch (error: any) {
    console.error('[ERROR] GET /cocheras/ocupadas:', error);
    res.status(500).json({ mensaje: error.message || "Error al listar cocheras ocupadas" });
  }
};



export const reservarCochera = async (req: Request, res: Response): Promise<void> => {
  try {
    const estacionamientoId = req.body.estacionamientoId;
    const usuarioId = (req as any).user?.id || (req as any).user;
    const duracionMinutos = req.body?.duracionMinutos ?? 60;

    if (!estacionamientoId || estacionamientoId.length !== 24) {
      res.status(400).json({ mensaje: "ID de estacionamiento inválido" });
      return;
    }
    if (!usuarioId) {
      res.status(401).json({ mensaje: "Usuario no autenticado" });
      return;
    }

    const cochera = await cocheraService.reservar(estacionamientoId, usuarioId.toString(), duracionMinutos);
    const libres = await cocheraService.obtenerLibres(estacionamientoId);
    res.json({ cochera, libres });
  } catch (error: any) {
    console.error('[ERROR] PUT /cocheras/reservar:', error);
    res.status(400).json({ mensaje: error.message || "Error al reservar cochera" });
  }
};



export const cancelarReservaCochera = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const usuarioId = (req as any).user?.id || (req as any).user;
    const rol = (req as any).user?.rol || null;
    if (!usuarioId) {
      res.status(401).json({ mensaje: "Usuario no autenticado" });
      return;
    }
    await cocheraService.cancelarReserva(id, usuarioId.toString(), rol);
    res.json({ mensaje: "Reserva cancelada correctamente" });
  } catch (error: any) {
    console.error('[ERROR] POST /cocheras/:id/cancelar:', error);
    res.status(400).json({ mensaje: error.message || "Error al cancelar la reserva" });
  }
};


export const liberarCochera = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log("[DEBUG] Liberar cochera:", id);
    await cocheraService.liberar(id);
    res.json({ mensaje: "Cochera liberada correctamente" });
  } catch (error: any) {
    console.error('[ERROR] POST /cocheras/:id/liberar:', error);
    res.status(400).json({ mensaje: error.message || "Error al liberar cochera" });
  }
};



export const obtenerCocherasLibres = async (req: Request, res: Response): Promise<void> => {
  try {
    const estacionamientoId = req.query.estacionamientoId as string;
    const libres = await cocheraService.obtenerLibres(estacionamientoId);
    console.log('[DEBUG] cocheras libres:', libres.length);
    res.json(libres);
  } catch (error: any) {
    console.error('[ERROR] GET /cocheras/libres:', error);
    res.status(400).json({ mensaje: error.message || "Error al obtener cocheras libres" });
  }
};
