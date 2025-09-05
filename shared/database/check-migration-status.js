const { Sequelize } = require('sequelize');
require('dotenv').config();

async function checkDatabaseState() {
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'postgres',
      logging: false
    }
  );

  try {
    console.log('\n🔍 Checking database state...\n');

    // Check users table
    const [userColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('stripe_customer_id')
      ORDER BY column_name;
    `);

    console.log('📊 Users table columns:');
    if (userColumns.length > 0) {
      userColumns.forEach(col => {
        console.log(`  ✅ ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log('  ❌ stripe_customer_id not found');
    }

    // Check subscriptions table
    const [subColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'subscriptions' 
      AND column_name IN ('pending_plan_id', 'pending_change_date', 'cancelled_at')
      ORDER BY column_name;
    `);

    console.log('\n📊 Subscriptions table columns:');
    if (subColumns.length > 0) {
      subColumns.forEach(col => {
        console.log(`  ✅ ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log('  ❌ New columns not found');
    }

    // Check if new tables exist
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('billing_history', 'credits', 'qr_code_scans', 'print_orders')
      ORDER BY table_name;
    `);

    console.log('\n📊 New tables:');
    const expectedTables = ['billing_history', 'credits', 'qr_code_scans', 'print_orders'];
    expectedTables.forEach(tableName => {
      const exists = tables.some(t => t.table_name === tableName);
      console.log(`  ${exists ? '✅' : '❌'} ${tableName}`);
    });

    // Check migrations
    const [migrations] = await sequelize.query(`
      SELECT name FROM "SequelizeMeta" 
      WHERE name LIKE '%stripe%' 
      OR name LIKE '%subscription%' 
      OR name LIKE '%billing%' 
      OR name LIKE '%credit%'
      ORDER BY name;
    `);

    console.log('\n📊 Related migrations run:');
    if (migrations.length > 0) {
      migrations.forEach(m => {
        console.log(`  ✅ ${m.name}`);
      });
    } else {
      console.log('  ❌ No related migrations found');
    }

  } catch (error) {
    console.error('Error checking database:', error.message);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  checkDatabaseState();
}

module.exports = checkDatabaseState;
