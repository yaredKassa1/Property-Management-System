'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// ─── Theme Context ────────────────────────────────────────────────────────────
type Theme = 'light' | 'dark';
interface ThemeContextType { theme: Theme; toggleTheme: () => void; }
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('user-theme-preference') as Theme | null;
    if (saved) { setTheme(saved); applyTheme(saved); }
  }, []);

  const applyTheme = (t: Theme) => {
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('user-theme-preference', next);
    applyTheme(next);
  };

  if (!mounted) return <>{children}</>;
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Return safe defaults during SSR or when used outside provider
    return { theme: 'light' as Theme, toggleTheme: () => {} };
  }
  return ctx;
}

// ─── Translations ─────────────────────────────────────────────────────────────
const translations: Record<string, Record<string, string>> = {
  en: {
    // Navigation
    dashboard: 'Dashboard', assets: 'Assets', assignments: 'Assignments',
    transfers: 'Transfers', transfer_dashboard: 'Transfer Dashboard',
    returns: 'Returns', requests: 'Requests', reports: 'Reports',
    user_management: 'User Management', audit_logs: 'Audit Logs',
    profile: 'Profile', logout: 'Logout',
    // Login
    welcome_back_login: 'Welcome Back', sign_in_to_access: 'Sign in to access your account',
    language_preference: 'Language Preference',
    // General
    loading: 'Loading', error: 'Error', save_changes: 'Save Changes', saving: 'Saving',
    cancel: 'Cancel', close: 'Close', view: 'View', edit: 'Edit', delete: 'Delete',
    search: 'Search', filter: 'Filter', export: 'Export', print: 'Print',
    approve: 'Approve', reject: 'Reject', complete: 'Complete', review: 'Review',
    assign: 'Assign', unassign: 'Unassign', submit: 'Submit', create: 'Create',
    no_data_available: 'No data available', view_details: 'View Details',
    // Dashboard
    asset_inventory_overview: 'Asset Inventory Overview',
    total_assets: 'Total Assets', available: 'Available', assigned: 'Assigned',
    maintenance: 'Maintenance', damaged: 'Damaged', disposed: 'Disposed',
    transfer_management: 'Transfer Management', return_management: 'Return Management',
    pending_transfers: 'Pending Transfers', approved_transfers: 'Approved Transfers',
    completed_today: 'Completed Today', successfully_processed: 'Successfully processed',
    awaiting_vp_approval: 'Awaiting VP approval', ready_to_complete: 'Ready to complete',
    manage_transfers: 'Manage Transfers', manage_returns: 'Manage Returns',
    pending_returns: 'Pending Returns', need_to_receive: 'Need to receive',
    under_inspection: 'Under Inspection', quality_check_required: 'Quality check required',
    priority_actions: 'Priority Actions',
    transfers_to_complete: 'Transfers to Complete', returns_to_receive: 'Returns to Receive',
    returns_to_inspect: 'Returns to Inspect', assets_to_maintain: 'Assets to Maintain',
    asset_condition_breakdown: 'Asset Condition Breakdown',
    asset_category_breakdown: 'Asset Category Breakdown',
    quick_actions: 'Quick Actions',
    register_new_asset: 'Register New Asset', add_asset_to_inventory: 'Add asset to inventory',
    fixed_assets: 'Fixed', fixed_consumable: 'Fixed-Consumable',
    // Assets page
    manage_university_assets: 'Manage university property assets',
    register_new_asset_btn: '+ Register New Asset',
    search_assets: 'Search by asset ID, name, or serial number...',
    asset_id: 'Asset ID', name: 'Name', category: 'Category', status: 'Status',
    location: 'Location', value: 'Value', purchase_date: 'Purchase Date', actions: 'Actions',
    no_assets_found: 'No assets found matching your search',
    no_assets_registered: 'No assets registered yet',
    // Assignments page
    asset_assignments: 'Asset Assignments',
    assign_manage_allocations: 'Assign and manage asset allocations to staff members',
    total_assets_count: 'Total Assets', assigned_assets: 'Assigned Assets',
    available_assets: 'Available Assets',
    search_asset_placeholder: 'Search by Asset ID or Name...',
    all_status: 'All Status', all_work_units: 'All Work Units', clear_filters: 'Clear Filters',
    asset_assignment_list: 'Asset Assignment List', asset_info: 'Asset Info',
    loading_assets: 'Loading assets...', no_assets_found_filter: 'No assets found',
    unassigned: 'Unassigned', no_work_unit: 'No work unit',
    assign_asset: 'Assign Asset', assign_asset_to_staff: 'Assign asset to a staff member',
    asset_details: 'Asset Details', select_staff_member: 'Select Staff Member',
    select_staff_placeholder: '-- Select a staff member --',
    no_users_available: 'No users available - Contact administrator',
    assignment_notes: 'Assignment Notes (Optional)',
    assignment_notes_placeholder: 'Enter any notes about this assignment...',
    assigning: 'Assigning...', assign_asset_btn: 'Assign Asset',
    unassign_asset: 'Unassign Asset', unassign_confirm: 'Are you sure you want to unassign this asset?',
    currently_assigned_to: 'Currently assigned to:', unassigning: 'Unassigning...',
    // Transfers page
    asset_transfers: 'Asset Transfers', manage_transfer_requests: 'Manage asset transfer requests',
    new_transfer: 'New Transfer', asset: 'Asset', from: 'From', to: 'To',
    request_date: 'Request Date', no_transfers_found: 'No transfer requests found',
    // Requests page
    manage_requests: 'Manage withdrawal, purchase, and other requests',
    create_request: 'Create Request', type: 'Type', item: 'Item',
    requested_by: 'Requested By', purpose: 'Purpose', priority: 'Priority',
    date: 'Date', no_requests_found: 'No requests found. Click "Create Request" to submit a new request.',
    loading_requests: 'Loading requests...',
    // Returns page
    asset_management: 'ASSET MANAGEMENT', asset_returns: 'Asset Returns',
    manage_return_requests: 'Manage asset return requests and approvals',
    process_return: '+ Process Return', total_returns: 'Total Returns',
    pending: 'Pending', completed: 'Completed', rejected: 'Rejected',
    search_returns: 'Search by asset ID, name, or returned by...',
    all_status_filter: 'All Status', received: 'Received',
    asset_id_col: 'ASSET ID', asset_name_col: 'ASSET NAME', returned_by_col: 'RETURNED BY',
    return_date_col: 'RETURN DATE', status_col: 'STATUS', condition_col: 'CONDITION',
    actions_col: 'ACTIONS', no_returns_found: 'No return requests found',
    loading_returns: 'Loading returns...',
    accept: 'Accept', confirm_received: 'Confirm Received',
    return_details: 'Return Details', returned_by: 'Returned By', return_date: 'Return Date',
    condition: 'Condition', notes: 'Notes', reason: 'Reason',
    asset_to_return: 'Asset to Return', reason_for_return: 'Reason for Return',
    reason_placeholder: 'Describe why you are returning this asset...',
    no_assets_assigned: 'No assets are currently assigned to you.',
    submitting: 'Submitting...', submit_return: 'Submit Return',
    reject_return: 'Reject Return', reason_for_rejection: 'Reason for Rejection',
    rejection_placeholder: 'Explain why this return is being rejected...',
    rejecting: 'Rejecting...', confirm_reject: 'Confirm Reject',
    // Audit logs
    audit_logs_title: 'Audit Logs', monitor_activities: 'Monitor system activities and security events',
    filters: 'Filters', action: 'Action', all_actions: 'All Actions',
    start_date: 'Start Date', end_date: 'End Date',
    apply_filters: 'Apply Filters', clear_filters_btn: 'Clear Filters',
    timestamp: 'Timestamp', user: 'User', entity: 'Entity', ip_address: 'IP Address',
    view_details_btn: 'View Details', no_audit_logs: 'No audit logs found for the selected filters.',
    audit_log_details: 'Audit Log Details', performed_by: 'Performed By',
    entity_type: 'Entity Type', entity_id: 'Entity ID', user_agent: 'User Agent',
    error_message: 'Error Message', details: 'Details',
    // Profile
    account_settings: 'Account Settings', my_profile: 'My Profile',
    manage_personal_info: 'Manage your personal information',
    personal_information: 'Personal Information', update_personal_details: 'Update your personal details',
    first_name: 'First Name', middle_name: 'Middle Name', last_name: 'Last Name',
    email: 'Email', phone_number: 'Phone Number', username: 'Username', role: 'Role',
    wing: 'Wing', college: 'College', school: 'School', department: 'Department',
    administrative_unit: 'Administrative Unit',
    account_information: 'Account Information', read_only_details: 'Read-only account details',
    enter_first_name: 'Enter first name', enter_middle_name: 'Enter middle name',
    enter_last_name: 'Enter last name', enter_email: 'Enter email address',
    phone_format: '+251XXXXXXXXX',
    profile_updated: 'Profile updated successfully',
    profile_update_failed: 'Failed to update profile',
    failed_load_profile: 'Failed to load profile',
    loading_profile: 'Loading profile...',
    user_not_authenticated: 'User not authenticated',
    invalid_phone: 'Phone must be in format +251XXXXXXXXX',
    invalid_email: 'Invalid email address',
    name_letters_only: 'Name must contain letters only',
    required_field: 'is required',
    // Notifications
    notifications: 'Notifications', no_notifications: 'No notifications',
    theme_toggle: 'Toggle theme',
  },
  am: {
    // Navigation
    dashboard: 'ዳሽቦርድ', assets: 'ንብረቶች', assignments: 'ምደባዎች',
    transfers: 'ዝውውሮች', transfer_dashboard: 'የዝውውር ዳሽቦርድ',
    returns: 'መመለሻዎች', requests: 'ጥያቄዎች', reports: 'ሪፖርቶች',
    user_management: 'የተጠቃሚ አስተዳደር', audit_logs: 'የኦዲት ምዝገባዎች',
    profile: 'መገለጫ', logout: 'ውጣ',
    // Login
    welcome_back_login: 'እንኳን ደህና መጡ', sign_in_to_access: 'ወደ መለያዎ ለመግባት ይግቡ',
    language_preference: 'የቋንቋ ምርጫ',
    // General
    loading: 'በመጫን ላይ', error: 'ስህተት', save_changes: 'ለውጦችን አስቀምጥ', saving: 'በማስቀመጥ ላይ',
    cancel: 'ሰርዝ', close: 'ዝጋ', view: 'ይመልከቱ', edit: 'አርትዕ', delete: 'ሰርዝ',
    search: 'ፈልግ', filter: 'አጣራ', export: 'ላክ', print: 'አትም',
    approve: 'አጽድቅ', reject: 'ውድቅ አድርግ', complete: 'ጨርስ', review: 'ገምግም',
    assign: 'ምደብ', unassign: 'ምደባ ሰርዝ', submit: 'አስገባ', create: 'ፍጠር',
    no_data_available: 'ምንም ውሂብ የለም', view_details: 'ዝርዝሮችን ይመልከቱ',
    // Dashboard
    asset_inventory_overview: 'የንብረት ክምችት አጠቃላይ እይታ',
    total_assets: 'ጠቅላላ ንብረቶች', available: 'ያሉ', assigned: 'የተመደቡ',
    maintenance: 'ጥገና', damaged: 'የተበላሹ', disposed: 'የተወገዱ',
    transfer_management: 'የዝውውር አስተዳደር', return_management: 'የመመለሻ አስተዳደር',
    pending_transfers: 'በመጠባበቅ ላይ ያሉ ዝውውሮች', approved_transfers: 'የጸደቁ ዝውውሮች',
    completed_today: 'ዛሬ የተጠናቀቁ', successfully_processed: 'በተሳካ ሁኔታ ተሰርቷል',
    awaiting_vp_approval: 'የምክትል ፕሬዝዳንት ፈቃድ በመጠባበቅ', ready_to_complete: 'ለማጠናቀቅ ዝግጁ',
    manage_transfers: 'ዝውውሮችን አስተዳድር', manage_returns: 'መመለሻዎችን አስተዳድር',
    pending_returns: 'በመጠባበቅ ላይ ያሉ መመለሻዎች', need_to_receive: 'መቀበል ያስፈልጋል',
    under_inspection: 'በምርመራ ላይ', quality_check_required: 'የጥራት ምርመራ ያስፈልጋል',
    priority_actions: 'ቅድሚያ የሚሰጣቸው ተግባራት',
    transfers_to_complete: 'ሊጠናቀቁ የሚገቡ ዝውውሮች', returns_to_receive: 'ሊቀበሉ የሚገቡ መመለሻዎች',
    returns_to_inspect: 'ሊመረመሩ የሚገቡ መመለሻዎች', assets_to_maintain: 'ጥገና የሚያስፈልጋቸው ንብረቶች',
    asset_condition_breakdown: 'የንብረት ሁኔታ ዝርዝር',
    asset_category_breakdown: 'የንብረት ምድብ ዝርዝር',
    quick_actions: 'ፈጣን ተግባራት',
    register_new_asset: 'አዲስ ንብረት ምዝገባ', add_asset_to_inventory: 'ንብረት ወደ ክምችት ጨምር',
    fixed_assets: 'ቋሚ ንብረት', fixed_consumable: 'ቋሚ-ሸቀጣሸቀጥ',
    // Assets page
    manage_university_assets: 'የዩኒቨርሲቲ ንብረቶችን ያስተዳድሩ',
    register_new_asset_btn: '+ አዲስ ንብረት ምዝገባ',
    search_assets: 'በንብረት መለያ፣ ስም ወይም ተከታታይ ቁጥር ፈልግ...',
    asset_id: 'የንብረት መለያ', name: 'ስም', category: 'ምድብ', status: 'ሁኔታ',
    location: 'ቦታ', value: 'ዋጋ', purchase_date: 'የግዢ ቀን', actions: 'ተግባራት',
    no_assets_found: 'ከፍለጋዎ ጋር የሚዛመድ ንብረት አልተገኘም',
    no_assets_registered: 'ምንም ንብረት አልተመዘገበም',
    // Assignments page
    asset_assignments: 'የንብረት ምደባዎች',
    assign_manage_allocations: 'ለሠራተኞች ንብረቶችን ምደብ እና አስተዳድር',
    total_assets_count: 'ጠቅላላ ንብረቶች', assigned_assets: 'የተመደቡ ንብረቶች',
    available_assets: 'ያሉ ንብረቶች',
    search_asset_placeholder: 'በንብረት መለያ ወይም ስም ፈልግ...',
    all_status: 'ሁሉም ሁኔታ', all_work_units: 'ሁሉም የሥራ ክፍሎች', clear_filters: 'ማጣሪያዎችን አጽዳ',
    asset_assignment_list: 'የንብረት ምደባ ዝርዝር', asset_info: 'የንብረት መረጃ',
    loading_assets: 'ንብረቶችን በመጫን ላይ...', no_assets_found_filter: 'ምንም ንብረት አልተገኘም',
    unassigned: 'ያልተመደበ', no_work_unit: 'የሥራ ክፍል የለም',
    assign_asset: 'ንብረት ምደብ', assign_asset_to_staff: 'ንብረትን ለሠራተኛ ምደብ',
    asset_details: 'የንብረት ዝርዝሮች', select_staff_member: 'ሠራተኛ ምረጥ',
    select_staff_placeholder: '-- ሠራተኛ ምረጥ --',
    no_users_available: 'ምንም ተጠቃሚ የለም - አስተዳዳሪን ያነጋግሩ',
    assignment_notes: 'የምደባ ማስታወሻዎች (አማራጭ)',
    assignment_notes_placeholder: 'ስለዚህ ምደባ ማስታወሻ ያስገቡ...',
    assigning: 'በምደባ ላይ...', assign_asset_btn: 'ንብረት ምደብ',
    unassign_asset: 'ምደባ ሰርዝ', unassign_confirm: 'ይህን ንብረት ምደባ መሰረዝ ይፈልጋሉ?',
    currently_assigned_to: 'አሁን የተመደበለት:', unassigning: 'ምደባ በመሰረዝ ላይ...',
    // Transfers page
    asset_transfers: 'የንብረት ዝውውሮች', manage_transfer_requests: 'የንብረት ዝውውር ጥያቄዎችን ያስተዳድሩ',
    new_transfer: 'አዲስ ዝውውር', asset: 'ንብረት', from: 'ከ', to: 'ወደ',
    request_date: 'የጥያቄ ቀን', no_transfers_found: 'ምንም የዝውውር ጥያቄ አልተገኘም',
    // Requests page
    manage_requests: 'የማውጣት፣ ግዢ እና ሌሎች ጥያቄዎችን ያስተዳድሩ',
    create_request: 'ጥያቄ ፍጠር', type: 'አይነት', item: 'ዕቃ',
    requested_by: 'የጠየቀ', purpose: 'ዓላማ', priority: 'ቅድሚያ',
    date: 'ቀን', no_requests_found: 'ምንም ጥያቄ አልተገኘም። "ጥያቄ ፍጠር" ን ጠቅ ያድርጉ።',
    loading_requests: 'ጥያቄዎችን በመጫን ላይ...',
    // Returns page
    asset_management: 'የንብረት አስተዳደር', asset_returns: 'የንብረት መመለሻዎች',
    manage_return_requests: 'የንብረት መመለሻ ጥያቄዎችን እና ፈቃዶችን ያስተዳድሩ',
    process_return: '+ መመለሻ አስኪያጅ', total_returns: 'ጠቅላላ መመለሻዎች',
    pending: 'በመጠባበቅ ላይ', completed: 'የተጠናቀቀ', rejected: 'ውድቅ የተደረገ',
    search_returns: 'በንብረት መለያ፣ ስም ወይም ተመላሽ ፈልግ...',
    all_status_filter: 'ሁሉም ሁኔታ', received: 'የተቀበለ',
    asset_id_col: 'የንብረት መለያ', asset_name_col: 'የንብረት ስም', returned_by_col: 'የመለሰ',
    return_date_col: 'የመመለሻ ቀን', status_col: 'ሁኔታ', condition_col: 'ሁኔታ',
    actions_col: 'ተግባራት', no_returns_found: 'ምንም የመመለሻ ጥያቄ አልተገኘም',
    loading_returns: 'መመለሻዎችን በመጫን ላይ...',
    accept: 'ተቀበል', confirm_received: 'መቀበልን አረጋግጥ',
    return_details: 'የመመለሻ ዝርዝሮች', returned_by: 'የመለሰ', return_date: 'የመመለሻ ቀን',
    condition: 'ሁኔታ', notes: 'ማስታወሻዎች', reason: 'ምክንያት',
    asset_to_return: 'ሊመለስ የሚገባ ንብረት', reason_for_return: 'የመመለሻ ምክንያት',
    reason_placeholder: 'ይህን ንብረት ለምን እንደሚመልሱ ይግለጹ...',
    no_assets_assigned: 'አሁን ምንም ንብረት አልተመደበልዎትም።',
    submitting: 'በማስገባት ላይ...', submit_return: 'መመለሻ አስገባ',
    reject_return: 'መመለሻ ውድቅ አድርግ', reason_for_rejection: 'የውድቅ ምክንያት',
    rejection_placeholder: 'ይህ መመለሻ ለምን ውድቅ እንደሚደረግ ያብራሩ...',
    rejecting: 'ውድቅ በማድረግ ላይ...', confirm_reject: 'ውድቅ ማድረጉን አረጋግጥ',
    // Audit logs
    audit_logs_title: 'የኦዲት ምዝገባዎች', monitor_activities: 'የስርዓት እንቅስቃሴዎችን እና የደህንነት ክስተቶችን ይከታተሉ',
    filters: 'ማጣሪያዎች', action: 'ተግባር', all_actions: 'ሁሉም ተግባራት',
    start_date: 'መጀመሪያ ቀን', end_date: 'መጨረሻ ቀን',
    apply_filters: 'ማጣሪያዎችን ተግብር', clear_filters_btn: 'ማጣሪያዎችን አጽዳ',
    timestamp: 'ጊዜ', user: 'ተጠቃሚ', entity: 'አካል', ip_address: 'አይፒ አድራሻ',
    view_details_btn: 'ዝርዝሮችን ይመልከቱ', no_audit_logs: 'ለተመረጡ ማጣሪያዎች ምንም የኦዲት ምዝገባ አልተገኘም።',
    audit_log_details: 'የኦዲት ምዝገባ ዝርዝሮች', performed_by: 'የፈጸመ',
    entity_type: 'የአካል አይነት', entity_id: 'የአካል መለያ', user_agent: 'የተጠቃሚ ወኪል',
    error_message: 'የስህተት መልዕክት', details: 'ዝርዝሮች',
    // Profile
    account_settings: 'የመለያ ቅንብሮች', my_profile: 'የእኔ መገለጫ',
    manage_personal_info: 'የግል መረጃዎን ያስተዳድሩ',
    personal_information: 'የግል መረጃ', update_personal_details: 'የግል ዝርዝሮችዎን ያዘምኑ',
    first_name: 'የመጀመሪያ ስም', middle_name: 'የአባት ስም', last_name: 'የአያት ስም',
    email: 'ኢሜይል', phone_number: 'ስልክ ቁጥር', username: 'የተጠቃሚ ስም', role: 'ሚና',
    wing: 'ክፍል', college: 'ኮሌጅ', school: 'ትምህርት ቤት', department: 'ክፍለ ትምህርት',
    administrative_unit: 'አስተዳደራዊ ክፍል',
    account_information: 'የመለያ መረጃ', read_only_details: 'ለማንበብ ብቻ የሚሆን የመለያ ዝርዝሮች',
    enter_first_name: 'የመጀመሪያ ስም ያስገቡ', enter_middle_name: 'የአባት ስም ያስገቡ',
    enter_last_name: 'የአያት ስም ያስገቡ', enter_email: 'ኢሜይል አድራሻ ያስገቡ',
    phone_format: '+251XXXXXXXXX',
    profile_updated: 'መገለጫ በተሳካ ሁኔታ ተዘምኗል',
    profile_update_failed: 'መገለጫ ማዘመን አልተሳካም',
    failed_load_profile: 'መገለጫ መጫን አልተሳካም',
    loading_profile: 'መገለጫ በመጫን ላይ...',
    user_not_authenticated: 'ተጠቃሚ አልተረጋገጠም',
    invalid_phone: 'ስልክ ቁጥር +251XXXXXXXXX ቅርጸት መሆን አለበት',
    invalid_email: 'ልክ ያልሆነ ኢሜይል አድራሻ',
    name_letters_only: 'ስም ፊደሎችን ብቻ መያዝ አለበት',
    required_field: 'ያስፈልጋል',
    // Notifications
    notifications: 'ማሳወቂያዎች', no_notifications: 'ምንም ማሳወቂያ የለም',
    theme_toggle: 'ገጽታ ቀይር',
  },
};

// ─── Language Context ─────────────────────────────────────────────────────────
type Language = 'en' | 'am';
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('user-language-preference') as Language | null;
    if (saved === 'en' || saved === 'am') setLanguageState(saved);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('user-language-preference', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] ?? translations['en']?.[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return { language: 'en' as Language, setLanguage: () => {}, t: (key: string) => key };
  }
  return ctx;
}

// ─── Notification Context ─────────────────────────────────────────────────────

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'request' | 'return' | 'transfer' | 'general';
  isRead: boolean;
  createdAt: string;
}
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refresh: () => void;
}
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  // Watch localStorage token — handles login, logout, and user switching
  useEffect(() => {
    const sync = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      setCurrentToken(prev => {
        if (prev !== token) return token; // triggers re-fetch effect
        return prev;
      });
    };
    sync();
    const id = setInterval(sync, 1000);
    return () => clearInterval(id);
  }, []);

  const fetchNotifications = async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) { setNotifications([]); return; }
    try {
      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const json = await res.json();
      const data: Notification[] = Array.isArray(json) ? json : json.data || [];
      setNotifications(data);
    } catch {
      // silently ignore
    }
  };

  // Re-fetch whenever the token changes (login / logout / user switch)
  useEffect(() => {
    if (!currentToken) { setNotifications([]); return; }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15_000);
    return () => clearInterval(interval);
  }, [currentToken]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch { /* ignore */ }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;
    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch { /* ignore */ }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, refresh: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    return { notifications: [], unreadCount: 0, markAsRead: () => {}, markAllAsRead: () => {}, refresh: () => {} };
  }
  return ctx;
}
