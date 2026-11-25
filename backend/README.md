# IronForge Athletics — Backend API

A complete REST API for the IronForge Athletics gym e-commerce website built with **Node.js**, **Express**, and **MySQL**.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup Environment Variables
```bash
copy .env.example .env
```
Edit `.env` with your actual values:
- MySQL credentials (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`)
- JWT secret (`JWT_SECRET`)
- Gmail credentials (`EMAIL_USER`, `EMAIL_PASS`)
- Stripe keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)

### 3. Create MySQL Database
```sql
CREATE DATABASE ironforge_db;
```
> Tables are created automatically on server start!

### 4. Start the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at: **http://localhost:5000**

---

## 📡 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | ❌ |
| POST | `/login` | Login user | ❌ |
| GET | `/me` | Get current user | ✅ |
| PUT | `/profile` | Update profile | ✅ |
| PUT | `/change-password` | Change password | ✅ |
| POST | `/forgot-password` | Send reset email | ❌ |
| POST | `/reset-password/:token` | Reset password | ❌ |

### Products — `/api/products`
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | All products (filter, sort, paginate) |
| GET | `/featured` | Featured products |
| GET | `/category/:slug` | Products by category |
| GET | `/:id` | Single product |

**Query params:** `?category=weights&minPrice=10&maxPrice=100&sort=price_asc&page=1&limit=12&search=dumbbell`

### Cart — `/api/cart` 🔒
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get cart |
| POST | `/add` | Add item |
| PUT | `/update/:id` | Update quantity |
| DELETE | `/remove/:id` | Remove item |
| DELETE | `/clear` | Clear cart |

### Orders — `/api/orders` 🔒
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create order from cart |
| GET | `/` | Order history |
| GET | `/:id` | Single order |
| PUT | `/:id/cancel` | Cancel order |

### Wishlist — `/api/wishlist` 🔒
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get wishlist |
| POST | `/toggle` | Toggle item |
| DELETE | `/:productId` | Remove item |

### Reviews — `/api/reviews`
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/product/:productId` | Product reviews | ❌ |
| POST | `/` | Add review | ✅ |
| PUT | `/:id` | Update review | ✅ |
| DELETE | `/:id` | Delete review | ✅ |

### Payment — `/api/payment` 🔒
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/create-payment-intent` | Create Stripe intent |
| POST | `/confirm` | Confirm payment |
| POST | `/webhook` | Stripe webhook |

### Admin — `/api/admin` 🔒👑
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Dashboard stats |
| GET | `/recent-orders` | Last 10 orders |
| CRUD | `/products` | Manage products |
| CRUD | `/orders` | Manage orders |
| CRUD | `/users` | Manage users |
| CRUD | `/categories` | Manage categories |

---

## 🔑 Authentication

Use JWT Bearer token in headers:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📁 Project Structure
```
backend/
├── server.js              ← Main entry point
├── package.json
├── .env.example
├── config/
│   ├── db.js              ← MySQL pool
│   └── email.js           ← Nodemailer
├── middleware/
│   ├── auth.js            ← JWT guard
│   ├── admin.js           ← Admin role guard
│   └── errorHandler.js    ← Global errors
├── models/
│   └── index.js           ← DB schema + seeder
├── routes/                ← 8 route files
├── controllers/           ← 8 controller files
├── utils/
│   ├── generateToken.js
│   └── sendEmail.js       ← Email templates
└── uploads/               ← Product images
```

---

## 🛠️ Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (mysql2)
- **Auth**: JWT + bcryptjs
- **Email**: Nodemailer (Gmail)
- **Payment**: Stripe
- **Security**: Helmet, CORS, Rate Limiting
