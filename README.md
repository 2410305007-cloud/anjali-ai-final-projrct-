# 🏋️ IronForge Athletics — E-Commerce Platform

> **Forge Your Strength. Define Your Legacy.**

A full-stack gym e-commerce web application for selling premium gym equipment, supplements, and apparel.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white)

---

## ✨ Features

- **User Authentication** — Register, login, JWT-based sessions, password reset via email
- **Product Catalog** — Browse, search, filter by category/price/rating, sort, pagination
- **Shopping Cart** — Server-side persistent cart with stock validation
- **Order Management** — Cart-to-order with database transactions, order history, cancellation
- **Stripe Payments** — PaymentIntent creation + webhook verification
- **Wishlist** — Toggle-based product bookmarking
- **Product Reviews** — Rate & review (1 per user per product), auto-updates product rating
- **Admin Dashboard** — Stats overview, recent orders, product CRUD
- **Email Notifications** — Welcome, password reset, order confirmation
- **Security** — Helmet, CORS, rate limiting, bcrypt hashing, input validation

---

## 🗂️ Project Structure

```
abcd/
├── backend/                # Node.js + Express REST API
│   ├── config/             # DB connection, email config
│   ├── controllers/        # Route handlers (auth, products, cart, orders, etc.)
│   ├── middleware/          # JWT auth, admin guard, error handler
│   ├── models/             # Database schema (auto-creates 8 tables)
│   ├── routes/             # Express route definitions
│   ├── utils/              # JWT generation, email templates
│   ├── server.js           # Entry point
│   └── package.json
├── frontend/               # React + Vite SPA
│   ├── src/
│   │   ├── components/     # Navbar, Footer, ProductCard, ProtectedRoute
│   │   ├── context/        # AuthContext, CartContext
│   │   ├── pages/          # Home, Products, ProductDetail, Cart, Login, Register, Profile, Orders, Wishlist
│   │   ├── utils/          # Axios API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── index.html              # Original landing page
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **MySQL** 8+
- **Stripe** account (for payments)

### 1. Clone the repo

```bash
git clone https://github.com/2410305007-cloud/anjali-ai-final-projrct-.git
cd anjali-ai-final-projrct-
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials, JWT secret, Stripe keys, etc.
npm install
npm run dev
```

The backend runs at `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000` and proxies API calls to the backend.

---

## 🔧 Environment Variables

Create a `backend/.env` file based on `.env.example`:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `DB_HOST` | MySQL host |
| `DB_USER` | MySQL user |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name (default: ironforge_db) |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRE` | Token expiry (default: 7d) |
| `CLIENT_URL` | Frontend URL for CORS + emails |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `EMAIL_USER` | Gmail address for Nodemailer |
| `EMAIL_PASS` | Gmail app password |

---

## 📡 API Endpoints

| Group | Method | Endpoint | Auth |
|-------|--------|----------|------|
| **Auth** | POST | `/api/auth/register` | ❌ |
| | POST | `/api/auth/login` | ❌ |
| | GET | `/api/auth/me` | ✅ |
| | PUT | `/api/auth/profile` | ✅ |
| **Products** | GET | `/api/products` | ❌ |
| | GET | `/api/products/featured` | ❌ |
| | GET | `/api/products/:id` | ❌ |
| | POST | `/api/products` | ✅ Admin |
| **Cart** | GET | `/api/cart` | ✅ |
| | POST | `/api/cart/add` | ✅ |
| **Orders** | POST | `/api/orders` | ✅ |
| | GET | `/api/orders` | ✅ |
| **Wishlist** | POST | `/api/wishlist/toggle` | ✅ |
| **Reviews** | GET | `/api/reviews/product/:id` | ❌ |
| | POST | `/api/reviews` | ✅ |
| **Payment** | POST | `/api/payment/create-payment-intent` | ✅ |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router, Axios, React Icons |
| Backend | Node.js, Express.js |
| Database | MySQL (mysql2/promise) |
| Auth | JWT, bcryptjs |
| Payments | Stripe |
| Email | Nodemailer |
| Security | Helmet, CORS, express-rate-limit, express-validator |

---

## 📄 License

This project is for educational purposes.

---

Built with ❤️ by **IronForge Athletics Team**
