import { Router } from "express";
import {
  listarCocherasOcupadas,
  obtenerCocherasLibres,
  reservarCochera,
  cancelarReservaCochera,
  liberarCochera,
  getReservasUsuario
} from "./cochera.controller.js";
import { autenticar, requiereAdmin } from "../middlewares/auth.js";


const router = Router();


router.get("/cocheras", listarCocherasOcupadas);
router.get("/cocheras/libres", obtenerCocherasLibres);
router.put("/cocheras/reservar", autenticar, reservarCochera);
router.put("/cocheras/:id/cancelar", autenticar, cancelarReservaCochera);
router.get("/cocheras/mis-reservas", autenticar, getReservasUsuario);
router.put("/cocheras/:id/liberar", autenticar, requiereAdmin, liberarCochera);


export default router;
