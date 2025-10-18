import { Router } from "express";
import {
  crearEstacionamiento,
  listarEstacionamientos,
  obtenerEstacionamiento,
  actualizarEstacionamiento,
  eliminarEstacionamiento,
  listarDisponibles,
  buscarEstacionamientos2
} from "./estacionamiento.controller.js";
import { autenticar, requiereAdmin } from "../middlewares/auth.js";
import { validarEstacionamiento } from "../middlewares/validaciones.js";

const router = Router();


router.get("/estacionamientos", listarEstacionamientos);
router.get("/estacionamientos2/buscar", buscarEstacionamientos2);
router.get("/estacionamientos-disponibles", listarDisponibles);
router.get("/estacionamientos/:id", obtenerEstacionamiento);
router.post("/estacionamientos", autenticar, requiereAdmin, validarEstacionamiento, crearEstacionamiento);
router.put("/estacionamientos/:id", autenticar, requiereAdmin, validarEstacionamiento, actualizarEstacionamiento);
router.delete("/estacionamientos/:id", autenticar, requiereAdmin, eliminarEstacionamiento);


export default router;
