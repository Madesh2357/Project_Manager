const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { signToken, revokeToken } = require('../utils/tokenBlacklist');
const logger = require('../utils/logger');

const SALT_ROUNDS = 12;

async function register(req, res, next) {
  try {
    const { fullName, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email address is already registered',
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { fullName, email, password: hashedPassword },
      select: { id: true, fullName: true, email: true, createdAt: true },
    });

    const token = signToken({ userId: user.id });
    logger.info('User registered', { userId: user.id });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = signToken({ userId: user.id });
    logger.info('User logged in', { userId: user.id });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res) {
  revokeToken(req.token);
  logger.info('User logged out', { userId: req.user.id });
  res.json({
    success: true,
    message: 'Logout successful',
  });
}

async function getProfile(req, res) {
  res.json({
    success: true,
    data: { user: req.user },
  });
}

module.exports = { register, login, logout, getProfile };
