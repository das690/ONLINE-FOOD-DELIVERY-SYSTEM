# 🍔 FoodExpress - Full-Stack MERN Food Delivery System

An end-to-end food delivery web application built with the **MERN Stack** (MongoDB, Express, React 19, Node.js), **Socket.io** for real-time order tracking, **Redux Toolkit** for state management, **Tailwind CSS** for responsive design, and **Razorpay** integration.

---

## 🚀 Key Features

### 1. 🛡️ Enterprise Security & Architecture
- **Server-Side Price Recalculation**: Subtotals and discounts are always verified against database menu prices before creating orders, preventing client-side tampering.
- **Role-Based Access Control (RBAC)**: Strict role protection (`customer`, `restaurant_owner`, `admin`) with `restrictTo` middleware.
- **Admin Verification**: Registering as an admin requires a secret key (`GUVI-ADMIN`).
- **Input Validation & Token Expiry Protection**: Clean JWT authentication with 401 interceptors.
- **Isolated Database**: Runs on a dedicated MongoDB database (`food_delivery_db`).

### 2. 🛵 Real-Time Order Tracking & Live GPS Map
- **Socket.io Live Rooms**: Dedicated socket rooms (`order_${orderId}` and `restaurant_${restaurantId}`).
- **Interactive SVG Map**: Real-time animated delivery scooter traversing a custom route between the restaurant and customer home.
- **Live Status Stepper**: Order Placed ➔ Confirmed ➔ Kitchen Preparing ➔ Out for Delivery ➔ Delivered.
- **Delivery Partner Profile**: Partner photo, name, rating, vehicle number, and quick call button.

### 3. 🍕 Swiggy / Zomato Modern UI & UX
- **"What's on your mind?" Story Carousel**: Quick-filter by popular food cravings (Biryani, Pizza, North Indian, Burgers, Chinese, South Indian, Desserts, Healthy Bowls).
- **Filter Bar**: Instant filters for Pure Veg, Fast Delivery (<30 min), 4.0+ Star Ratings, and Sort by Cost/Rating.
- **Multi-Restaurant Cart Conflict Detection**: Pure Redux state modal warns users before replacing their cart with dishes from another restaurant (no intrusive browser `alert()`).
- **Interactive Menu Cards**: Quantity counters directly on dish cards (`- [qty] +`).

### 4. 💳 Flexible Payments & Offers
- **Razorpay Online Payments**: Online payments with automated test fallback simulator.
- **Cash on Delivery (COD)**: Order placement with confetti celebration.
- **Instant Demo UPI**: One-click test payment simulation.
- **Active Promotional Coupons**:
  - `WELCOME50`: 50% OFF up to ₹150 (Min. order ₹199)
  - `FOODIE30`: 30% OFF up to ₹100 (Min. order ₹149)
  - `FREESHIP`: 100% OFF delivery fee (Min. order ₹199)
  - `FESTIVE20`: 20% OFF up to ₹200 (Min. order ₹299)

### 5. 👥 Role-Based Dashboards
- **Customer View**:
  - Full order history with "Track Live" and "Reorder" buttons.
  - Saved Delivery Addresses management.
  - Account Profile update (Name, Phone).
  - Saved Favorite Restaurants.
- **Restaurant Owner / Admin View**:
  - Live KPI metrics (Total Orders, Total Revenue, Active Orders, Average Rating).
  - Live Kitchen Order Manager with status transition buttons ("Accept" ➔ "Start Cooking" ➔ "Dispatch" ➔ "Delivered").
  - Add New Dish to Restaurant Menu.

---

## 🔑 Demo Test Accounts

You can use the **One-Click Quick Login** buttons on the login page or use these credentials:

| Role | Email | Password |
|---|---|---|
| **Customer** | `customer.demo@foodexpress.com` | `Demo@1234` |
| **Restaurant Owner** | `owner.demo@foodexpress.com` | `Demo@1234` |
| **Super Admin** | `admin.demo@foodexpress.com` | `Demo@1234` |

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas (configured in `BACKEND/.env`)

### 2. Backend Setup
```bash
cd BACKEND
npm install
node scripts/seedData.js   # Seeds 8 restaurants, demo users, coupons & reviews
npm run dev               # Starts server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd FRONTEND
npm install
npm run dev               # Starts Vite dev server on http://localhost:5173
```

---

## 🧪 Verification & Testing

To run the automated backend integration test suite:
```bash
cd BACKEND
node scripts/verifyFullApp.js
```
Expected output:
```
1. Health Check: ✅ PASSED
2. Fetch Restaurants: ✅ PASSED
3. Single Restaurant & Menu: ✅ PASSED
4. Fetch Coupons: ✅ PASSED
5. Demo Customer Login: ✅ PASSED
6. Demo Owner Login: ✅ PASSED
7. Demo Admin Login: ✅ PASSED
8. Authenticated Profile: ✅ PASSED
9. Place Order with Coupon & Recalculation: ✅ PASSED
10. Order Tracking Endpoint: ✅ PASSED
```

