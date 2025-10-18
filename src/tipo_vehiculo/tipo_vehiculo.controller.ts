import { Request, Response } from "express";
import { TipoVehiculoService } from "./tipo_vehiculo.service.js";

const tipoVehiculoService = new TipoVehiculoService();

export const listarTiposVehiculo = async (req: Request, res: Response): Promise<void> => {
  try {
    const tipos = await tipoVehiculoService.listar();
    res.json(tipos);
  } catch (error: any) {
    res.status(500).json({ mensaje: error.message || "Error al listar tipos de vehículo" });
  }
};

export const crearTipoVehiculo = async (req: Request, res: Response): Promise<void> => {
  try {
    const tipo = await tipoVehiculoService.crear(req.body);
    res.json(tipo);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message || "Error al crear tipo de vehículo" });
  }
};

export const actualizarTipoVehiculo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const tipo = await tipoVehiculoService.actualizar(id, req.body);
    res.json(tipo);
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message || "Error al actualizar tipo de vehículo" });
  }
};

export const eliminarTipoVehiculo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await tipoVehiculoService.eliminar(id);
    res.json({ mensaje: "Tipo de vehículo eliminado correctamente" });
  } catch (error: any) {
    res.status(400).json({ mensaje: error.message || "Error al eliminar tipo de vehículo" });
  }
};