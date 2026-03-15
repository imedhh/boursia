import { Router, Response } from 'express';
import { z } from 'zod';
import { Portfolio, Position } from '../models';
import { fetchQuote } from '../services/marketData';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.use(authMiddleware);

// Validation schemas
const createPortfolioSchema = z.object({
  name: z.string().min(1, 'Portfolio name is required').max(255),
  type: z.enum(['virtual', 'real']).default('virtual'),
});

const addPositionSchema = z.object({
  ticker: z.string().min(1).max(20),
  quantity: z.number().positive('Quantity must be positive'),
  buyPrice: z.number().positive('Buy price must be positive'),
  buyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
});

// GET /api/portfolios
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const portfolios = await Portfolio.findAll({
    where: { userId: req.user!.userId },
    include: [{ model: Position, as: 'positions' }],
  });

  res.json({ portfolios });
});

// POST /api/portfolios
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = createPortfolioSchema.parse(req.body);

    const portfolio = await Portfolio.create({
      name: data.name,
      type: data.type,
      userId: req.user!.userId,
    });

    res.status(201).json({ portfolio });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    throw error;
  }
});

// GET /api/portfolios/:id
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const portfolio = await Portfolio.findOne({
    where: { id: req.params.id, userId: req.user!.userId },
    include: [{ model: Position, as: 'positions' }],
  });

  if (!portfolio) {
    throw new AppError('Portfolio not found', 404);
  }

  res.json({ portfolio });
});

// PUT /api/portfolios/:id
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const portfolio = await Portfolio.findOne({
    where: { id: req.params.id, userId: req.user!.userId },
  });

  if (!portfolio) {
    throw new AppError('Portfolio not found', 404);
  }

  try {
    const data = createPortfolioSchema.partial().parse(req.body);
    await portfolio.update(data);
    res.json({ portfolio });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    throw error;
  }
});

// DELETE /api/portfolios/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const portfolio = await Portfolio.findOne({
    where: { id: req.params.id, userId: req.user!.userId },
  });

  if (!portfolio) {
    throw new AppError('Portfolio not found', 404);
  }

  await Position.destroy({ where: { portfolioId: portfolio.id } });
  await portfolio.destroy();

  res.json({ message: 'Portfolio deleted successfully' });
});

// POST /api/portfolios/:id/positions
router.post('/:id/positions', async (req: AuthRequest, res: Response): Promise<void> => {
  const portfolio = await Portfolio.findOne({
    where: { id: req.params.id, userId: req.user!.userId },
  });

  if (!portfolio) {
    throw new AppError('Portfolio not found', 404);
  }

  try {
    const data = addPositionSchema.parse(req.body);

    const position = await Position.create({
      portfolioId: portfolio.id,
      ticker: data.ticker,
      quantity: data.quantity,
      buyPrice: data.buyPrice,
      buyDate: new Date(data.buyDate),
    });

    res.status(201).json({ position });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    throw error;
  }
});

// DELETE /api/portfolios/:id/positions/:positionId
router.delete('/:id/positions/:positionId', async (req: AuthRequest, res: Response): Promise<void> => {
  const portfolio = await Portfolio.findOne({
    where: { id: req.params.id, userId: req.user!.userId },
  });

  if (!portfolio) {
    throw new AppError('Portfolio not found', 404);
  }

  const position = await Position.findOne({
    where: { id: req.params.positionId, portfolioId: portfolio.id },
  });

  if (!position) {
    throw new AppError('Position not found', 404);
  }

  await position.destroy();
  res.json({ message: 'Position removed successfully' });
});

// GET /api/portfolios/:id/performance
router.get('/:id/performance', async (req: AuthRequest, res: Response): Promise<void> => {
  const portfolio = await Portfolio.findOne({
    where: { id: req.params.id, userId: req.user!.userId },
    include: [{ model: Position, as: 'positions' }],
  });

  if (!portfolio) {
    throw new AppError('Portfolio not found', 404);
  }

  const positions = (portfolio as any).positions as Position[];
  const openPositions = positions.filter((p) => !p.sellDate);

  let totalInvested = 0;
  let totalCurrentValue = 0;
  const positionDetails = [];

  for (const position of openPositions) {
    const invested = Number(position.quantity) * Number(position.buyPrice);
    totalInvested += invested;

    try {
      const quote = await fetchQuote(position.ticker);
      const currentValue = Number(position.quantity) * quote.price;
      totalCurrentValue += currentValue;
      const pnl = currentValue - invested;
      const pnlPercent = (pnl / invested) * 100;

      positionDetails.push({
        ticker: position.ticker,
        quantity: Number(position.quantity),
        buyPrice: Number(position.buyPrice),
        currentPrice: quote.price,
        invested,
        currentValue,
        pnl,
        pnlPercent,
      });
    } catch {
      positionDetails.push({
        ticker: position.ticker,
        quantity: Number(position.quantity),
        buyPrice: Number(position.buyPrice),
        currentPrice: null,
        invested,
        currentValue: null,
        pnl: null,
        pnlPercent: null,
        error: 'Unable to fetch current price',
      });
    }
  }

  const totalPnl = totalCurrentValue - totalInvested;
  const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  res.json({
    portfolioId: portfolio.id,
    portfolioName: portfolio.name,
    totalInvested,
    totalCurrentValue,
    totalPnl,
    totalPnlPercent,
    positionsCount: openPositions.length,
    positions: positionDetails,
  });
});

export default router;
