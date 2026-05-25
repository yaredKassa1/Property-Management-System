/**
 * Check Approval Authorities in Database
 * Diagnostic script to see why dropdown is empty
 */

require('dotenv').config();
const { sequelize } = require('./src/config/database');
const db = require('./src/models');
const { Op } = require('sequelize');

async function checkApprovalAuthorities() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Step 1: Check all approval authorities
    console.log('═══════════════════════════════════════════════════════════');
    console.log('STEP 1: Checking ALL Approval Authorities in Database');
    console.log('═══════════════════════════════════════════════════════════\n');

    const allAuthorities = await db.User.findAll({
      where: {
        role: {
          [Op.in]: ['approval_authority', 'vice_president']
        }
      },
      attributes: ['id', 'username', 'firstName', 'lastName', 'role', 'isActive', 'wing', 'college', 'school', 'department', 'administrativeUnit', 'workUnit'],
      order: [['isActive', 'DESC'], ['firstName', 'ASC']]
    });

    if (allAuthorities.length === 0) {
      console.log('❌ NO APPROVAL AUTHORITIES FOUND!');
      console.log('   This is the problem - you need to create users with role:');
      console.log('   - approval_authority');
      console.log('   - vice_president\n');
      console.log('📝 Solution: Run the create-approval-authority.js script');
      console.log('   or create users manually through the admin panel.\n');
    } else {
      console.log(`✅ Found ${allAuthorities.length} approval authority/VP user(s):\n`);
      
      allAuthorities.forEach((auth, index) => {
        console.log(`${index + 1}. ${auth.firstName} ${auth.lastName} (@${auth.username})`);
        console.log(`   Role: ${auth.role}`);
        console.log(`   Active: ${auth.isActive ? '✅ YES' : '❌ NO'}`);
        console.log(`   Wing: ${auth.wing || 'Not set'}`);
        
        if (auth.wing === 'academic') {
          console.log(`   College: ${auth.college || 'Not set'}`);
          console.log(`   School: ${auth.school || 'Not set'}`);
          console.log(`   Department: ${auth.department || 'Not set'}`);
        } else if (auth.wing === 'administrative') {
          console.log(`   Admin Unit: ${auth.administrativeUnit || 'Not set'}`);
        }
        console.log(`   Work Unit: ${auth.workUnit || 'Not set'}`);
        console.log('');
      });

      // Check active vs inactive
      const activeCount = allAuthorities.filter(a => a.isActive).length;
      const inactiveCount = allAuthorities.length - activeCount;
      
      console.log(`📊 Summary:`);
      console.log(`   Active: ${activeCount}`);
      console.log(`   Inactive: ${inactiveCount}\n`);

      if (activeCount === 0) {
        console.log('⚠️  WARNING: All approval authorities are INACTIVE!');
        console.log('   The dropdown will be empty because only active users are shown.\n');
      }
    }

    // Step 2: Check the test staff member
    console.log('═══════════════════════════════════════════════════════════');
    console.log('STEP 2: Checking Test Staff Member (selemonbeke6@gmail.com)');
    console.log('═══════════════════════════════════════════════════════════\n');

    const staff = await db.User.findOne({
      where: { email: 'selemonbeke6@gmail.com' },
      attributes: ['id', 'username', 'firstName', 'lastName', 'role', 'wing', 'college', 'school', 'department', 'administrativeUnit', 'workUnit']
    });

    if (!staff) {
      console.log('❌ Staff member not found!\n');
    } else {
      console.log(`✅ Staff Member: ${staff.firstName} ${staff.lastName} (@${staff.username})`);
      console.log(`   Role: ${staff.role}`);
      console.log(`   Wing: ${staff.wing || '❌ NOT SET'}`);
      
      if (staff.wing === 'academic') {
        console.log(`   College: ${staff.college || '❌ NOT SET'}`);
        console.log(`   School: ${staff.school || '❌ NOT SET'}`);
        console.log(`   Department: ${staff.department || '❌ NOT SET'}`);
      } else if (staff.wing === 'administrative') {
        console.log(`   Admin Unit: ${staff.administrativeUnit || '❌ NOT SET'}`);
      }
      console.log(`   Work Unit: ${staff.workUnit || 'Not set'}\n`);

      // Step 3: Check matching approval authorities
      if (allAuthorities.length > 0 && staff.wing) {
        console.log('═══════════════════════════════════════════════════════════');
        console.log('STEP 3: Checking Matching Approval Authorities');
        console.log('═══════════════════════════════════════════════════════════\n');

        let matchingAuthorities;

        if (staff.wing === 'academic') {
          console.log('🔍 Searching for approval authorities with matching hierarchy:');
          console.log(`   College: ${staff.college}`);
          console.log(`   School: ${staff.school}`);
          console.log(`   Department: ${staff.department}\n`);

          matchingAuthorities = await db.User.findAll({
            where: {
              role: {
                [Op.in]: ['approval_authority', 'vice_president']
              },
              isActive: true,
              college: staff.college,
              school: staff.school,
              department: staff.department
            },
            attributes: ['id', 'username', 'firstName', 'lastName', 'role', 'college', 'school', 'department']
          });
        } else if (staff.wing === 'administrative') {
          console.log('🔍 Searching for approval authorities with matching hierarchy:');
          console.log(`   Admin Unit: ${staff.administrativeUnit}\n`);

          matchingAuthorities = await db.User.findAll({
            where: {
              role: {
                [Op.in]: ['approval_authority', 'vice_president']
              },
              isActive: true,
              administrativeUnit: staff.administrativeUnit
            },
            attributes: ['id', 'username', 'firstName', 'lastName', 'role', 'administrativeUnit']
          });
        }

        if (matchingAuthorities && matchingAuthorities.length > 0) {
          console.log(`✅ Found ${matchingAuthorities.length} matching approval authority/authorities:\n`);
          
          matchingAuthorities.forEach((auth, index) => {
            console.log(`${index + 1}. ${auth.firstName} ${auth.lastName} (@${auth.username})`);
            console.log(`   Role: ${auth.role}`);
            if (staff.wing === 'academic') {
              console.log(`   College: ${auth.college}`);
              console.log(`   School: ${auth.school}`);
              console.log(`   Department: ${auth.department}`);
            } else {
              console.log(`   Admin Unit: ${auth.administrativeUnit}`);
            }
            console.log('');
          });

          console.log('🎉 DROPDOWN SHOULD WORK!');
          console.log('   These users should appear in the dropdown.\n');
        } else {
          console.log('❌ NO MATCHING APPROVAL AUTHORITIES FOUND!');
          console.log('\n📝 This is the problem! The filtered endpoint returns empty because:');
          console.log('   - Staff member\'s hierarchy doesn\'t match any approval authority\n');
          console.log('💡 Solutions:');
          console.log('   1. Create approval authority with matching hierarchy');
          console.log('   2. Update existing approval authority to match staff hierarchy');
          console.log('   3. Update staff member\'s hierarchy to match existing approval authority');
          console.log('   4. Use the fallback endpoint (all authorities) instead of filtered\n');
        }
      }
    }

    // Step 4: Recommendations
    console.log('═══════════════════════════════════════════════════════════');
    console.log('RECOMMENDATIONS');
    console.log('═══════════════════════════════════════════════════════════\n');

    if (allAuthorities.length === 0) {
      console.log('🔧 ACTION REQUIRED: Create approval authority users');
      console.log('   Run: node create-approval-authority.js\n');
    } else if (allAuthorities.filter(a => a.isActive).length === 0) {
      console.log('🔧 ACTION REQUIRED: Activate approval authority users');
      console.log('   Update users table: SET isActive = true\n');
    } else if (staff && !staff.wing) {
      console.log('🔧 ACTION REQUIRED: Set staff member\'s wing');
      console.log('   Update staff member with wing, college/school/department or administrativeUnit\n');
    } else {
      console.log('✅ Everything looks good!');
      console.log('   If dropdown is still empty, check:');
      console.log('   1. Browser console for errors');
      console.log('   2. Network tab for API response');
      console.log('   3. Backend server logs\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkApprovalAuthorities();
