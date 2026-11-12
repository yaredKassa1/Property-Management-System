const db = require('./src/models');

async function testDashboardStats() {
  try {
    console.log('=== Testing Dashboard Stats ===\n');

    // Test User Stats
    console.log('1. USER STATS:');
    const totalUsers = await db.User.count();
    const activeUsers = await db.User.count({ where: { isActive: true } });
    const inactiveUsers = await db.User.count({ where: { isActive: false } });
    
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Active Users: ${activeUsers}`);
    console.log(`   Inactive Users: ${inactiveUsers}`);

    // Get role breakdown
    const roleStats = await db.User.findAll({
      attributes: [
        'role',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['role']
    });
    console.log('   Role Breakdown:', JSON.stringify(roleStats, null, 2));

    // Test Audit Log Stats
    console.log('\n2. AUDIT LOG STATS:');
    const totalLogs = await db.AuditLog.count();
    const failedLogins = await db.AuditLog.count({
      where: { action: 'LOGIN_FAILURE' }
    });
    const successfulActions = await db.AuditLog.count({ 
      where: { status: 'success' } 
    });
    const failedActions = await db.AuditLog.count({ 
      where: { status: 'failure' } 
    });

    console.log(`   Total Logs: ${totalLogs}`);
    console.log(`   Failed Logins: ${failedLogins}`);
    console.log(`   Successful Actions: ${successfulActions}`);
    console.log(`   Failed Actions: ${failedActions}`);

    // Get top actions
    const actionStats = await db.AuditLog.findAll({
      attributes: [
        'action',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['action'],
      order: [[db.sequelize.literal('count'), 'DESC']],
      limit: 5
    });
    console.log('   Top Actions:', JSON.stringify(actionStats, null, 2));

    console.log('\n=== Test Complete ===');
    process.exit(0);
  } catch (error) {
    console.error('Error testing dashboard stats:', error);
    process.exit(1);
  }
}

testDashboardStats();
