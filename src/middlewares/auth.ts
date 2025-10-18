import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


const envSecret = process.env.JWT_SECRET;
let JWT_SECRET: string;
if (!envSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET no está definido en entorno de producción');
  }
  JWT_SECRET = 'tp-dsw-2025-dev-fallback';
} else {
  JWT_SECRET = envSecret;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        rol: string;
      }
    }
  }
}

export const autenticar = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ mensaje: 'Token de acceso requerido' });
      return;
    }

    const token = authHeader.substring(7); 
    
  console.log('Intentando verificar token...');
  console.log('JWT secret present:', Boolean(JWT_SECRET));
  console.log('Token recibido (trunc):', token.substring(0, 20) + '...');
    
  
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
  console.log('Token verificado exitosamente');
  console.log('Usuario decodificado (safe):', { id: (decoded as any).id, email: (decoded as any).email, rol: (decoded as any).rol });
    
    
    req.user = {
      id: decoded.id,
      email: decoded.email, 
      rol: decoded.rol
    };
    
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};

export const requiereAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ mensaje: 'Usuario no autenticado' });
    return;
  }
  
  if (req.user.rol !== 'admin') {
    res.status(403).json({ mensaje: 'Acceso denegado, se requieren privilegios de administrador' });
    return;
  }
  
  next();
};

export const generarToken = (usuario: { id: string, email: string, rol: string }): string => {
  console.log('Generando token para usuario (safe):', { id: usuario.id, email: usuario.email, rol: usuario.rol });
  const token = jwt.sign(
    { 
      id: usuario.id, 
      email: usuario.email, 
      rol: usuario.rol 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  console.log('Token generado (trunc):', token.substring(0, 20) + '...');
  return token;
};