const authService = require('../services/auth.service');
const ApiResponse = require('../../shared/utils/response');
const logger = require('../../shared/utils/logger');


class AuthController {
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      return ApiResponse.success(res, result, 'Registration successful', 201);
    } catch (error) {
      logger.error('Registration error:', error);

      if (error.message === 'User already exists') {
        return ApiResponse.error(res, error.message, 409);
      }

      return ApiResponse.error(res, 'Registration failed', 500);
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      logger.error('Login error:', error);

      if (error.message === 'Invalid credentials' || error.message === 'Account is deactivated') {
        return ApiResponse.error(res, error.message, 401);
      }

      return ApiResponse.error(res, 'Login failed', 500);
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshTokens(refreshToken);
      return ApiResponse.success(res, tokens, 'Tokens refreshed successfully');
    } catch (error) {
      logger.error('Token refresh error:', error);
      return ApiResponse.error(res, 'Token refresh failed', 401);
    }
  }

  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);
      return ApiResponse.success(res, null, 'Logout successful');
    } catch (error) {
      logger.error('Logout error:', error);
      return ApiResponse.error(res, 'Logout failed', 500);
    }
  }

  async me(req, res) {
    try {
      return ApiResponse.success(res, req.user, 'User info retrieved');
    } catch (error) {
      logger.error('Get user info error:', error);
      return ApiResponse.error(res, 'Failed to get user info', 500);
    }
  }
}

module.exports = new AuthController();

