const db = require('./src/models');

async function verifyUserHierarchy() {
  try {
    console.log('=== User Hierarchy Verification ===\n');

    // Get all users
    const allUsers = await db.User.findAll({
      attributes: ['id', 'username', 'firstName', 'lastName', 'role', 'wing', 'college', 'school', 'department', 'administrativeUnit', 'workUnit', 'isActive'],
      order: [['role', 'ASC'], ['username', 'ASC']]
    });

    console.log(`Total Users: ${allUsers.length}\n`);

    // Categorize users
    const approvalAuthorities = allUsers.filter(u => u.role === 'approval_authority');
    const staff = allUsers.filter(u => u.role === 'staff');
    const others = allUsers.filter(u => !['approval_authority', 'staff'].includes(u.role));

    console.log('=== APPROVAL AUTHORITIES ===');
    console.log(`Total: ${approvalAuthorities.length}\n`);

    let aaIssues = [];
    approvalAuthorities.forEach(user => {
      const issues = [];
      
      if (!user.wing) {
        issues.push('Missing wing');
      } else if (user.wing === 'academic') {
        if (!user.college) issues.push('Missing college');
        if (!user.department) issues.push('Missing department');
      } else if (user.wing === 'administrative') {
        if (!user.administrativeUnit) issues.push('Missing administrative unit');
      }

      if (issues.length > 0) {
        aaIssues.push({ user, issues });
      }

      const status = issues.length > 0 ? '❌' : '✅';
      console.log(`${status} ${user.username} (${user.firstName} ${user.lastName})`);
      console.log(`   Wing: ${user.wing || 'NOT SET'}`);
      if (user.wing === 'academic') {
        console.log(`   College: ${user.college || 'NOT SET'}`);
        console.log(`   School: ${user.school || 'N/A'}`);
        console.log(`   Department: ${user.department || 'NOT SET'}`);
      } else if (user.wing === 'administrative') {
        console.log(`   Administrative Unit: ${user.administrativeUnit || 'NOT SET'}`);
      }
      if (issues.length > 0) {
        console.log(`   ⚠️  ISSUES: ${issues.join(', ')}`);
      }
      console.log('');
    });

    console.log('\n=== STAFF MEMBERS ===');
    console.log(`Total: ${staff.length}\n`);

    let staffIssues = [];
    staff.forEach(user => {
      const issues = [];
      
      if (!user.wing) {
        issues.push('Missing wing');
      } else if (user.wing === 'academic') {
        if (!user.college) issues.push('Missing college');
        if (!user.department) issues.push('Missing department');
      } else if (user.wing === 'administrative') {
        if (!user.administrativeUnit) issues.push('Missing administrative unit');
      }

      if (issues.length > 0) {
        staffIssues.push({ user, issues });
      }

      const status = issues.length > 0 ? '❌' : '✅';
      console.log(`${status} ${user.username} (${user.firstName} ${user.lastName})`);
      console.log(`   Wing: ${user.wing || 'NOT SET'}`);
      if (user.wing === 'academic') {
        console.log(`   College: ${user.college || 'NOT SET'}`);
        console.log(`   School: ${user.school || 'N/A'}`);
        console.log(`   Department: ${user.department || 'NOT SET'}`);
      } else if (user.wing === 'administrative') {
        console.log(`   Administrative Unit: ${user.administrativeUnit || 'NOT SET'}`);
      }
      if (issues.length > 0) {
        console.log(`   ⚠️  ISSUES: ${issues.join(', ')}`);
      }
      console.log('');
    });

    console.log('\n=== OTHER ROLES ===');
    console.log(`Total: ${others.length}\n`);
    others.forEach(user => {
      console.log(`ℹ️  ${user.username} (${user.firstName} ${user.lastName}) - ${user.role}`);
      console.log(`   Wing: ${user.wing || 'NOT SET'}`);
      if (user.wing === 'academic') {
        console.log(`   College: ${user.college || 'N/A'}`);
        console.log(`   Department: ${user.department || 'N/A'}`);
      } else if (user.wing === 'administrative') {
        console.log(`   Administrative Unit: ${user.administrativeUnit || 'N/A'}`);
      }
      console.log('');
    });

    // Summary
    console.log('\n=== SUMMARY ===');
    console.log(`Total Approval Authorities: ${approvalAuthorities.length}`);
    console.log(`  ✅ Complete Hierarchy: ${approvalAuthorities.length - aaIssues.length}`);
    console.log(`  ❌ Incomplete Hierarchy: ${aaIssues.length}`);
    console.log('');
    console.log(`Total Staff: ${staff.length}`);
    console.log(`  ✅ Complete Hierarchy: ${staff.length - staffIssues.length}`);
    console.log(`  ❌ Incomplete Hierarchy: ${staffIssues.length}`);
    console.log('');

    if (aaIssues.length > 0 || staffIssues.length > 0) {
      console.log('\n⚠️  ACTION REQUIRED:');
      console.log('Some users have incomplete hierarchy data.');
      console.log('Please update these users through the User Management page.');
      console.log('\nUsers with issues:');
      
      if (aaIssues.length > 0) {
        console.log('\nApproval Authorities:');
        aaIssues.forEach(({ user, issues }) => {
          console.log(`  - ${user.username}: ${issues.join(', ')}`);
        });
      }
      
      if (staffIssues.length > 0) {
        console.log('\nStaff:');
        staffIssues.forEach(({ user, issues }) => {
          console.log(`  - ${user.username}: ${issues.join(', ')}`);
        });
      }
    } else {
      console.log('✅ All approval authorities and staff have complete hierarchy data!');
    }

    console.log('\n=== Verification Complete ===');
    process.exit(0);
  } catch (error) {
    console.error('Error verifying user hierarchy:', error);
    process.exit(1);
  }
}

verifyUserHierarchy();
