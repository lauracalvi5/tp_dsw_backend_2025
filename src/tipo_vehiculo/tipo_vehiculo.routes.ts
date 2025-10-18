import { Router } from "express";
import {
  listarTiposVehiculo,
  crearTipoVehiculo,
  actualizarTipoVehiculo,
  eliminarTipoVehiculo
} from "./tipo_vehiculo.controller.js";

const router = Router();

router.get("/tipos-vehiculo", listarTiposVehiculo);
router.post("/tipos-vehiculo", crearTipoVehiculo);
router.put("/tipos-vehiculo/:id", actualizarTipoVehiculo);
router.delete("/tipos-vehiculo/:id", eliminarTipoVehiculo);

export default router;