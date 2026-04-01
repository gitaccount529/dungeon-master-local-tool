import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { SpotlightEvent } from './types';

let io: SocketIOServer | null = null;

export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    path: '/api/socket',
  });

  let playerCount = 0;

  io.on('connection', (socket) => {
    const role = socket.handshake.query.role as string;

    if (role === 'player') {
      playerCount++;
      io!.emit('player:count', playerCount);
      console.log(`Player connected (${playerCount} total)`);

      socket.on('disconnect', () => {
        playerCount--;
        io!.emit('player:count', playerCount);
        console.log(`Player disconnected (${playerCount} total)`);
      });
    }

    if (role === 'dm') {
      console.log('DM connected');

      socket.on('spotlight:update', (event: SpotlightEvent) => {
        io!.emit('spotlight:update', event);
      });

      socket.on('spotlight:clear', () => {
        io!.emit('spotlight:clear');
      });

      socket.on('combat:update', (state: unknown) => {
        io!.emit('combat:update', state);
      });

      socket.on('narrative:update', (data: unknown) => {
        io!.emit('narrative:update', data);
      });

      socket.on('disconnect', () => {
        console.log('DM disconnected');
      });
    }
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}
