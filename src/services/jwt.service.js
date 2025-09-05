const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../models');


class JwtService {
  generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
  }

  generateRefreshToken() {
    return jwt.sign(
      { jti: uuidv4() },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
    );
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async saveRefreshToken(userId, token) {
    const decoded = this.verifyRefreshToken(token);
    const expiresAt = new Date(decoded.exp * 1000);
    await db.RefreshToken.update(
      { revoked: true },
      { where: { userId, revoked: false } }
    );
    return db.RefreshToken.create({
      token,
      userId,
      expiresAt
    });
  }


  async validateRefreshToken(token) {
    const refreshToken = await db.RefreshToken.findOne({
      where: { token, revoked: false }
    });
    if (!refreshToken) {
      throw new Error('Refresh token not found or revoked');
    }
    if (refreshToken.expiresAt < new Date()) {
      throw new Error('Refresh token expired');
    }
    return refreshToken;
  }

  async revokeRefreshToken(token) {
    return db.RefreshToken.update(
      { revoked: true },
      { where: { token } }
    );
  }
}


module.exports = new JwtService();
