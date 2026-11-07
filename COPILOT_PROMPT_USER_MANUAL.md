# Microsoft Copilot Prompt: User Manual for WDUPMS

## Instructions for Copilot:

Create a comprehensive, professional user manual for the Woldia University Durable Property Management System (WDUPMS). The manual should be clear, detailed, and include step-by-step instructions with screenshots placeholders. Use professional technical writing style suitable for university staff and administrators.

---

## SECTION 1: SYSTEM LOGIN

### Context:
The login page has the following elements:
- Title: "Welcome Back"
- Subtitle: "Sign in to access your account"
- Role selector dropdown (with options: Staff, Administrator, Property Officer, Vice President, Approval Authority, Purchase Department, Quality Assurance)
- Username input field with user icon
- Password input field with lock icon and show/hide password toggle
- "Remember me" checkbox
- "Forgot password?" link
- Purple "Sign In" button with arrow
- "Need help? Contact administrator" link at bottom

### Required Content:

**1.1 Accessing the System**

Write a detailed section covering:
- How to access the WDUPMS login page (URL: http://localhost:3000 or provided university URL)
- System requirements (supported browsers: Chrome, Firefox, Edge, Safari)
- Recommended screen resolution (minimum 1366x768)
- Internet connection requirements

**1.2 Login Process**

Provide step-by-step instructions:

**Step 1: Select Your Role**
- Explain the role dropdown at the top of the login form
- List all available roles:
  * **Staff** - For university employees requesting and using assets
  * **Administrator** - For system administrators with full access
  * **Property Officer** - For managing assets, assignments, and transfers
  * **Vice President** - For high-level approvals
  * **Approval Authority** - For approving asset requests
  * **Purchase Department** - For procurement processes
  * **Quality Assurance** - For inspecting and verifying assets
- Note: The system auto-detects your role based on your account, but you can select it manually if you have multiple roles

**Step 2: Enter Your Username**
- Click on the username field (with user icon)
- Enter your registered username (e.g., "admin", "staff1", "property")
- Username is case-sensitive
- Do not include spaces before or after your username

**Step 3: Enter Your Password**
- Click on the password field (with lock icon)
- Enter your password carefully
- Password is case-sensitive
- Use the eye icon (👁️) on the right to show/hide your password for verification
- Ensure Caps Lock is not accidentally enabled

**Step 4: Optional Settings**
- Check "Remember me" if you want the system to remember your login on this device
- Note: Only use this option on your personal, secure device
- Do not use "Remember me" on shared or public computers

**Step 5: Sign In**
- Click the purple "Sign In" button
- The system will verify your credentials
- If successful, you will be redirected to your role-specific dashboard
- If unsuccessful, an error message will appear

**1.3 Role-Based Dashboard Redirection**

Explain what happens after successful login for each role:

- **Administrator** → Admin Dashboard (full system overview, user management, system settings)
- **Property Officer** → Property Management Dashboard (assets, assignments, transfers, returns)
- **Staff** → Staff Dashboard (my assets, requests, notifications)
- **Vice President** → VP Dashboard (pending approvals, high-value requests)
- **Approval Authority** → Approval Dashboard (pending requests, approval queue)
- **Purchase Department** → Procurement Dashboard (approved requests, purchase orders)
- **Quality Assurance** → QA Dashboard (pending inspections, quality reports)

**1.4 First-Time Login**

Provide guidance for new users:
- Default credentials are provided by the system administrator
- You will be prompted to change your password on first login (if enabled)
- Complete your profile information when prompted
- Review the system tutorial (if available)

**1.5 Troubleshooting Login Issues**

Create a troubleshooting table:

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| "Invalid username or password" | Incorrect credentials | Verify username and password, check Caps Lock |
| "Account is inactive" | Account disabled by admin | Contact system administrator |
| "Role not assigned" | No role configured | Contact system administrator |
| Page not loading | Network issue | Check internet connection, try refreshing |
| Forgot password | Cannot remember password | Click "Forgot password?" link |
| Browser compatibility | Unsupported browser | Use Chrome, Firefox, Edge, or Safari |

**1.6 Forgot Password**

Detailed steps for password recovery:
1. Click the "Forgot password?" link on the login page
2. Enter your registered email address
3. Click "Send Reset Link"
4. Check your email inbox (and spam folder)
5. Click the password reset link in the email (valid for 24 hours)
6. Enter your new password (must meet security requirements)
7. Confirm your new password
8. Click "Reset Password"
9. Return to login page and sign in with new password

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (recommended)

**1.7 Need Help?**

Explain the support options:
- Click "Contact administrator" link at the bottom of the login page
- Email: admin@woldia.edu.et (or provided support email)
- Phone: +251-XXX-XXXXXX (IT Support)
- Office Hours: Monday-Friday, 8:00 AM - 5:00 PM
- For urgent issues outside office hours, contact the on-call administrator

**1.8 Security Best Practices**

Provide security guidelines:
- Never share your username and password with anyone
- Do not write down your password
- Use a strong, unique password
- Change your password regularly (every 90 days recommended)
- Always log out when finished, especially on shared computers
- Report any suspicious activity to the administrator immediately
- Do not access the system from untrusted networks

**1.9 Session Management**

Explain session behavior:
- Sessions expire after 30 minutes of inactivity (configurable)
- You will receive a warning 5 minutes before session expiration
- Click "Extend Session" to continue working
- If session expires, you will be redirected to the login page
- Your unsaved work may be lost upon session expiration

**1.10 Multi-Device Access**

Clarify multi-device usage:
- You can access WDUPMS from multiple devices
- Only one active session per user is allowed (configurable)
- Logging in from a new device will end your previous session
- Mobile access is supported through responsive web design
- No separate mobile app is required

---

## Formatting Instructions for Copilot:

1. Use clear headings and subheadings
2. Include numbered steps for procedures
3. Add [SCREENSHOT PLACEHOLDER: Description] where screenshots should be inserted
4. Use tables for comparison or troubleshooting information
5. Include warning boxes for important security information
6. Add tip boxes for helpful hints
7. Use bold for UI elements (buttons, fields, menu items)
8. Use bullet points for lists
9. Keep language simple and professional
10. Include page numbers and table of contents references

---

## Additional Notes:

- This is Section 1 of a 12-section user manual
- Maintain consistent terminology throughout
- Use "WDUPMS" or "the system" when referring to the application
- Include version number: Version 1.0.0
- Add footer: "Woldia University - Property Management System User Manual"
- Target audience: University staff with basic computer literacy
- Assume users have received basic training

---

## Example Output Format:

```
WOLDIA UNIVERSITY
DURABLE PROPERTY MANAGEMENT SYSTEM (WDUPMS)
USER MANUAL - VERSION 1.0.0

═══════════════════════════════════════════════════════════

SECTION 1: SYSTEM LOGIN

1.1 Accessing the System
────────────────────────

The Woldia University Durable Property Management System (WDUPMS) is a web-based application accessible through your internet browser...

[Continue with detailed content as specified above]

[SCREENSHOT PLACEHOLDER: Login page showing all elements]

⚠️ SECURITY WARNING
Never share your login credentials with anyone. The system administrator will never ask for your password.

💡 TIP
Bookmark the login page for quick access in the future.

[Continue with all subsections...]
```

---

## Generate the complete Section 1 now with all subsections (1.1 through 1.10) following the format and requirements above.
