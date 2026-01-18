# 🎯 SOLVED: Registration & Login Instructions

## ✅ System Status: ALL SERVICES RUNNING!

- ✅ MongoDB: Running
- ✅ Backend: Running on http://127.0.0.1:8000
- ✅ Frontend: Running on http://localhost:3000

---

## 🔧 CORS Issue - FIXED!

I've updated the backend to accept requests from both port 3000 and 3001.

**What was changed:**
- Updated `/backend/server.py` CORS configuration
- Now accepts: localhost:3000, localhost:3001, 127.0.0.1:3000, 127.0.0.1:3001

---

## 📝 HOW TO REGISTER & LOGIN

### Option 1: Use the Browser (Recommended)

1. **Open your browser** and go to:
   ```
   http://localhost:3000/register
   ```
   OR
   ```
   http://localhost:3001/register
   ```

2. **Fill in the registration form:**
   - Username: `admin`
   - Password: `admin123`
   - Click "Create Account"

3. **You should see:** "Registration successful! Please log in."

4. **Login:**
   - You'll be redirected to login page
   - Enter the same username and password
   - Click "Sign In"
   - You'll be redirected to the dashboard!

---

### Option 2: Register via Command Line (For Testing)

If browser registration still fails, try this:

```bash
curl -X POST "http://127.0.0.1:8000/api/register" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"
```

**Expected response:**
```json
{"message":"User created successfully"}
```

Then login via browser at http://localhost:3000/login

---

## 🚨 If You Still Get "Internal Server Error"

This usually means there's an issue with bcrypt or password hashing. Try this:

1. **Check backend terminal for detailed error logs**
   - Look for any Python errors
   - Common issue: bcrypt not properly installed

2. **Reinstall bcrypt:**
   ```bash
   cd backend
   source venv/bin/activate
   pip uninstall bcrypt
   pip install bcrypt
   ```

3. **Restart backend:**
   - Press Ctrl+C in backend terminal
   - Run: `uvicorn server:app --reload`

---

## ❌ IGNORE "Login with Google" Button

The Google OAuth button will show this error:
```
Error 401: invalid_client
```

**This is normal!** Just use username/password login instead.

---

## 🎉 Quick Test Credentials

After successful registration, use these to login:
- **Username:** `admin`
- **Password:** `admin123`

---

## 📍 Important URLs

- **Home:** http://localhost:3000
- **Register:** http://localhost:3000/register
- **Login:** http://localhost:3000/login
- **Dashboard:** http://localhost:3000/dashboard (after login)
- **Backend API Docs:** http://127.0.0.1:8000/docs

---

## 🔍 Check System Status Anytime

Run this script to check all services:
```bash
./check-status.sh
```

---

## 💡 Pro Tips

1. **Registration only works once per username**
   - If you get "Username already registered", use a different username
   - Or try: `admin2`, `testuser`, `pranav`, etc.

2. **Password requirements:**
   - Any password works (no minimum length in this version)
   - Passwords are securely hashed with bcrypt

3. **Case sensitive:**
   - Usernames and passwords are case-sensitive
   - `Admin` ≠ `admin`

---

## ✅ Success Checklist

- [ ] MongoDB is running (docker ps | grep mongo)
- [ ] Backend is running (http://127.0.0.1:8000/docs works)
- [ ] Frontend is running (http://localhost:3000 opens)
- [ ] You can access the registration page
- [ ] You successfully registered a user
- [ ] You can login with those credentials
- [ ] You can access the dashboard

---

**Need more help?** 
- Check backend terminal for error messages
- Check browser console (F12) for frontend errors
- Make sure all 3 services are running
