import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { Application } from 'express';

export function initSocketServer(server: http.Server) {
  const io = new SocketServer(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', socket => {
    console.log('Nuevo cliente conectado', socket.id);

    socket.on('message', (body) => {
      console.log('message recibido:', body);
      socket.broadcast.emit('message', {
        body,
        from: 'Usuario'
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('Cliente desconectado', socket.id, reason);
    });
  });

  return io;
}

export default initSocketServer;
