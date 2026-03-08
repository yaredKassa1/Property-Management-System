const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { Sequelize } = require('sequelize');

// Ensure password is a string
const dbPassword = process.env.DB_PASSWORD ? process.env.DB_PASSWORD.toString() : '';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'wdupms_db',
  username: process.env.DB_USER || 'postgres',
  password: dbPassword,
  logging: false
});

async function migrateTransferSignatures() {
  try {
    console.log('🚀 Adding digital signature fields to transfers table...\n');

    const queryInterface = sequelize.getQueryInterface();
    const { DataTypes } = require('sequelize');

    // Check if columns already exist
    const tableDescription = await queryInterface.describeTable('transfers');

    // Add transferorSignature column
    if (!tableDescription.transferorSignature) {
      console.log('📝 Adding transferorSignature column...');
      await queryInterface.addColumn('transfers', 'transferorSignature', {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Digital signature of the staff transferring the asset (fromUser)'
      });
      console.log('✅ transferorSignature column added\n');
    } else {
      console.log('⏭️  transferorSignature column already exists\n');
    }

    // Add recipientSignature column
    if (!tableDescription.recipientSignature) {
      console.log('📝 Adding recipientSignature column...');
      await queryInterface.addColumn('transfers', 'recipientSignature', {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Digital signature of the staff receiving the asset (toUser)'
      });
      console.log('✅ recipientSignature column added\n');
    } else {
      console.log('⏭️  recipientSignature column already exists\n');
    }

    // Add propertyOfficerSignature column
    if (!tableDescription.propertyOfficerSignature) {
      console.log('📝 Adding propertyOfficerSignature column...');
      await queryInterface.addColumn('transfers', 'propertyOfficerSignature', {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Digital signature of property officer who completed the transfer'
      });
      console.log('✅ propertyOfficerSignature column added\n');
    } else {
      console.log('⏭️  propertyOfficerSignature column already exists\n');
    }

    // Add completedBy column
    if (!tableDescription.completedBy) {
      console.log('📝 Adding completedBy column...');
      await queryInterface.addColumn('transfers', 'completedBy', {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Property officer who completed the transfer'
      });
      console.log('✅ completedBy column added\n');
    } else {
      console.log('⏭️  completedBy column already exists\n');
    }

    console.log('✨ Migration completed successfully!\n');
    console.log('Summary:');
    console.log('- Added transferorSignature field');
    console.log('- Added recipientSignature field');
    console.log('- Added propertyOfficerSignature field');
    console.log('- Added completedBy field (references users table)');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

migrateTransferSignatures()
  .then(() => {
    console.log('\n✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });
