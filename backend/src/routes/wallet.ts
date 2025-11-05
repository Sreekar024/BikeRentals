import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/balance', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user!.id }
    });
    res.json({ balance: wallet?.balance || 0 });
  } catch (error) {
    next(error);
  }
});

const topupSchema = z.object({
  amount: z.number().min(10).max(5000)
});

router.post('/topup', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { amount } = topupSchema.parse(req.body);
    
    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user!.id } });
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    const transaction = await prisma.$transaction(async (tx) => {
      const txn = await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'TOPUP',
          amount,
          status: 'COMPLETED'
        }
      });

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: wallet.balance + amount }
      });

      return txn;
    });

    res.json({ transaction, newBalance: wallet.balance + amount });
  } catch (error) {
    next(error);
  }
});

router.get('/transactions', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user!.id } });
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    const transactions = await prisma.transaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ transactions });
  } catch (error) {
    next(error);
  }
});

export default router;