import { Request, Response } from "express";
import { VehiculoService } from "./vehiculo.service.js";

const vehiculoService = new VehiculoService();

export const listarVehiculos = async (req: Request, res: Response): Promise<void> => {
  try {
    let usuarioId: string | undefined;
    let rol: string | undefined;
    if (typeof req.user === "object" && req.user !== null) {
      usuarioId = (req.user as { id: string }).id;
      rol = (req.user as { rol?: string }).rol;
    } else if (typeof req.user === "string") {
      usuarioId = req.user;
    }
    if (!usuarioId && req.query.usuarioId) {
      usuarioId = String(req.query.usuarioId);
    }
    if (!usuarioId) {
      res.status(400).json({ mensaje: "ID de usuario no encontrado" });
      return;
    }
    let vehiculos;
    if (rol === "admin") {
      vehiculos = await vehiculoService.listarTodos();
    } else {
      vehiculos = await vehiculoService.listar(usuarioId);
    }
  console.log('[DEBUG listarVehiculos] vehiculos:', JSON.stringify(vehiculos, null, 2));
  res.json(vehiculos);
  } catch (error: any) {
    res.status(500).json({ mensaje: error.message || "Error al listar vehículos" });
  }
};

export const crearVehiculo = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuarioId = typeof req.user === "object" && req.user !== null
      ? (req.user as { id: string }).id
      : typeof req.user === "string"
      ? req.user
      : undefined;
    if (!usuarioId) {
      res.status(400).json({ mensaje: "ID de usuario no encontrado" });
      return;
    }
    const vehiculo = await vehiculoService.crear(req.body, usuarioId);
    res.json(vehiculo);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message || "Error al crear vehículo" });
  }
};

export const actualizarVehiculo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const vehiculo = await vehiculoService.actualizar(id, req.body);
    res.json(vehiculo);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message || "Error al actualizar vehículo" });
  }
};

export const eliminarVehiculo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await vehiculoService.eliminar(id);
    res.json({ mensaje: "Vehículo eliminado correctamente" });
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message || "Error al eliminar vehículo" });
  }
};