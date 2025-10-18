import express from 'express';
import 'reflect-metadata';
import http from 'http';
import initSocketServer from './socket.js';
import { initORM } from './shared/db/orm.js';
import usuarioRoutes from './usuario/usuario.routes.js';
import estacionamientoRoutes from './estacionamiento/estacionamiento.routes.js';
import cocheraRoutes from './cochera/cochera.routes.js';
import vehiculoRoutes from './vehiculo/vehiculo.routes.js';
import tipoVehiculoRoutes from './tipo_vehiculo/tipo_vehiculo.routes.js';
import { manejarCORS, limitarIntentos, logearActividad, sanitizarDatos } from './middlewares/seguridad.js';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();


app.use(helmet());
app.use(manejarCORS);
app.use(cors());
app.use(express.json({ limit: '1mb' }));


const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200, 
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

app.use(limitarIntentos);
app.use(logearActividad);
app.use(sanitizarDatos);


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 7,
  message: { mensaje: 'Demasiados intentos, intente más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/usuarios/login', authLimiter);

app.use('/', usuarioRoutes);
app.use('/', estacionamientoRoutes);
app.use('/', cocheraRoutes);
app.use('/', vehiculoRoutes);
app.use('/', tipoVehiculoRoutes);


const server = http.createServer(app);


app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe. Verifica que estés usando las rutas correctas`,
    availableRoutes: {
      usuarios: ['/usuarios/registro', '/usuarios/login', '/usuarios/recuperar', '/usuarios/resetear'],
      estacionamientos: ['/estacionamientos', '/estacionamientos-disponibles', '/estacionamientos/:id'],
      cocheras: ['/cocheras/:id', '/cocheras/:id/reservar', '/cocheras/:id/liberar']
    }
  });
});


app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error capturado:', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: 'Ocurrió un error inesperado'
  });
});

initORM()
  .then(() => {
    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    server.listen(PORT, () => {
      console.log(`Servidor escuchando en puerto ${PORT}`);
    });
    initSocketServer(server);
  })
  .catch((err) => {
    console.error('[ERROR] Falló la inicialización de ORM:', err);
    process.exit(1);
  });

process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED REJECTION]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});