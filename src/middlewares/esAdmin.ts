import { Request, Response, NextFunction } from "express";
import { DI } from "../shared/db/orm.js";
import { Usuario } from "../usuario/usuario.entity.js";
import { ObjectId } from "@mikro-orm/mongodb";

export const esAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.body && req.body.userId) || (req.query && req.query.userId);
    if (!userId) {
      res.status(401).json({ mensaje: "Falta el usuario" });
      return;
    }
    if (!ObjectId.isValid(userId)) {
      res.status(400).json({ mensaje: "ID de usuario inválido" });
      return;
    }
    const usuario = await DI.em.findOne(Usuario, { _id: new ObjectId(userId) });
    if (!usuario || usuario.rol !== "admin") {
      res.status(403).json({ mensaje: "Acceso denegado, solo administradores" });
      return;
    }
    next();
  } catch (error: any) {
    console.error("Error en esAdmin:", error);
    res.status(500).json({ mensaje: "Error al validar admin", error: error?.message || error });
  }
};