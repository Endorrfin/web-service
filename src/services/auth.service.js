const db = require('../models');
const jwtService = require('./jwt.service');
const logger = require('../../shared/utils/logger');


class AuthService {
  async register(userData) {
    const { email, password, firstName, lastName, role = 'viewer' } = userData;

    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = await db.User.create({
      email,
      password,
      firstName,
      lastName,
      role
    });

    logger.info(`New user registered: ${email}`);

    const tokens = await this.generateTokens(user);

    return { user: user.toJSON(), ...tokens };
  }

  async login(email, password) {
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    await user.update({ lastLogin: new Date() });

    const tokens = await this.generateTokens(user);

    logger.info(`User logged in: ${email}`);

    return { user: user.toJSON(), ...tokens };
  }

  async refreshTokens(refreshToken) {
    const tokenRecord = await jwtService.validateRefreshToken(refreshToken);

    const user = await db.User.findByPk(tokenRecord.userId);
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    await jwtService.revokeRefreshToken(refreshToken);

    const tokens = await this.generateTokens(user);

    return tokens;
  }

  async logout(refreshToken) {
    await jwtService.revokeRefreshToken(refreshToken);
    logger.info('User logged out');
  }

  async generateTokens(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwtService.generateAccessToken(payload);
    const refreshToken = jwtService.generateRefreshToken();

    await jwtService.saveRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }
}

module.exports = new AuthService();
