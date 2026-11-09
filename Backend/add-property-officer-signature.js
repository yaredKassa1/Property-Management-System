const { sequelize } = require('./src/config/database');

async function addPropertyOfficerSignature() {
  try {
    console.log('Adding propertyOfficerSignature column to procurement_workflows table...');

    await sequelize.query(`
      ALTER TABLE procurement_workflows 
      ADD COLUMN IF NOT EXISTS "propertyOfficerSignature" TEXT;
    `);

    console.log('✓ Column added successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addPropertyOfficerSignature();
