/**
 * Migration: Add Password Reset Fields to Users Table
 * Adds resetCode, resetCodeExpiry, and resetCodeAttempts columns
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'wdupms_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || null,
  logging: console.log
});

async function addPasswordResetFields() {
  try {
    console.log('🔄 Starting migration: Add password reset fields...');

    // Check if columns already exist
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('resetCode', 'resetCodeExpiry', 'resetCodeAttempts');
    `);

    if (results.length > 0) {
      console.log('⚠️  Password reset fields already exist. Skipping migration.');
      return;
    }

    // Add resetCode column
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN "resetCode" VARCHAR(6) NULL;
    `);
    console.log('✅ Added resetCode column');

    // Add resetCodeExpiry column
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN "resetCodeExpiry" TIMESTAMP NULL;
    `);
    console.log('✅ Added resetCodeExpiry column');

    // Add resetCodeAttempts column
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN "resetCodeAttempts" INTEGER DEFAULT 0 NOT NULL;
    `);
    console.log('✅ Added resetCodeAttempts column');

    // Add comments
    await sequelize.query(`
      COMMENT ON COLUMN users."resetCode" IS 'Password reset verification code (6 digits)';
    `);
    await sequelize.query(`
      COMMENT ON COLUMN users."resetCodeExpiry" IS 'Expiry time for reset code (10 minutes from generation)';
    `);
    await sequelize.query(`
      COMMENT ON COLUMN users."resetCodeAttempts" IS 'Number of failed reset code attempts (max 5)';
    `);
    console.log('✅ Added column comments');

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run migration
if (require.main === module) {
  addPasswordResetFields()
    .then(() => {
      console.log('✅ All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration error:', error);
      process.exit(1);
    });
}

module.exports = addPasswordResetFields;
