# VoteChain Auth Backend — Railway Deployment Guide

## Why Railway?
Railway provides **always-on Node.js + WebSocket (Socket.io)** hosting with HTTPS by default — perfect for cross-device WebAuthn where your phone must reach the backend securely.

---

## Step 1 — Push server/ to GitHub

Railway deploys from a GitHub repo. Either:
- Push your whole project to GitHub, then set **Root Directory** to `server/`
- Or push just the `server/` folder as a standalone repo

## Step 2 — Create a Railway Project

1. Go to [railway.app](https://railway.app) → **Start a New Project**
2. Choose **Deploy from GitHub repo** → select your repo
3. In **Settings → General → Root Directory** set: `server`
4. Railway auto-detects Node.js via `package.json`

## Step 3 — Set Environment Variables

In Railway project → **Variables**, add:

| Variable | Value |
|---|---|
| `FRONTEND_URL` | Your Vercel/Netlify frontend URL e.g. `https://votechain.vercel.app` |
| `RP_ID` | Your frontend domain e.g. `votechain.vercel.app` |
| `RP_ORIGIN` | Full frontend URL e.g. `https://votechain.vercel.app` |
| `RP_NAME` | `VoteChain` |
| `PORT` | *(leave empty — Railway sets this automatically)* |

> **For local dev testing:** Keep all three as `localhost` / `http://localhost:5173`

## Step 4 — Get Deployment URL

After deploy (~1 min), Railway gives you a URL like:
```
https://votechain-auth-production.up.railway.app
```

## Step 5 — Update Frontend .env.local

```env
VITE_API_URL=https://votechain-auth-production.up.railway.app
```

Then rebuild/redeploy your frontend.

---

## Step 6 — Run Locally (Dev Mode)

**Terminal 1 — Backend:**
```powershell
cd server
npm start
# → 🔐 VoteChain Auth Server → http://localhost:3001
```

**Terminal 2 — Frontend:**
```powershell
npm run dev
# → http://localhost:5173
```

> WebAuthn biometric prompts only fire on `localhost` or `https://`. Make sure you use `localhost`, not `127.0.0.1`.

---

## Cross-Device Testing (Phone + Laptop)

Once deployed to Railway with HTTPS:
1. Open `https://your-frontend.vercel.app` on your **laptop** → QR code appears
2. Open camera on your **phone** → scan QR
3. Phone opens `/auth/scan?sessionId=...` → tap fingerprint
4. Laptop **auto-logs in** via Socket.io notification ✓

For local cross-device testing, use a tunnel like [ngrok](https://ngrok.com):
```bash
ngrok http 3001
# Then set VITE_API_URL to the ngrok https URL
```
