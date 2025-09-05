const db = require('../models');

class UserService {
  async getAllUsers(filters = {}) {
    const where = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return db.User.findAll({ where });
  }

  async getUserById(id) {
    const user = await db.User.findByPk(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateUser(id, updates) {
    const user = await this.getUserById(id);

    delete updates.id;
    delete updates.email;
    delete updates.password;

    await user.update(updates);
    return user;
  }

  async deleteUser(id) {
    const user = await this.getUserById(id);
    await user.destroy();
    return { message: 'User deleted successfully' };
  }
}

module.exports = new UserService();
