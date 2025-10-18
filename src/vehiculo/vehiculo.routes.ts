import { Router } from "express";
import { autenticar } from "../middlewares/auth.js";
import { validarVehiculo } from "../middlewares/validaciones.js";
import {
  listarVehiculos,
  crearVehiculo,
  actualizarVehiculo,
  eliminarVehiculo
} from "./vehiculo.controller.js";


const router = Router();

router.get("/vehiculos", autenticar, listarVehiculos);
router.post("/vehiculos", autenticar, validarVehiculo, crearVehiculo);
router.put("/vehiculos/:id", autenticar, validarVehiculo, actualizarVehiculo);
router.delete("/vehiculos/:id", autenticar, eliminarVehiculo);

export default router;