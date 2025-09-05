const jwtService = require('../services/jwt.service');
const ApiResponse = require('../../shared/utils/response');
const { ROLE_HIERARCHY } = require('../../shared/constants/user-roles');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.error(res, 'No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwtService.verifyAccessToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    return ApiResponse.error(res, 'Invalid or expired token', 401);
  }
};

const authorize = (...requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Authentication required', 401);
    }

    const userRole = req.user.role;
    const hasPermission = requiredRoles.some(role => {
      return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[role];
    });

    if (!hasPermission) {
      return ApiResponse.error(res, 'Insufficient permissions', 403);
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
