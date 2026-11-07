# 📧 Gmail App Password Setup Guide

## Complete Step-by-Step Guide to Get Gmail App Password for SMTP

---

## 🎯 WHAT IS AN APP PASSWORD?

An **App Password** is a 16-character code that allows less secure apps (like your Node.js application) to access your Gmail account. It's more secure than using your regular Gmail password.

**Important:** You CANNOT use your regular Gmail password for SMTP. You MUST use an App Password.

---

## ✅ PREREQUISITES

Before you start, make sure:
1. ✅ You have a Gmail account
2. ✅ You have access to your Gmail account
3. ✅ You can receive verification codes (phone or email)

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### **STEP 1: Enable 2-Factor Authentication (2FA)**

App Passwords only work if you have 2-Factor Authentication enabled.

1. **Go to Google Account Security:**
   ```
   https://myaccount.google.com/security
   ```

2. **Find "2-Step Verification" section**
   - Look for "Signing in to Google"
   - Click on "2-Step Verification"

3. **Click "Get Started"**
   - Enter your Gmail password
   - Click "Next"

4. **Add Your Phone Number**
   - Enter your phone number
   - Choose: Text message (SMS) or Phone call
   - Click "Next"

5. **Verify Your Phone**
   - Enter the 6-digit code you received
   - Click "Next"

6. **Turn On 2-Step Verification**
   - Click "Turn On"
   - ✅ 2FA is now enabled!

**Direct Link:** https://myaccount.google.com/signinoptions/two-step-verification

---

### **STEP 2: Generate App Password**

Now that 2FA is enabled, you can create an App Password.

1. **Go to App Passwords Page:**
   ```
   https://myaccount.google.com/apppasswords
   ```
   
   **OR**
   
   - Go to: https://myaccount.google.com/security
   - Scroll down to "Signing in to Google"
   - Click "App passwords"

2. **Sign In Again (if prompted)**
   - Enter your Gmail password
   - Complete 2FA verification

3. **Create App Password:**
   - You'll see "App passwords" page
   - At the bottom, there's a "Select app" dropdown
   - Click the dropdown

4. **Select App Type:**
   - Choose "Mail" from the dropdown
   - OR choose "Other (Custom name)"

5. **Select Device:**
   - Choose "Other (Custom name)"
   - Enter a name: `WDUPMS Backend` or `Property Management System`
   - Click "Generate"

6. **Copy the App Password:**
   - You'll see a 16-character password like: `abcd efgh ijkl mnop`
   - **IMPORTANT:** Copy this password immediately!
   - You won't be able to see it again
   - Click "Done"

**Direct Link:** https://myaccount.google.com/apppasswords

---

### **STEP 3: Update Your .env File**

1. **Open your .env file:**
   ```
   Backend/.env
   ```

2. **Update these lines:**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop
   EMAIL_FROM=Woldia University PMS <your-email@gmail.com>
   ```

3. **Replace:**
   - `your-email@gmail.com` → Your actual Gmail address
   - `abcdefghijklmnop` → The 16-character App Password (remove spaces)

4. **Example:**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=woldiauni.pms@gmail.com
   EMAIL_PASSWORD=xyzw abcd efgh ijkl
   EMAIL_FROM=Woldia University PMS <woldiauni.pms@gmail.com>
   ```

5. **Save the file**

---

### **STEP 4: Test Email Sending**

1. **Restart your backend server:**
   ```bash
   cd Backend
   npm run dev
   ```

2. **Test password reset:**
   ```bash
   node test-password-reset.js
   ```

3. **Or test via API:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com"}'
   ```

4. **Check your email inbox!**

---

## 🔗 IMPORTANT LINKS

### **Main Links:**
- **Google Account Security:** https://myaccount.google.com/security
- **2-Step Verification:** https://myaccount.google.com/signinoptions/two-step-verification
- **App Passwords:** https://myaccount.google.com/apppasswords

### **Help & Documentation:**
- **Google Support - App Passwords:** https://support.google.com/accounts/answer/185833
- **Google Support - 2FA:** https://support.google.com/accounts/answer/185839
- **Gmail SMTP Settings:** https://support.google.com/mail/answer/7126229

---

## 🎥 VIDEO TUTORIAL

If you prefer video instructions:
- **YouTube Search:** "How to create Gmail App Password"
- **Recommended:** https://www.youtube.com/results?search_query=gmail+app+password+2024

---

## ⚠️ TROUBLESHOOTING

### **Problem 1: "App passwords" option not showing**

**Solution:**
- Make sure 2-Step Verification is enabled
- Wait 5-10 minutes after enabling 2FA
- Try logging out and logging back in
- Use this direct link: https://myaccount.google.com/apppasswords

### **Problem 2: "Less secure app access" message**

**Solution:**
- Google removed "Less secure app access" in May 2022
- You MUST use App Passwords now
- Regular passwords no longer work for SMTP

### **Problem 3: "Invalid credentials" error**

**Solution:**
- Make sure you copied the App Password correctly
- Remove all spaces from the App Password
- Use the 16-character code, not your regular password
- Check EMAIL_USER matches the Gmail account

### **Problem 4: "Username and Password not accepted"**

**Solution:**
- Verify 2FA is enabled
- Generate a new App Password
- Make sure EMAIL_HOST is `smtp.gmail.com`
- Make sure EMAIL_PORT is `587`
- Make sure EMAIL_SECURE is `false`

### **Problem 5: Can't find App Passwords page**

**Solution:**
- Go directly to: https://myaccount.google.com/apppasswords
- Or search "App passwords" in Google Account settings
- Make sure you're signed in to the correct Google account

---

## 🔐 SECURITY BEST PRACTICES

1. **Keep App Password Secret**
   - Never share your App Password
   - Don't commit it to Git
   - Store it securely in .env file

2. **Use Separate Gmail Account**
   - Consider creating a dedicated Gmail account for the system
   - Example: `woldiauni.pms@gmail.com`
   - Don't use your personal Gmail

3. **Revoke Unused App Passwords**
   - Go to: https://myaccount.google.com/apppasswords
   - Remove old/unused App Passwords
   - Generate new ones if compromised

4. **Monitor Account Activity**
   - Check: https://myaccount.google.com/notifications
   - Review recent security events
   - Enable alerts for suspicious activity

---

## 📝 QUICK REFERENCE

### **Gmail SMTP Settings:**
```
Host: smtp.gmail.com
Port: 587
Security: STARTTLS
Authentication: Required
Username: your-email@gmail.com
Password: 16-character App Password
```

### **.env Configuration:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=Your Name <your-email@gmail.com>
```

---

## 🎯 ALTERNATIVE: Use University Email

If you want to use the university's email server instead of Gmail:

### **Option 1: Office 365 / Outlook**
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@wdu.edu.et
EMAIL_PASSWORD=your-password
```

### **Option 2: Custom SMTP Server**
```env
EMAIL_HOST=mail.wdu.edu.et
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=pms@wdu.edu.et
EMAIL_PASSWORD=your-password
```

**Note:** Contact your university IT department for SMTP server details.

---

## ✅ VERIFICATION CHECKLIST

After setup, verify:
- [ ] 2-Factor Authentication is enabled
- [ ] App Password is generated
- [ ] App Password is copied (16 characters)
- [ ] .env file is updated
- [ ] EMAIL_USER is correct
- [ ] EMAIL_PASSWORD is the App Password (not regular password)
- [ ] Backend server is restarted
- [ ] Test email is sent successfully
- [ ] Email is received in inbox

---

## 📞 NEED HELP?

If you're still having issues:

1. **Check Google Account Help:**
   - https://support.google.com/accounts

2. **Check Gmail SMTP Help:**
   - https://support.google.com/mail/answer/7126229

3. **Check Backend Logs:**
   ```bash
   cd Backend
   npm run dev
   # Look for email-related errors
   ```

4. **Test SMTP Connection:**
   ```bash
   node test-password-reset.js
   ```

---

## 🎉 SUCCESS!

Once you see "Email sent successfully" in your logs and receive the email, you're all set!

Your password reset feature will now send emails using your Gmail account.

---

**Last Updated:** May 23, 2026
**For:** Woldia University Property Management System
**Email Service:** Gmail SMTP with App Password

---

## 📸 VISUAL GUIDE

### **Step 1: Enable 2FA**
```
Google Account → Security → 2-Step Verification → Get Started
```

### **Step 2: Generate App Password**
```
Google Account → Security → App passwords → Select app → Generate
```

### **Step 3: Copy Password**
```
Copy the 16-character code: abcd efgh ijkl mnop
```

### **Step 4: Update .env**
```
EMAIL_PASSWORD=abcdefghijklmnop (remove spaces)
```

### **Step 5: Test**
```
npm run dev
node test-password-reset.js
```

---

**🎯 That's it! You're ready to send emails!**
