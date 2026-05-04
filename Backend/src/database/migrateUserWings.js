const { sequelize } = require('../config/database');
const { Sequelize } = require('sequelize');

const migrateUserWings = async () => {
  try {
    console.log('Starting user wings migration...');

    // Test connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    const queryInterface = sequelize.getQueryInterface();

    // Check if columns already exist
    console.log('Checking users table structure...');
    const tableDescription = await queryInterface.describeTable('users');
    console.log('✓ Users table found');

    const columnsToAdd = [
      {
        name: 'wing',
        exists: tableDescription.wing,
        definition: {
          type: Sequelize.ENUM('academic', 'administrative'),
          allowNull: false,
          defaultValue: 'academic'
        }
      },
      {
        name: 'college',
        exists: tableDescription.college,
        definition: {
          type: Sequelize.STRING(100),
          allowNull: true
        }
      },
      {
        name: 'school',
        exists: tableDescription.school,
        definition: {
          type: Sequelize.STRING(100),
          allowNull: true
        }
      },
      {
        name: 'department',
        exists: tableDescription.department,
        definition: {
          type: Sequelize.STRING(100),
          allowNull: true
        }
      },
      {
        name: 'administrativeUnit',
        exists: tableDescription.administrativeUnit,
        definition: {
          type: Sequelize.STRING(100),
          allowNull: true
        }
      }
    ];

    let addedCount = 0;
    for (const column of columnsToAdd) {
      if (!column.exists) {
        await queryInterface.addColumn('users', column.name, column.definition);
        console.log(`✓ Added ${column.name} column`);
        addedCount++;
      } else {
        console.log(`ℹ ${column.name} column already exists`);
      }
    }

    if (addedCount > 0) {
      console.log(`✅ Migration completed! Added ${addedCount} new column(s)\n`);
    } else {
      console.log('✅ Migration completed! All columns already exist\n');
    }

    return true;
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    if (error.detail) {
      console.error('Details:', error.detail);
    }
    
    // Only exit if running as standalone script
    if (require.main === module) {
      console.error('\nTroubleshooting:');
      console.error('1. Make sure PostgreSQL is running');
      console.error('2. Check your .env file for correct DB credentials');
      console.error('3. Verify the database exists');
      console.error('4. Check that the users table exists');
      process.exit(1);
    }
    
    return false;
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  migrateUserWings().then(() => {
    process.exit(0);
  });
}

module.exports = migrateUserWings;
