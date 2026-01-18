# 🔐 Quick Login Guide for HerBlock

## Getting Started with Login

### ⚠️ Important: Register First!

You **CANNOT** login without creating an account first. Here's how:

---

## 📝 Step 1: Register a New Account

1. Open your browser and go to: **http://localhost:3000**
2. Click **"View Dashboard"** or navigate to **http://localhost:3000/login**
3. At the bottom of the login form, click **"Register here"** link
4. You'll be taken to the registration page
5. Fill in the form:
   - **Username**: Choose any username (e.g., `admin`, `testuser`, `pranav`)
   - **Password**: Choose a password (e.g., `password123`, `test1234`)
6. Click **"Create Account"**
7. You'll see a success message and be redirected to login

---

## 🔑 Step 2: Login

1. Go to **http://localhost:3000/login**
2. Enter the credentials you just created:
   - **Username**: (the username you registered)
   - **Password**: (the password you registered)
3. Click **"Sign In"**
4. You'll be redirected to the dashboard!

---

## 🚫 Google OAuth Error Fix

### The Error You're Seeing:
```
The OAuth client was not found.
Error 401: invalid_client
```

### Why This Happens:
The Google OAuth credentials in the `.env` file are placeholders and not real credentials.

### Solutions:

#### **Option 1: Don't Use Google Login (Quick Fix)**
Simply ignore the "Login with Google" button and use the username/password method above.

#### **Option 2: Set Up Real Google OAuth (For Production)**

If you want Google login to work:

1. **Create Google Cloud Project:**
   - Go to: https://console.cloud.google.com/
   - Click "Select a project" → "New Project"
   - Give it a name (e.g., "HerBlock")
   - Click "Create"

2. **Enable Google+ API:**
   - In the project, go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click and enable it

3. **Create OAuth Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://127.0.0.1:8000/api/auth/callback`
     - `http://localhost:8000/api/auth/callback`
   - Click "Create"

4. **Copy Your Credentials:**
   - You'll see a modal with:
     - Client ID (starts with something like `123456-abcdef.apps.googleusercontent.com`)
     - Client Secret (random string)

5. **Update Backend .env File:**
   - Open `/backend/.env`
   - Replace these lines:
   ```env
   GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
   ```

6. **Restart Backend Server:**
   - Stop the backend (Ctrl+C in the terminal)
   - Start it again: `uvicorn server:app --reload`

---

## 🎯 Quick Test Credentials

Want to test quickly? Here's what to do:

### Register Test Account:
- **URL**: http://localhost:3000/register
- **Username**: `admin`
- **Password**: `admin123`

Then login with the same credentials!

---

## 🔧 Troubleshooting

### "Invalid username or password"
- Make sure you registered first!
- Double-check your username and password
- Usernames and passwords are case-sensitive

### "Failed to connect to backend"
- Make sure the backend server is running on port 8000
- Check terminal where you ran `uvicorn server:app --reload`
- Visit http://127.0.0.1:8000/docs to verify backend is running

### MongoDB Connection Error
- Make sure Docker is running
- Check if MongoDB container is running: `docker ps`
- Start MongoDB if needed: `docker start herblock-mongo`

---

## 📍 Quick Navigation

- **Home**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Register**: http://localhost:3000/register
- **Dashboard**: http://localhost:3000/dashboard (requires login)
- **Backend API**: http://127.0.0.1:8000/docs

---

## 🎉 Next Steps After Login

Once logged in, you can:

1. **View Dashboard** - See analytics and statistics
2. **Add Collection Event** - Record herb collection with GPS location
3. **Add Processing Step** - Track herb processing operations
4. **Add Quality Test** - Record quality test results
5. **Create Product** - Generate final product with QR code

---

**Need Help?** Make sure all three services are running:
1. ✅ MongoDB (Docker)
2. ✅ Backend (port 8000)
3. ✅ Frontend (port 3000)
