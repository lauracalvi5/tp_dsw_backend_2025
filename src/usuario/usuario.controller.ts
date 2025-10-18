import { Request, Response } from 'express';
import { UsuarioService } from './usuario.service.js';

const usuarioService = new UsuarioService();

export const registrarUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, apellido, email, contrasena, rol } = req.body;
    const usuario = await usuarioService.registrarUsuario({ nombre, apellido, email, contrasena, rol });
    res.status(201).json({ mensaje: 'Usuario registrado exitosamente.' });
  } catch (error: any) {
    console.error('Error al registrar usuario:', error);
    res.status(400).json({ mensaje: error.message || 'Error interno del servidor.' });
  }
};

export const loginUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, contrasena } = req.body;
    const resultado = await usuarioService.login(email, contrasena);
    
    res.json({
      mensaje: 'Inicio de sesión exitoso',
      token: resultado.token,
      usuario: resultado.usuario,
    });
  } catch (error: any) {
    console.error('Error al hacer login:', error);
    res.status(401).json({ mensaje: error.message || 'Error interno del servidor.' });
  }
};


export const recuperarContrasena = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    await usuarioService.recuperarContrasena(email);
    res.json({ mensaje: 'Correo de recuperación enviado.' });
  } catch (error: any) {
    console.error('Error al enviar el correo:', error);
    res.status(404).json({ mensaje: error.message || 'Error al enviar el correo.' });
  }
};
export const resetearContrasena = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, nuevaContrasena } = req.body;
    await usuarioService.resetearContrasena(token, nuevaContrasena);
    res.json({ mensaje: 'Contraseña actualizada correctamente.' });
  } catch (error: any) {
    console.error('Error al resetear contraseña:', error);
    res.status(400).json({ mensaje: error.message || 'Error interno del servidor.' });
  }
};




