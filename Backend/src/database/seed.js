const db = require('../models');
const { testConnection } = require('../config/database');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Seeding failed: Could not connect to database');
      process.exit(1);
    }

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await db.Asset.destroy({ where: {}, force: true });
    await db.User.destroy({ where: {}, force: true });

    // Create users
    console.log('👥 Creating users...');
    
    const users = await db.User.bulkCreate([
      {
        username: 'admin',
        email: 'admin@woldia.edu.et',
        password: 'admin123', // Will be hashed by model hook
        firstName: 'System',
        lastName: 'Administrator',
        phoneNumber: '+251911123456',
        role: 'administrator',
        workUnit: 'IT Department',
        isActive: true
      },
      {
        username: 'vp',
        email: 'vp@woldia.edu.et',
        password: 'vp123',
        firstName: 'Vice',
        lastName: 'President',
        phoneNumber: '+251911234567',
        role: 'vice_president',
        workUnit: 'Administration',
        isActive: true
      },
      {
        username: 'property',
        email: 'property@woldia.edu.et',
        password: 'property123',
        firstName: 'Property',
        lastName: 'Officer',
        role: 'property_officer',
        workUnit: 'Property Management',
        isActive: true
      },
      {
        username: 'approval',
        email: 'approval@woldia.edu.et',
        password: 'approval123',
        firstName: 'Approval',
        lastName: 'Authority',
        phoneNumber: '+251911345678',
        role: 'approval_authority',
        workUnit: 'Administration',
        isActive: true
      },
      {
        username: 'purchase',
        email: 'purchase@woldia.edu.et',
        password: 'purchase123',
        firstName: 'Purchase',
        lastName: 'Staff',
        phoneNumber: '+251911456789',
        role: 'purchase_department',
        workUnit: 'Purchase Department',
        isActive: true
      },
      {
        username: 'qa',
        email: 'qa@woldia.edu.et',
        password: 'qa123',
        firstName: 'Quality',
        lastName: 'Officer',
        phoneNumber: '+251911567890',
        role: 'quality_assurance',
        workUnit: 'Quality Assurance',
        isActive: true
      },
      {
        username: 'staff1',
        email: 'staff1@woldia.edu.et',
        password: 'staff123',
        firstName: 'Ahmed',
        lastName: 'Ali',
        phoneNumber: '+251911678901',
        role: 'staff',
        workUnit: 'Computer Science',
        isActive: true
      },
      {
        username: 'staff2',
        email: 'staff2@woldia.edu.et',
        password: 'staff123',
        firstName: 'Sara',
        lastName: 'Mohammed',
        role: 'staff',
        workUnit: 'Engineering',
        isActive: true
      }
    ], {
      individualHooks: true // Ensure password hashing hook runs for each user
    });

    console.log(`✅ Created ${users.length} users`);

    // Create assets
    console.log('📦 Creating assets...');
    
    const propertyOfficer = users.find(u => u.role === 'property_officer');
    const staff1 = users.find(u => u.username === 'staff1');
    const staff2 = users.find(u => u.username === 'staff2');

    const assets = await db.Asset.bulkCreate([
      {
        assetId: 'WU-LAP-001',
        name: 'Dell Latitude 5420 Laptop',
        category: 'fixed',
        serialNumber: 'DL5420-2024-001',
        value: 45000.00,
        purchaseDate: '2024-01-15',
        location: 'Computer Science Department',
        workUnit: 'Computer Science',
        status: 'assigned',
        condition: 'excellent',
        assignedTo: staff1.id,
        description: 'High-performance laptop for faculty use',
        warrantyExpiry: '2027-01-15',
        createdBy: propertyOfficer.id
      },
      {
        assetId: 'WU-PRJ-001',
        name: 'Epson EB-X41 Projector',
        category: 'fixed',
        serialNumber: 'EP-EBX41-001',
        value: 28000.00,
        purchaseDate: '2024-02-20',
        location: 'Equipment Store',
        workUnit: 'General',
        status: 'available',
        condition: 'excellent',
        description: 'Classroom projector for teaching',
        warrantyExpiry: '2027-02-20',
        createdBy: propertyOfficer.id
      },
      {
        assetId: 'WU-CHR-045',
        name: 'Ergonomic Office Chair',
        category: 'fixed',
        serialNumber: 'OC-2024-045',
        value: 3500.00,
        purchaseDate: '2023-11-10',
        location: 'Administration Building',
        workUnit: 'Administration',
        status: 'assigned',
        condition: 'good',
        assignedTo: staff2.id,
        description: 'Adjustable ergonomic office chair',
        createdBy: propertyOfficer.id
      },
      {
        assetId: 'WU-DSK-012',
        name: 'HP Desktop Computer',
        category: 'fixed',
        serialNumber: 'HP-DSK-2023-012',
        value: 35000.00,
        purchaseDate: '2023-08-05',
        location: 'IT Department',
        workUnit: 'IT Department',
        status: 'under_maintenance',
        condition: 'fair',
        description: 'Desktop computer for staff - currently under repair',
        warrantyExpiry: '2026-08-05',
        createdBy: propertyOfficer.id
      },
      {
        assetId: 'WU-TBL-089',
        name: 'Conference Table',
        category: 'fixed',
        serialNumber: 'CT-2023-089',
        value: 15000.00,
        purchaseDate: '2023-06-12',
        location: 'Meeting Room 2',
        workUnit: 'Administration',
        status: 'available',
        condition: 'excellent',
        description: 'Large conference table for meetings',
        createdBy: propertyOfficer.id
      },
      {
        assetId: 'WU-PRT-023',
        name: 'Canon ImageCLASS Printer',
        category: 'fixed',
        serialNumber: 'CN-IC-2024-023',
        value: 12000.00,
        purchaseDate: '2024-03-10',
        location: 'Engineering Department',
        workUnit: 'Engineering',
        status: 'available',
        condition: 'excellent',
        description: 'Multifunction laser printer',
        warrantyExpiry: '2027-03-10',
        createdBy: propertyOfficer.id
      },
      {
        assetId: 'WU-TAB-067',
        name: 'Samsung Galaxy Tab S8',
        category: 'fixed',
        serialNumber: 'SGT-S8-2024-067',
        value: 18000.00,
        purchaseDate: '2024-01-25',
        location: 'Equipment Store',
        workUnit: 'General',
        status: 'available',
        condition: 'excellent',
        description: 'Tablet for mobile presentations',
        warrantyExpiry: '2026-01-25',
        createdBy: propertyOfficer.id
      },
      {
        assetId: 'WU-WHB-101',
        name: 'Interactive Whiteboard',
        category: 'fixed',
        serialNumber: 'IWB-2023-101',
        value: 55000.00,
        purchaseDate: '2023-09-15',
        location: 'Lecture Hall A',
        workUnit: 'General',
        status: 'available',
        condition: 'good',
        description: 'Interactive whiteboard for modern teaching',
        warrantyExpiry: '2026-09-15',
        createdBy: propertyOfficer.id
      }
    ]);

    console.log(`✅ Created ${assets.length} assets`);

    console.log('\n📊 Seeding Summary:');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Users created: ${users.length}`);
    console.log(`✅ Assets created: ${assets.length}`);
    console.log('\n👤 Default User Credentials:');
    console.log('═══════════════════════════════════════');
    console.log('Administrator:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('  Role: administrator');
    console.log('');
    console.log('Vice President:');
    console.log('  Username: vp');
    console.log('  Password: vp123');
    console.log('  Role: vice_president');
    console.log('');
    console.log('Property Officer:');
    console.log('  Username: property');
    console.log('  Password: property123');
    console.log('  Role: property_officer');
    console.log('');
    console.log('Staff Member:');
    console.log('  Username: staff1');
    console.log('  Password: staff123');
    console.log('  Role: staff');
    console.log('');
    console.log('⚠️  IMPORTANT: Change these passwords in production!');
    console.log('═══════════════════════════════════════');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

// Run seeding
seedData();
