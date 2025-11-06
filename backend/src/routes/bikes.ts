import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient, BikeStatus } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /bikes:
 *   get:
 *     summary: Get available bikes
 */
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const bikes = await prisma.bike.findMany({
      where: { status: BikeStatus.AVAILABLE },
      include: { dock: true }
    });
    res.json({ bikes });
  } catch (error) {
    next(error);
  }
});

router.get('/current-reservation', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const reservation = await prisma.reservation.findFirst({
      where: { 
        userId: req.user!.id,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() }
      },
      include: { bike: { include: { dock: true } } }
    });
    res.json({ reservation });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const bike = await prisma.bike.findUnique({
      where: { id: req.params.id },
      include: { dock: true }
    });
    if (!bike) return res.status(404).json({ error: 'Bike not found' });
    res.json({ bike });
  } catch (error) {
    next(error);
  }
});

const reserveSchema = z.object({
  bikeId: z.string(),
  duration: z.number().min(15).max(480) // 15 min to 8 hours
});

router.post('/reserve', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { bikeId, duration } = reserveSchema.parse(req.body);
    
    // Check wallet balance
    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user!.id } });
    const pricing = await prisma.pricingRule.findFirst({ where: { active: true } });
    
    if (!wallet || wallet.balance < pricing!.minBalanceRequired) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Check bike availability
    const bike = await prisma.bike.findUnique({ where: { id: bikeId } });
    if (!bike || bike.status !== BikeStatus.AVAILABLE) {
      return res.status(400).json({ error: 'Bike not available' });
    }

    const startAt = new Date();
    const expiresAt = new Date(startAt.getTime() + duration * 60000);

    const reservation = await prisma.$transaction(async (tx) => {
      // Hold balance
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'HOLD',
          amount: pricing!.minBalanceRequired,
          status: 'COMPLETED'
        }
      });

      // Update wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: wallet.balance - pricing!.minBalanceRequired }
      });

      // Update bike status
      await tx.bike.update({
        where: { id: bikeId },
        data: { status: BikeStatus.RESERVED }
      });

      // Create reservation
      return tx.reservation.create({
        data: {
          userId: req.user!.id,
          bikeId,
          startAt,
          expiresAt
        },
        include: { bike: { include: { dock: true } } }
      });
    });

    res.json({ reservation });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/unlock', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const bike = await prisma.bike.findUnique({
      where: { id: req.params.id },
      include: { reservations: { where: { userId: req.user!.id, status: 'ACTIVE' } } }
    });

    if (!bike || bike.reservations.length === 0) {
      return res.status(400).json({ error: 'No active reservation' });
    }

    await prisma.bike.update({
      where: { id: req.params.id },
      data: { status: BikeStatus.IN_RIDE }
    });

    res.json({ message: 'Bike unlocked', unlockCode: `UNLOCK-${Date.now()}` });
  } catch (error) {
    next(error);
  }
});

export default router;