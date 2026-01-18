# ⚡ QUICK START - How to Login

## 🎯 Your Application is Running!

- **Frontend**: http://localhost:3001 (or http://localhost:3000)
- **Backend**: http://127.0.0.1:8000

---

## 🔑 TO LOGIN, YOU MUST REGISTER FIRST!

### Step-by-Step Instructions:

### 1️⃣ **Go to Registration Page**
Open your browser and visit:
```
http://localhost:3001/register
```
OR
```
http://localhost:3000/register
```

### 2️⃣ **Create Your Account**
Fill in the form:
- **Username**: `admin` (or any username you like)
- **Password**: `admin123` (or any password you like)
- Click **"Create Account"**

### 3️⃣ **Login**
After registration succeeds, you'll be redirected to login page.
- Enter the same **username** and **password** you just created
- Click **"Sign In"**

### 4️⃣ **Access Dashboard**
You're now logged in and can access the dashboard!

---

## ❌ IGNORE Google Login For Now

The **"Login with Google"** button will show this error:
```
Error 401: invalid_client
The OAuth client was not found.
```

**Why?** Because Google OAuth credentials are not configured yet.

**Solution**: Just use the regular username/password login above. Google login is optional!

---

## 🔧 To Fix Google OAuth (Optional):

If you want Google login to work, you need real Google Cloud credentials:

1. Create a project at: https://console.cloud.google.com/
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add redirect URI: `http://127.0.0.1:8000/api/auth/callback`
5. Update `/backend/.env` with your real:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
6. Restart backend server

**But this is NOT required to use the app!** Username/password login works perfectly.

---

## 📝 Summary:

✅ **DO THIS**: Register → Login with username/password  
❌ **DON'T USE**: "Login with Google" (not configured yet)

---

## 🎉 Test Credentials (After You Register):

Once you create an account, use those credentials to login.

Example:
- Username: `admin`
- Password: `admin123`

---

Need more help? Check **LOGIN_GUIDE.md** for detailed troubleshooting!
