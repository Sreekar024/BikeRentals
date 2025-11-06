import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient, BikeStatus } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const startRideSchema = z.object({
  reservationId: z.string()
});

router.post('/start', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { reservationId } = startRideSchema.parse(req.body);
    
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { bike: { include: { dock: true } } }
    });

    if (!reservation || reservation.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const ride = await prisma.$transaction(async (tx) => {
      // Update reservation status
      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: 'COMPLETED' }
      });

      // Update bike status
      await tx.bike.update({
        where: { id: reservation.bikeId },
        data: { status: BikeStatus.IN_RIDE }
      });

      // Create ride
      return tx.ride.create({
        data: {
          userId: req.user!.id,
          bikeId: reservation.bikeId,
          startDockId: reservation.bike.dockId,
          startedAt: new Date()
        },
        include: { bike: true, startDock: true }
      });
    });

    res.json({ ride });
  } catch (error) {
    next(error);
  }
});

const heartbeatSchema = z.object({
  rideId: z.string(),
  lat: z.number(),
  lng: z.number()
});

router.post('/heartbeat', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { rideId, lat, lng } = heartbeatSchema.parse(req.body);
    
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride || ride.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    await prisma.bike.update({
      where: { id: ride.bikeId },
      data: { lat, lng, lastSeenAt: new Date() }
    });

    const duration = Math.floor((Date.now() - ride.startedAt.getTime()) / 60000);
    const pricing = await prisma.pricingRule.findFirst({ where: { active: true } });
    const estimatedCost = pricing!.unlockFee + (duration * pricing!.perMinute);

    res.json({ duration, estimatedCost });
  } catch (error) {
    next(error);
  }
});

const endRideSchema = z.object({
  rideId: z.string(),
  endDockId: z.string().optional(),
  lat: z.number(),
  lng: z.number()
});

router.post('/end', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { rideId, endDockId, lat, lng } = endRideSchema.parse(req.body);
    
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: { bike: true }
    });

    if (!ride || ride.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    const endedAt = new Date();
    const duration = Math.floor((endedAt.getTime() - ride.startedAt.getTime()) / 60000);
    const pricing = await prisma.pricingRule.findFirst({ where: { active: true } });
    
    // Calculate cost
    let cost = pricing!.unlockFee + (duration * pricing!.perMinute);
    if (!endDockId) cost += pricing!.offDockPenalty; // Off-dock penalty

    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user!.id } });

    const updatedRide = await prisma.$transaction(async (tx) => {
      // Update ride
      const updated = await tx.ride.update({
        where: { id: rideId },
        data: {
          endedAt,
          duration,
          cost,
          endDockId
        }
      });

      // Update bike
      await tx.bike.update({
        where: { id: ride.bikeId },
        data: {
          status: BikeStatus.AVAILABLE,
          dockId: endDockId,
          lat,
          lng
        }
      });

      // Charge wallet
      await tx.transaction.create({
        data: {
          walletId: wallet!.id,
          type: 'CHARGE',
          amount: cost,
          status: 'COMPLETED'
        }
      });

      // Refund unused hold amount
      const refund = pricing!.minBalanceRequired - cost;
      if (refund > 0) {
        await tx.transaction.create({
          data: {
            walletId: wallet!.id,
            type: 'REFUND',
            amount: refund,
            status: 'COMPLETED'
          }
        });
        
        await tx.wallet.update({
          where: { id: wallet!.id },
          data: { balance: wallet!.balance + refund }
        });
      }

      return updated;
    });

    res.json({ ride: updatedRide });
  } catch (error) {
    next(error);
  }
});

router.get('/history', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const [rides, reservations] = await Promise.all([
      prisma.ride.findMany({
        where: { userId: req.user!.id },
        include: { bike: true, startDock: true, endDock: true },
        orderBy: { startedAt: 'desc' }
      }),
      prisma.reservation.findMany({
        where: { userId: req.user!.id },
        include: { bike: { include: { dock: true } } },
        orderBy: { startAt: 'desc' }
      })
    ]);
    res.json({ rides, reservations });
  } catch (error) {
    next(error);
  }
});

export default router;