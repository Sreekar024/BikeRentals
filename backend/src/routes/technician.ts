import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient, Role } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);
router.use(authorize([Role.TECHNICIAN, Role.ADMIN]));

router.get('/tickets', async (req: AuthRequest, res, next) => {
  try {
    const tickets = await prisma.maintenanceTicket.findMany({
      where: req.user!.role === Role.TECHNICIAN ? { assignedTo: req.user!.id } : {},
      include: { bike: true, creator: true, assignee: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ tickets });
  } catch (error) {
    next(error);
  }
});

const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
  notes: z.string().optional()
});

router.put('/tickets/:id', async (req: AuthRequest, res, next) => {
  try {
    const { status, notes } = updateTicketSchema.parse(req.body);
    
    const ticket = await prisma.maintenanceTicket.update({
      where: { id: req.params.id },
      data: { status, notes },
      include: { bike: true, creator: true, assignee: true }
    });

    res.json({ ticket });
  } catch (error) {
    next(error);
  }
});

export default router;