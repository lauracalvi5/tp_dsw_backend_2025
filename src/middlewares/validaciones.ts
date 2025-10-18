import { Request, Response, NextFunction } from 'express';

export const validarRegistro = (req: Request, res: Response, next: NextFunction) => {
  const { nombre, apellido, email, contrasena } = req.body;
  
  if (!nombre || nombre.trim().length < 2) {
    res.status(400).json({ mensaje: 'El nombre debe tener al menos 2 caracteres' });
    return;
  }
  
  if (!apellido || apellido.trim().length < 2) {
    res.status(400).json({ mensaje: 'El apellido debe tener al menos 2 caracteres' });
    return;
  }
  
  if (!email || !email.includes('@')) {
    res.status(400).json({ mensaje: 'Email inválido' });
    return;
  }
  
  if (!contrasena || contrasena.length < 6) {
    res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
    return;
  }
  
  next();
};

export const validarLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, contrasena } = req.body;
  
  if (!email || !contrasena) {
    res.status(400).json({ mensaje: 'Email y contraseña son requeridos' });
    return;
  }
  
  next();
};

export const validarEstacionamiento = (req: Request, res: Response, next: NextFunction) => {
  const { nombre, direccion, capacidad, precioHora } = req.body;
  
  if (!nombre || nombre.trim().length < 3) {
    res.status(400).json({ mensaje: 'El nombre debe tener al menos 3 caracteres' });
    return;
  }
  
  if (!direccion || direccion.trim().length < 5) {
    res.status(400).json({ mensaje: 'La dirección debe tener al menos 5 caracteres' });
    return;
  }

  if (capacidad === undefined || capacidad === null || !Number.isFinite(capacidad) || !Number.isInteger(capacidad) || capacidad < 1) {
    res.status(400).json({ mensaje: 'La capacidad debe ser un entero mayor a 0' });
    return;
  }
  if (precioHora === undefined || precioHora === null || !Number.isFinite(precioHora) || precioHora <= 0) {
    res.status(400).json({ mensaje: 'El precio por hora debe ser un número mayor a 0' });
    return;
  }

  const { lat, lng, activo, horarioApertura, horarioCierre } = req.body;
  if (lat === undefined || lng === undefined) {
    res.status(400).json({ mensaje: 'Latitud y longitud son requeridas' });
    return;
  }
  if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
    res.status(400).json({ mensaje: 'Latitud y longitud deben ser números válidos' });
    return;
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    res.status(400).json({ mensaje: 'Latitud o longitud fuera de rango' });
    return;
  }

  if (activo !== undefined && typeof activo !== 'boolean') {
    res.status(400).json({ mensaje: 'El campo activo debe ser booleano' });
    return;
  }
  const timeRe = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (horarioApertura !== undefined && horarioApertura !== null) {
    if (typeof horarioApertura !== 'string' || !timeRe.test(horarioApertura)) {
      res.status(400).json({ mensaje: 'horarioApertura debe tener formato HH:MM' });
      return;
    }
  }
  if (horarioCierre !== undefined && horarioCierre !== null) {
    if (typeof horarioCierre !== 'string' || !timeRe.test(horarioCierre)) {
      res.status(400).json({ mensaje: 'horarioCierre debe tener formato HH:MM' });
      return;
    }
  }
  if (horarioApertura && horarioCierre) {
    const [ah, am] = horarioApertura.split(':').map(Number);
    const [ch, cm] = horarioCierre.split(':').map(Number);
    const aMinutes = ah * 60 + am;
    const cMinutes = ch * 60 + cm;
    if (aMinutes >= cMinutes) {
      res.status(400).json({ mensaje: 'horarioApertura debe ser anterior a horarioCierre' });
      return;
    }
  }
  
  next();
};

export const validarVehiculo = (req: Request, res: Response, next: NextFunction) => {
  const { marca, modelo, patente, tipoId } = req.body;

  if (!marca || marca.trim().length < 2) {
    res.status(400).json({ mensaje: 'La marca debe tener al menos 2 caracteres' });
    return;
  }

  if (!modelo || modelo.trim().length < 1) {
    res.status(400).json({ mensaje: 'El modelo es requerido' });
    return;
  }

  if (!patente || patente.trim().length < 4) {
    res.status(400).json({ mensaje: 'Patente inválida' });
    return;
  }

  if (!tipoId || typeof tipoId !== 'string' || tipoId.length !== 24) {
    res.status(400).json({ mensaje: 'tipoId inválido' });
    return;
  }

  next();
};

