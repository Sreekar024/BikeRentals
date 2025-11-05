import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient, Role } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Apply admin authorization to all routes
router.use(authenticate);
router.use(authorize([Role.ADMIN]));

router.get('/dashboard', async (req: AuthRequest, res, next) => {
  try {
    const [totalRides, totalRevenue, activeUsers, availableBikes] = await Promise.all([
      prisma.ride.count(),
      prisma.ride.aggregate({ _sum: { cost: true } }),
      prisma.user.count({ where: { role: Role.STUDENT } }),
      prisma.bike.count({ where: { status: 'AVAILABLE' } })
    ]);

    res.json({
      totalRides,
      totalRevenue: totalRevenue._sum.cost || 0,
      activeUsers,
      availableBikes
    });
  } catch (error) {
    next(error);
  }
});

router.get('/users', async (req: AuthRequest, res, next) => {
  try {
    const users = await prisma.user.findMany({
      include: { wallet: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ users });
  } catch (error) {
    next(error);
  }
});

const approveKycSchema = z.object({
  userId: z.string(),
  approved: z.boolean()
});

router.post('/users/kyc', async (req: AuthRequest, res, next) => {
  try {
    const { userId, approved } = approveKycSchema.parse(req.body);
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: approved ? 'APPROVED' : 'REJECTED' }
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.get('/bikes', async (req: AuthRequest, res, next) => {
  try {
    const bikes = await prisma.bike.findMany({
      include: { dock: true }
    });
    res.json({ bikes });
  } catch (error) {
    next(error);
  }
});

const createBikeSchema = z.object({
  type: z.enum(['STANDARD', 'E_BIKE']),
  dockId: z.string()
});

router.post('/bikes', async (req: AuthRequest, res, next) => {
  try {
    const { type, dockId } = createBikeSchema.parse(req.body);
    
    const bike = await prisma.bike.create({
      data: { type, dockId, batteryPct: type === 'E_BIKE' ? 100 : null },
      include: { dock: true }
    });

    res.json({ bike });
  } catch (error) {
    next(error);
  }
});

router.get('/docks', async (req: AuthRequest, res, next) => {
  try {
    const docks = await prisma.dock.findMany({
      include: { bikes: true }
    });
    res.json({ docks });
  } catch (error) {
    next(error);
  }
});

const createDockSchema = z.object({
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  capacity: z.number().min(1)
});

router.post('/docks', async (req: AuthRequest, res, next) => {
  try {
    const data = createDockSchema.parse(req.body);
    const dock = await prisma.dock.create({ data });
    res.json({ dock });
  } catch (error) {
    next(error);
  }
});

router.get('/pricing', async (req: AuthRequest, res, next) => {
  try {
    const pricing = await prisma.pricingRule.findFirst({ where: { active: true } });
    res.json({ pricing });
  } catch (error) {
    next(error);
  }
});

const updatePricingSchema = z.object({
  perMinute: z.number().min(0),
  perKm: z.number().min(0),
  unlockFee: z.number().min(0),
  minBalanceRequired: z.number().min(0)
});

router.put('/pricing', async (req: AuthRequest, res, next) => {
  try {
    const data = updatePricingSchema.parse(req.body);
    
    // Deactivate current pricing
    await prisma.pricingRule.updateMany({
      where: { active: true },
      data: { active: false }
    });

    // Create new pricing
    const pricing = await prisma.pricingRule.create({ data });
    res.json({ pricing });
  } catch (error) {
    next(error);
  }
});

router.get('/reports', async (req: AuthRequest, res, next) => {
  try {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [dailyRides, weeklyRevenue, popularDocks] = await Promise.all([
      prisma.ride.groupBy({
        by: ['startedAt'],
        _count: { id: true },
        where: { startedAt: { gte: weekAgo } }
      }),
      prisma.ride.aggregate({
        _sum: { cost: true },
        where: { startedAt: { gte: weekAgo } }
      }),
      prisma.ride.groupBy({
        by: ['startDockId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5
      })
    ]);

    res.json({ dailyRides, weeklyRevenue: weeklyRevenue._sum.cost || 0, popularDocks });
  } catch (error) {
    next(error);
  }
});

export default router;