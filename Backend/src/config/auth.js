require('dotenv').config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  bcryptSaltRounds: 10,
  
  // Role hierarchy for access control
  roles: {
    administrator: {
      level: 7,
      permissions: [
        'manage_users',           // Create, update, delete users
        'manage_roles',           // Assign and change user roles
        'manage_permissions',     // Configure permissions
        'view_all_data',         // View all system data
        'view_reports',          // Access all reports
        'view_logs',             // Access system logs
        'system_configuration'   // Configure system settings
      ],
      description: 'System-level management and security - NOT day-to-day operations'
    },
    vice_president: {
      level: 6,
      permissions: [
        'approve_transfers',     // Approve asset transfers
        'approve_requests',      // Approve purchase/withdrawal requests
        'view_reports',          // Access reports
        'view_all_assets'        // View all assets
      ],
      description: 'High-level approvals and oversight'
    },
    property_officer: {
      level: 5,
      permissions: [
        'manage_assets',         // Register, update, delete assets
        'manage_assignments',    // Assign assets to users
        'manage_transfers',      // Process and complete transfers
        'receive_returns',       // Receive returned assets
        'approve_returns',       // Approve asset returns
        'complete_requests',     // Complete approved requests
        'view_reports'           // Access reports
      ],
      description: 'Day-to-day asset management and operations'
    },
    approval_authority: {
      level: 4,
      permissions: [
        'approve_requests',      // Approve/reject requests
        'view_assets',           // View asset information
        'view_reports'           // Access reports
      ],
      description: 'Request approval and authorization'
    },
    purchase_department: {
      level: 3,
      permissions: [
        'manage_purchases',      // Handle purchase requests
        'complete_requests',     // Complete purchase requests
        'view_assets',           // View assets
        'create_requests'        // Create purchase requests
      ],
      description: 'Purchase and procurement management'
    },
    quality_assurance: {
      level: 3,
      permissions: [
        'inspect_returns',       // Inspect returned assets
        'assess_condition',      // Assess asset condition
        'view_assets'            // View assets
      ],
      description: 'Quality inspection and assessment'
    },
    staff: {
      level: 1,
      permissions: [
        'view_assets',           // View available assets
        'create_requests',       // Submit requests
        'create_returns',        // Submit return requests
        'create_transfers',      // Request transfers
        'view_own_data'          // View own requests/returns
      ],
      description: 'Basic user - request and return assets'
    }
  },

  // Helper function to check if role has permission
  hasPermission: (role, permission) => {
    const roleConfig = module.exports.roles[role];
    if (!roleConfig) return false;
    if (roleConfig.permissions.includes('all')) return true;
    return roleConfig.permissions.includes(permission);
  },

  // Helper function to check if user role level is sufficient
  hasRoleLevel: (role, minimumLevel) => {
    const roleConfig = module.exports.roles[role];
    if (!roleConfig) return false;
    return roleConfig.level >= minimumLevel;
  }
};
