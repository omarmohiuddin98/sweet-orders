# 🎂 Sweet Orders — Cake Business App

A full-stack Next.js cake ordering app with:
- **Customer order form** with receipt generation + PDF download
- **Admin dashboard** with order management, status updates, CSV export
- **Firebase Firestore** database
- **Deployed on Vercel** in minutes

---

## 🚀 Quick Deploy (Step-by-Step)

### Step 1 — Set up Firebase (free)

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → name it `sweet-orders` → click through the setup
3. In the left sidebar, click **Firestore Database** → **Create database**
   - Choose **"Start in test mode"** → pick your region → click **Enable**
4. Go to **Project Settings** (gear icon) → **Your apps** → click **"</>"** (Web)
5. Register the app (name it `sweet-orders-web`) — you'll see a config like this:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "sweet-orders-xxx.firebaseapp.com",
  projectId: "sweet-orders-xxx",
  storageBucket: "sweet-orders-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123...",
};
```

Copy these values — you'll need them in Step 3.

---

### Step 2 — Push to GitHub

1. Create a new repo on [github.com](https://github.com) (e.g. `sweet-orders`)
2. In this project folder, run:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/sweet-orders.git
git push -u origin main
```

---

### Step 3 — Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com) → **Sign up / Log in** (use GitHub)
2. Click **"Add New Project"** → import your `sweet-orders` repo
3. In **Environment Variables**, add these (from your Firebase config):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | your apiKey |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | your authDomain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | your projectId |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | your storageBucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | your messagingSenderId |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | your appId |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | your_secret_password |

4. Click **"Deploy"** — done! 🎉

Your app will be live at:
- `https://sweet-orders.vercel.app` — Customer order page
- `https://sweet-orders.vercel.app/admin` — Team login
- `https://sweet-orders.vercel.app/admin/dashboard` — Dashboard (after login)

---

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Copy the env template and fill in your Firebase values
cp .env.local .env.local   # already exists — just edit it

# Run locally
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
sweet-orders/
├── src/
│   ├── pages/
│   │   ├── index.js          ← Customer order form
│   │   ├── _app.js
│   │   └── admin/
│   │       ├── index.js      ← Admin login
│   │       └── dashboard.js  ← Admin dashboard
│   ├── components/
│   │   ├── Nav.js
│   │   └── Receipt.js
│   ├── lib/
│   │   ├── firebase.js       ← Firebase config
│   │   ├── orders.js         ← Firestore CRUD
│   │   ├── constants.js      ← Products, helpers
│   │   └── generatePDF.js    ← PDF receipt
│   └── styles/
│       └── globals.css
├── .env.local                ← Your Firebase keys (never commit!)
├── package.json
└── README.md
```

---

## ✏️ Customization

### Change products / prices
Edit `src/lib/constants.js` → `PRODUCTS` array

### Change bank/payment details
Edit `src/lib/constants.js` → `BUSINESS` object

### Change admin password
Update `NEXT_PUBLIC_ADMIN_PASSWORD` in Vercel environment variables

### Change business name / Instagram
Edit `src/lib/constants.js` → `BUSINESS.name`, `BUSINESS.instagram`

---

## 🔒 Security Note

The admin login uses a simple password stored in an environment variable.
For production, consider upgrading to Firebase Authentication.

---

Built with ❤️ for cake businesses
