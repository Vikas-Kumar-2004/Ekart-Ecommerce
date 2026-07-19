# Ekart E-Commerce Platform - Product Requirements Document (PRD)

## 1. Project Overview and Objectives
**Ekart** is a full-stack, responsive e-commerce web application that enables users to browse products, manage their shopping carts, place orders, and track their purchase history. It also features a robust administrative dashboard for managing products, users, and orders, alongside tracking sales metrics.

**Objectives:**
- Provide a seamless and modern shopping experience for guests and registered users.
- Facilitate secure online payments via Razorpay integration.
- Ensure high-performance backend operations using Go (Golang).
- Offer a scalable and maintainable architecture using a decoupled frontend (React) and backend (Go).

---

## 2. Features and Modules

### 2.1 User & Authentication Module
- **Guest Experience**: Guests can browse products, but attempting to add items to the cart or accessing profiles triggers a custom authentication modal (prompting Login or WhatsApp inquiry).
- **Authentication**: JWT-based secure authentication. Registration requires email and password.
- **Profile Management**: Users can view and manage their personal information.
- **Session Management**: Secure storage of access and refresh tokens.

### 2.2 Product Module
- **Product Listing**: Browse products with categories and brands.
- **Product Details**: View rich product descriptions, pricing, and multiple images.
- **Reviews & Ratings**: Logged-in users can rate and leave comments on products.
- **WhatsApp Inquiry**: Direct WhatsApp integration for product inquiries.

### 2.3 Cart & Checkout Module
- **Persistent Cart**: Authenticated users have their cart state persisted in the database.
- **Auto-Add on Login**: If a guest adds an item to the cart, the system preserves their intent and automatically adds it to their cart upon successful login/registration.
- **Checkout Flow**: Multi-step checkout process (Address -> Payment).
- **Payment Gateway**: Integration with Razorpay for secure online transactions.

### 2.4 Order Management
- **Order Tracking**: Users can track the status of their orders (Pending, Processing, Shipped, Delivered, etc.).
- **Invoices**: Automatically generated PDF invoices for successful orders.

### 2.5 Admin Module (Role-Based Access Control)
- **Dashboard**: High-level metrics, total sales, recent orders.
- **Product Management**: Add, update, and delete products and upload images (via Cloudinary).
- **Order Management**: View all orders across the platform and update their fulfillment statuses.
- **User Management**: View user details and order histories.
- **Admin Management**: Admins can securely create new admin accounts.

---

## 3. Database Schema (PostgreSQL)

The application uses PostgreSQL with raw SQL queries via `jackc/pgx/v5` (GORM is **not** used).

### 3.1 Tables & Entity Relationship (ERD Summary)

* **`users`**
  - `id` (UUID, Primary Key)
  - `first_name`, `last_name`, `email`, `password`, `role` (user/admin)
  - `profile_pic`, `profile_pic_public_id`
  - `address`, `city`, `zip_code`, `phone_no`
  - `created_at`, `updated_at`

* **`sessions`**
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key -> `users.id`)
  - `refresh_token`, `is_active`, `expires_at`

* **`products`**
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key -> `users.id` - Admin who created it)
  - `product_name`, `product_desc`, `product_price`, `category`, `brand`

* **`product_images`**
  - `id` (UUID, Primary Key)
  - `product_id` (UUID, Foreign Key -> `products.id` - Cascade Delete)
  - `url`, `public_id` (Cloudinary references)

* **`carts`**
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key -> `users.id`)
  - `total_price`

* **`cart_items`**
  - `id` (UUID, Primary Key)
  - `cart_id` (UUID, Foreign Key -> `carts.id` - Cascade Delete)
  - `product_id` (UUID, Foreign Key -> `products.id`)
  - `quantity`, `price`

* **`orders`**
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key -> `users.id`)
  - `amount`, `tax`, `shipping`, `currency`, `status`
  - `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`

* **`order_items`**
  - `id` (UUID, Primary Key)
  - `order_id` (UUID, Foreign Key -> `orders.id` - Cascade Delete)
  - `product_id` (UUID, Foreign Key -> `products.id`)
  - `quantity`, `price`, `product_name`

* **`reviews`**
  - `id` (UUID, Primary Key)
  - `product_id` (UUID, Foreign Key -> `products.id`)
  - `user_id` (UUID, Foreign Key -> `users.id`)
  - `rating`, `comment`

---

## 4. Backend Architecture (Go)

The backend is built with **Go** and **Gin Web Framework**. It follows a clean architecture pattern (Handler -> Service -> Repository).

### 4.1 Folder Structure
```text
backend/
├── cmd/api/main.go            # Application entry point
├── configs/                   # Database and environment configurations
├── docs/                      # Swagger API documentation
├── internal/
│   ├── bootstrap/             # App initialization and router setup
│   ├── cart/                  # Cart module (handler, service, repo, models)
│   ├── dashboard/             # Admin dashboard module
│   ├── database/              # Database migration logic
│   ├── middleware/            # Auth, Roles, Logger, RateLimiter, Recovery
│   ├── order/                 # Order module
│   ├── product/               # Product module
│   ├── review/                # Review module
│   ├── session/               # JWT Session module
│   ├── shared/                # Shared constants, errors, response utils
│   ├── user/                  # User & Authentication module
│   └── utils/                 # Cloudinary, JWT parsing, Razorpay instances
```

### 4.2 Key Technical Decisions
- **Database Driver:** Uses `github.com/jackc/pgx/v5/pgxpool` for high-performance PostgreSQL connection pooling.
- **Authentication:** `golang-jwt/jwt/v5` for creating Access Tokens.
- **Middleware:** Custom middlewares for `Authentication()`, `IsAdmin()`, Rate Limiting, and CORS.
- **File Uploads:** Uses `multipart/form-data` parsed in the Handlers, passed as buffers to Cloudinary via `cloudinary-go`. Multer is a Node.js concept; Go handles this natively via `*multipart.FileHeader`.

---

## 5. Frontend Architecture (React)

The frontend is a Single Page Application (SPA) built with **React**, **Vite**, and **Tailwind CSS**.

### 5.1 Folder Structure
```text
frontend/
├── public/                    # Static assets and Netlify _redirects
├── src/
│   ├── assets/                # Images and SVGs
│   ├── components/            # Reusable UI (Navbar, Footer, Modals)
│   │   └── ui/                # Shadcn-like base UI components
│   ├── lib/                   # Utility functions
│   ├── pages/                 # Route-level components (Home, Login, Admin views)
│   ├── redux/                 # Redux Toolkit store (userSlice, productSlice)
│   ├── utils/                 # Axios interceptors, PDF Invoice Generators
│   ├── App.jsx                # React Router setup & Backend Polling
│   └── main.jsx               # React DOM rendering
```

### 5.2 Key Technical Decisions
- **State Management:** **Redux Toolkit** is used to manage global `user` (authentication state) and `cart` (cart items).
- **Routing:** `react-router-dom` v6 (`createBrowserRouter`).
- **Protection:** `<ProtectedRoute>` wrapper components prevent unauthorized access to specific routes (e.g., `/cart`, `/checkout`) and use the `adminOnly` prop for dashboard routes.
- **UI Framework:** **Tailwind CSS** combined with custom Shadcn-like generic components (`Button`, `Card`, `Input`).
- **Loading State:** `SplashScreen` component is used during initial load to wait for the backend free-tier cold starts.

---

## 6. Technologies and Libraries

### 6.1 Frontend
- **React 18** (Vite)
- **Redux Toolkit** (State management)
- **React Router DOM** (Client-side routing)
- **Tailwind CSS** (Styling)
- **Axios** (API Requests)
- **Lucide React / React Icons** (Iconography)
- **Sonner** (Toast notifications)
- **jspdf / jspdf-autotable** (Invoice generation)

### 6.2 Backend
- **Go 1.26**
- **Gin Web Framework** (`github.com/gin-gonic/gin`)
- **PostgreSQL Driver** (`github.com/jackc/pgx/v5`)
- **Cloudinary SDK** (`github.com/cloudinary/cloudinary-go/v2`)
- **Razorpay SDK** (`github.com/razorpay/razorpay-go`)
- **JWT** (`github.com/golang-jwt/jwt/v5`)
- **Swagger** (`swaggo/swag` & `gin-swagger`)

---

## 7. Deployment Architecture

- **Frontend Hosting:** **Netlify**. 
  - *Note:* A `_redirects` file (`/* /index.html 200`) is utilized to ensure React Router handles paths on manual page refreshes, preventing 404 errors.
- **Backend Hosting:** **Railway** (Free Tier).
  - *Note:* Because free-tier servers sleep after inactivity, the frontend `App.jsx` features a startup polling mechanism (`/health`) that displays a Splash Screen until the backend wakes up.
- **Database:** Hosted PostgreSQL instance.
- **Media Storage:** **Cloudinary** (Direct upload from Go backend).

---

## 8. Application Flows

### 8.1 Guest to Checkout Flow
1. Guest browses `/products`.
2. Guest clicks "Add to Cart" -> Custom Modal prompts them to Login.
3. User selects "Login", intent (`productId`, `quantity`) is saved to `localStorage`.
4. User completes Login/Registration.
5. Frontend detects intent, silently triggers API to add item to cart, and redirects user directly to `/cart` replacing history.
6. User clicks Checkout -> Fill Address -> Select Razorpay -> Payment verified via Webhook/Signature -> Order Success.

### 8.2 Admin Flow
1. Admin logs in. `IsAdmin` middleware validates JWT role.
2. Navigates to `/dashboard`.
3. Can access `/dashboard/add-product`. Submits `multipart/form-data`.
4. Backend uploads image to Cloudinary, saves Cloudinary URLs to `product_images` table, and saves Product to DB.
5. Admin can update Order statuses (e.g., Pending -> Shipped) via `/dashboard/orders`.

---

## 9. Future Improvements & Scalability

- **Caching:** Integrate Redis to cache frequent queries (e.g., product listings, category trees).
- **Pagination:** Implement cursor-based pagination for Products and Orders to handle large datasets seamlessly.
- **Search Optimization:** Introduce Full-Text Search (FTS) in PostgreSQL or Elasticsearch for advanced product searching.
- **Email/SMS Notifications:** Integrate SendGrid/Twilio to send users real-time updates on their order statuses (Shipped, Delivered).
- **Refund Flow:** Automate Razorpay refunds if an order is canceled prior to shipping.
- **RBAC Enhancements:** Extend the static "admin" role into granular permissions (e.g., SuperAdmin, InventoryManager, Support).
