import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { z } from 'zod';
import { User } from '../models';
import { JWT_CONFIG, BCRYPT_ROUNDS } from '../config/constants';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  riskProfile: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const verify2faSchema = z.object({
  token: z.string().length(6, 'Token must be 6 digits'),
  tempToken: z.string().min(1),
});

// POST /api/auth/register
router.post('/register', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    const user = await User.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      riskProfile: data.riskProfile || 'moderate',
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_CONFIG.secret,
      { expiresIn: JWT_CONFIG.expirySeconds }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        riskProfile: user.riskProfile,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    throw error;
  }
});

// POST /api/auth/login
router.post('/login', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await User.findOne({ where: { email: data.email } });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // If 2FA is enabled, return a temporary token
    if (user.twoFactorEnabled) {
      const tempToken = jwt.sign(
        { userId: user.id, email: user.email, requires2FA: true },
        JWT_CONFIG.secret,
        { expiresIn: 300 }
      );

      res.json({
        requires2FA: true,
        tempToken,
        message: 'Please provide your 2FA code',
      });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_CONFIG.secret,
      { expiresIn: JWT_CONFIG.expirySeconds }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        riskProfile: user.riskProfile,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    throw error;
  }
});

// POST /api/auth/verify-2fa
router.post('/verify-2fa', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = verify2faSchema.parse(req.body);

    const decoded = jwt.verify(data.tempToken, JWT_CONFIG.secret) as {
      userId: number;
      email: string;
      requires2FA: boolean;
    };

    if (!decoded.requires2FA) {
      throw new AppError('Invalid temporary token', 400);
    }

    const user = await User.findByPk(decoded.userId);
    if (!user || !user.twoFactorSecret) {
      throw new AppError('User not found or 2FA not configured', 400);
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: data.token,
      window: 1,
    });

    if (!isValid) {
      throw new AppError('Invalid 2FA code', 401);
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_CONFIG.secret,
      { expiresIn: JWT_CONFIG.expirySeconds }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        riskProfile: user.riskProfile,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    throw error;
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findByPk(req.user!.userId, {
    attributes: ['id', 'email', 'firstName', 'lastName', 'riskProfile', 'twoFactorEnabled', 'createdAt'],
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({ user });
});

// POST /api/auth/setup-2fa
router.post('/setup-2fa', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findByPk(req.user!.userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const secret = speakeasy.generateSecret({
    name: `BourseCAC40 (${user.email})`,
    issuer: 'BourseCAC40',
  });

  await user.update({ twoFactorSecret: secret.base32 });

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

  res.json({
    secret: secret.base32,
    qrCode: qrCodeUrl,
    message: 'Scan the QR code with your authenticator app, then verify with /api/auth/confirm-2fa',
  });
});

// POST /api/auth/confirm-2fa
router.post('/confirm-2fa', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { token } = req.body;

  const user = await User.findByPk(req.user!.userId);
  if (!user || !user.twoFactorSecret) {
    throw new AppError('2FA not set up', 400);
  }

  const isValid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 1,
  });

  if (!isValid) {
    throw new AppError('Invalid 2FA code', 400);
  }

  await user.update({ twoFactorEnabled: true });
  res.json({ message: '2FA enabled successfully' });
});

export default router;
