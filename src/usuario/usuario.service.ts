import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { DI } from '../shared/db/orm.js';
import { Usuario } from './usuario.entity.js';
import { generarToken } from '../middlewares/auth.js';

export class UsuarioService {
  
  async registrarUsuario(datos: { nombre: string, apellido: string, email: string, contrasena: string, rol?: string }) {
    const existente = await DI.em.findOne(Usuario, { email: datos.email });
    if (existente) {
      throw new Error('El email ya está registrado.');
    }

    const hash = await bcrypt.hash(datos.contrasena, 10);
    const nuevoUsuario = DI.em.create(Usuario, {
      nombre: datos.nombre,
      apellido: datos.apellido,
      email: datos.email,
      contrasena: hash,
      rol: datos.rol && datos.rol === "admin" ? "admin" : "cliente",
    });

    await DI.em.persistAndFlush(nuevoUsuario);
    return nuevoUsuario;
  }

  async login(email: string, contrasena: string) {
    const usuario = await DI.em.findOne(Usuario, { email });
    if (!usuario) {
      throw new Error('El email ingresado no es válido');
    }

    const esValido = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esValido) {
      throw new Error('La contraseña ingresada es incorrecta');
    }

    const usuarioData = {
      id: usuario._id.toString(),
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };

    const token = generarToken(usuarioData);

    return {
      token,
      usuario: usuarioData
    };
  }

  async recuperarContrasena(email: string) {
    const usuario = await DI.em.findOne(Usuario, { email });
    if (!usuario) {
      throw new Error('Usuario no encontrado.');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiracion = new Date(Date.now() + 1000 * 60 * 15);
    usuario.resetToken = token;
    usuario.resetTokenExpira = expiracion;
    await DI.em.persistAndFlush(usuario);

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'parkeasy.tpdsw@gmail.com',
        pass: 'itnb qert cium czlb',
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const link = `http://localhost:5173/resetear?token=${token}`;
    
    await transporter.sendMail({
      from: 'parkeasy.tpdsw@gmail.com',
      to: usuario.email,
      subject: 'Recuperar contraseña',
      html: `<p>Hiciste una solicitud para cambiar tu contraseña.</p>
             <p>Hacé clic en este enlace: <a href="${link}">${link}</a></p>`
    });

    return true;
  }

  async resetearContrasena(token: string, nuevaContrasena: string) {
    const usuario = await DI.em.findOne(Usuario, {
      resetToken: token,
      resetTokenExpira: { $gt: new Date() },
    });

    if (!usuario) {
      throw new Error('Token inválido o expirado.');
    }

    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
    usuario.contrasena = hashedPassword;
    usuario.resetToken = undefined;
    usuario.resetTokenExpira = undefined;

    await DI.em.persistAndFlush(usuario);
    return true;
  }
}