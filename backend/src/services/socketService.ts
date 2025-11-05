import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-ride', (rideId: string) => {
      socket.join(`ride-${rideId}`);
    });

    socket.on('leave-ride', (rideId: string) => {
      socket.leave(`ride-${rideId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Simulate bike location updates
  setInterval(async () => {
    try {
      const bikes = await prisma.bike.findMany({
        where: { status: { in: ['AVAILABLE', 'IN_RIDE'] } }
      });

      const bikeUpdates = bikes.map(bike => ({
        id: bike.id,
        lat: bike.lat,
        lng: bike.lng,
        status: bike.status,
        batteryPct: bike.batteryPct
      }));

      io.emit('bikes-update', bikeUpdates);
    } catch (error) {
      console.error('Error broadcasting bike updates:', error);
    }
  }, 10000); // Every 10 seconds
};