import { Router} from 'express';
import { registrarUsuario, loginUsuario, recuperarContrasena, resetearContrasena } from './usuario.controller.js';
import { validarRegistro, validarLogin } from '../middlewares/validaciones.js';


const router = Router();

router.post('/usuarios/registro', validarRegistro, registrarUsuario);
router.post('/usuarios/login', validarLogin, loginUsuario);
router.post('/usuarios/recuperar', recuperarContrasena);
router.post('/usuarios/resetear', resetearContrasena);

export default router;
