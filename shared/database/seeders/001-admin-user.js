const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');


module.exports = {
  up: async (queryInterface) => {
    // Hash password for admin user
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('Admin@123', saltRounds);

    await queryInterface.bulkInsert('users', [{
      id: uuidv4(),
      email: 'lkirnadz@gmail.com',
      password: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      is_active: true,
      email_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    }]);

    console.log('✓ Admin user created with email: lkirnadz@gmail.com and password: Admin123!@#');
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users',{
      email: 'lkirnadz@gmail.com'
    });
  }
};
