
# 🚀 Step-by-Step Deployment Guide (Separate Services)

This guide splits your application into two parts: **Backend (Web Service)** and **Frontend (Static Site)**. This is the most robust way to deploy MERN apps on Render.

## ✅ Prerequisites (Already Done)
1.  **Code Updated:** We have updated the Client to look for `VITE_SERVER_URL`.
2.  **CORS Enabled:** The Server is configured to accept requests from anywhere (`*`).
3.  **Database:** MongoDB Atlas is ready.

---

## 1️⃣ Deploy the Backend (Web Service)

1.  Go to **[Render Dashboard](https://dashboard.render.com/)**.
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository (`MindMapping`).
4.  **Configuration:**
    *   **Name:** `mindmap-backend`
    *   **Region:** Singapore (or nearest to you)
    *   **Root Directory:** `server` (⚠️ IMPORTANT)
    *   **Runtime:** Node
    *   **Build Command:** `npm install`
    *   **Start Command:** `node index.js`
5.  **Environment Variables:**
    *   `MONGODB_URI`: (Paste your connection string)
    *   `JWT_SECRET`: `mysecretkey123`
    *   `PORT`: `10000` (Optional, Render sets it auto)
6.  Click **Create Web Service**.
7.  **Wait** for it to deploy.
8.  **Copy the URL** (e.g., `https://mindmap-backend.onrender.com`). You will need this for the frontend!

---

## 2️⃣ Deploy the Frontend (Static Site)

1.  Go to **Render Dashboard**.
2.  Click **New +** -> **Static Site**.
3.  Connect the **SAME** GitHub repository (`MindMapping`).
4.  **Configuration:**
    *   **Name:** `mindmap-frontend`
    *   **Region:** Singapore (Same as backend)
    *   **Root Directory:** `client` (⚠️ IMPORTANT)
    *   **Build Command:** `npm install && npm run build`
    *   **Publish Directory:** `dist`
5.  **Environment Variables:**
    *   **Key:** `VITE_SERVER_URL`
    *   **Value:** `https://mindmap-backend.onrender.com` (Paste the Backend URL from Step 1)
6.  Click **Create Static Site**.
7.  **Wait** for deploy.

---

## 3️⃣ Final Verification

1.  Open your **Frontend URL** (e.g., `https://mindmap-frontend.onrender.com`).
2.  Try to **Sign Up**.
3.  It should work perfectly!

---

### ❓ Why Separate?
*   **Faster:** Frontend is served from a global CDN (ultra fast).
*   **Simpler:** No "Build backend to serve frontend" logic.
*   **Debuggable:** If Frontend works but API fails, we know exactly where to look.
