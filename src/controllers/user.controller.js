const userService = require('../services/user.service');
const ApiResponse = require('../../shared/utils/response');
const logger = require('../../shared/utils/logger');


class UserController {
  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers(req.query);
      return ApiResponse.success(res, users, 'Users retrieved successfully');
    } catch (error) {
      logger.error('Get users error:', error);
      return ApiResponse.error(res, 'Failed to retrieve users', 500);
    }
  }

  async getUserById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      return ApiResponse.success(res, user, 'User retrieved successfully');
    } catch (error) {
      logger.error('Get user error:', error);

      if (error.message === 'User not found') {
        return ApiResponse.error(res, error.message, 404);
      }

      return ApiResponse.error(res, 'Failed to retrieve user', 500);
    }
  }

  async updateUser(req, res) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      return ApiResponse.success(res, user, 'User updated successfully');
    } catch (error) {
      logger.error('Update user error:', error);

      if (error.message === 'User not found') {
        return ApiResponse.error(res, error.message, 404);
      }

      return ApiResponse.error(res, 'Failed to update user', 500);
    }
  }

  async deleteUser(req, res) {
    try {
      const result = await userService.deleteUser(req.params.id);
      return ApiResponse.success(res, result, 'User deleted successfully');
    } catch (error) {
      logger.error('Delete user error:', error);

      if (error.message === 'User not found') {
        return ApiResponse.error(res, error.message, 404);
      }

      return ApiResponse.error(res, 'Failed to delete user', 500);
    }
  }

}

module.exports = new UserController();

