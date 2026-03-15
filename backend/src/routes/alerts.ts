import { Router, Response } from 'express';
import { z } from 'zod';
import { Alert } from '../models';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);

const createAlertSchema = z.object({
  ticker: z.string().min(1).max(20),
  type: z.enum(['price_above', 'price_below', 'volume_spike', 'rsi_overbought', 'rsi_oversold']),
  condition: z.string().min(1).max(255),
  threshold: z.number().positive(),
});

// GET /api/alerts
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const alerts = await Alert.findAll({
    where: { userId: req.user!.userId },
    order: [['createdAt', 'DESC']],
  });

  res.json({ alerts });
});

// POST /api/alerts
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = createAlertSchema.parse(req.body);

    const alert = await Alert.create({
      userId: req.user!.userId,
      ticker: data.ticker,
      type: data.type,
      condition: data.condition,
      threshold: data.threshold,
    });

    res.status(201).json({ alert });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    throw error;
  }
});

// GET /api/alerts/:id
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const alert = await Alert.findOne({
    where: { id: req.params.id, userId: req.user!.userId },
  });

  if (!alert) {
    throw new AppError('Alert not found', 404);
  }

  res.json({ alert });
});

// PUT /api/alerts/:id
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const alert = await Alert.findOne({
    where: { id: req.params.id, userId: req.user!.userId },
  });

  if (!alert) {
    throw new AppError('Alert not found', 404);
  }

  try {
    const data = createAlertSchema.partial().parse(req.body);
    await alert.update(data);
    res.json({ alert });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    throw error;
  }
});

// PATCH /api/alerts/:id/toggle
router.patch('/:id/toggle', async (req: AuthRequest, res: Response): Promise<void> => {
  const alert = await Alert.findOne({
    where: { id: req.params.id, userId: req.user!.userId },
  });

  if (!alert) {
    throw new AppError('Alert not found', 404);
  }

  await alert.update({ active: !alert.active });
  res.json({ alert, message: `Alert ${alert.active ? 'activated' : 'deactivated'}` });
});

// DELETE /api/alerts/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const alert = await Alert.findOne({
    where: { id: req.params.id, userId: req.user!.userId },
  });

  if (!alert) {
    throw new AppError('Alert not found', 404);
  }

  await alert.destroy();
  res.json({ message: 'Alert deleted successfully' });
});

export default router;
