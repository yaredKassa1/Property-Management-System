# Testing Instructions

## Before Testing - Clear Browser Data

1. Open your browser's Developer Tools (F12)
2. Go to the **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Under **Local Storage**, find `http://localhost:3000`
4. Right-click and select "Clear"
5. Also clear **Session Storage**
6. Close and reopen the browser tab

## Testing Login

1. Go to http://localhost:3000/login
2. Open Developer Console (F12 → Console tab)
3. Enter:
   - Username: `staff`
   - Password: `anything`
   - Role: Select "Staff"
4. Click "Sign In"

## What to Check in Console

You should see these messages in order:
```
Login: Saving user and token...
Login: User: {id: '1', username: 'staff', ...}
Login: Token: mock-jwt-token-...
Login: Verified token in localStorage: mock-jwt-token-...
Login: Verified user in localStorage: {"id":"1",...}
Login: Redirecting to dashboard...
DashboardLayout: Checking authentication...
DashboardLayout: Just logged in flag detected
DashboardLayout: Token from localStorage: mock-jwt-token-...
DashboardLayout: User from localStorage: {"id":"1",...}
DashboardLayout: Is authenticated: true
DashboardLayout: Current user: {id: '1', username: 'staff', ...}
DashboardLayout: Authentication successful, loading dashboard
```

## If It Still Redirects to Login

Check the console for error messages. The most common issues:

1. **localStorage is disabled** - Check browser settings
2. **Private/Incognito mode** - Try normal browsing mode
3. **Browser extension blocking** - Disable ad blockers temporarily
4. **Cache issue** - Hard refresh with Ctrl+Shift+R

## Manual localStorage Test

In the browser console, try:
```javascript
localStorage.setItem('test', 'hello');
console.log(localStorage.getItem('test'));
```

If this returns `null` or throws an error, localStorage is disabled in your browser.

## Alternative: Check Application Tab

1. Open DevTools (F12)
2. Go to Application → Local Storage → http://localhost:3000
3. After clicking "Sign In", you should see:
   - `token`: mock-jwt-token-...
   - `user`: {"id":"1","username":"staff",...}

If these appear, the login is working and the issue is with the redirect logic.
