# SAPORI CAFÉ & EATERY — Full-Stack FoodTech Platform

> **A Place to Pause, Sip & Savour**  
> **Food • Coffee • Good Vibes**  
> *217/1, Ramgali Number 1, Near Panchwati Circle, Raja Park, Jaipur, Rajasthan, India*  
> *Telephone & WhatsApp: +91 63673 73302*

---

## 1. Project Overview

**SAPORI CAFÉ & EATERY** is an enterprise-grade, mobile-first hospitality platform developed with **Next.js 15 (App Router)**, **TypeScript (Strict Mode)**, and **Tailwind CSS**.

### Strict Brand Color Palette
Per the strict design system, the interface is engineered exclusively with these three colors:
- **Primary Green:** `#15370D` (Brand identity, typography, buttons, footer, sidebar)
- **Premium Cream:** `#F5EFE1` (Hero section, warm editorial backgrounds, badge accents)
- **Pure White:** `#FFFFFF` (Product cards, input surfaces, workspace modals)

---

## 2. Core Functional Modules

1. **Responsive Customer Website**
   - **Hero Experience:** Cinematic headline, pillars, and direct menu/reservation CTAs.
   - **Full Menu (`/menu`):** Search, real-time category filtering, dietary indicators (Veg/Vegan, Signature, Spicy), sorting.
   - **Product Detail (`/menu/[slug]`):** Customizer for pizza add-ons (Fresh Mozzarella, Grated Parmesan), chef preparation notes.
   - **Interactive Basket & Drawer:** Real-time quantity adjustments, dining mode switcher, promo code engine.
   - **Secure Checkout (`/checkout`):** Server-side price recalculation, order validation, delivery address & table context.
   - **Live Order Tracking (`/orders/[id]/track`):** Step-by-step kitchen status machine (`PLACED` ➔ `ACCEPTED` ➔ `PREPARING` ➔ `READY` ➔ `COMPLETED`).
   - **Table Reservations (`/reservations`):** Real conflict detection, booking reference generation (`RES-XXXXXX`).
   - **QR Dine-In System (`/table/[tableNumber]`):** Table context binding with direct order dispatch to the kitchen.
   - **Reviews & Story:** Genuine guest reviews (`/reviews`), photo gallery (`/gallery`), and our 48-hour slow fermentation philosophy (`/story`).

2. **Operations & Admin Portal (`/admin`)**
   - **Dashboard Overview (`/admin`):** Real aggregated metrics (Today's revenue, order distribution, bestsellers, active orders).
   - **Kitchen Display System (`/admin/kitchen`):** Ticket management with age timers, priority highlights, status transitions, and chime toggle.
   - **Live Orders (`/admin/orders`):** Filter by status & mode, real-time status update, customer and item snapshots.
   - **Menu Management (`/admin/menu`):** Instant CRUD, pricing adjustments, in-stock/sold-out toggles without redeployment.
   - **Category CMS (`/admin/categories`):** Taxonomy management.
   - **Dining Tables & QR (`/admin/tables`):** Physical table state control (available, occupied, cleaning) and QR code preview.
   - **Reservations Roster (`/admin/reservations`):** Accept, cancel, or mark arrived.
   - **Offers & Promo Engine (`/admin/coupons`):** Percentage & fixed discounts, min order value, max discount caps.
   - **Reputation & Moderation (`/admin/reviews`):** Reply to customer reviews.
   - **Business Settings (`/admin/settings`):** Configurable packaging fee, delivery fee rules, GST rate (default 5%), contact numbers.
   - **Compliance Audit Trail (`/admin/audit`):** Cryptographic log of all pricing, status, and administrative operations.

---

## 3. Technology Stack

- **Framework:** Next.js 15 (App Router, Server Components + Route Handlers)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS (Strict 3-color palette variables)
- **Icons:** Lucide React
- **Database:** Resilient persistent file store with seamless MongoDB Atlas driver support
- **State Machine:** Deterministic order and payment transitions with mode enforcement
- **Testing:** Vitest automated test suite (Calculations, State Transitions, Discounts)

---

## 4. Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v22.14)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd "sapori cafe"

# Install dependencies
npm install

# Run automated tests
npm test

# Start development server
npm run dev
```

Visit `http://localhost:3000` to browse the customer platform.  
Visit `http://localhost:3000/admin` to access the operations portal.

---

## 5. Official Sapori Menu Checklist

Imported verbatim from the official Sapori Café menu PDF with original base prices:

- **Frites:** Classic Salted (149), Peri-Peri Seasoned (169), Loaded Fries (295), Truffle & Parmesan (349)
- **Panuozzo / Sandwiches:** Crispy Paneer Caesar (345), Caprese Mozzarella (365)
- **Neapolitan Pizzas:** Classic Margherita (395), Makhani (475), Spicy Jalapeño & Capsicum (425), Pesto Stracciatella (565), Firecracker (455), Pesto Forest (525), Chipotle Zest (465), Garden Green (485), Truffle Mushroom (645)
- **Pizza Add-ons:** Fresh Mozzarella (+65), Grated Parmesan (+65)
- **Bakery & Desserts:** Butter Croissant (295), Classic Butter Biscuit (59), Fudge Brownie (179), Tiramisu Brownie (249), Double Chocolate Cookie (119), Crème Brûlée Toast (295), Vietnamese Coffee Tiramisu (279), OG French Toast (245), Molten Choco Cookie Sundae (199)
- **Cold Brews & Tonics:** Crème Brûlée Custard (260), Tiramisu Cream (250), Cold Brew Tonic (220), Espresso Tonic (210), Grapefruit Cold Brew Tonic (230), Rum & Whiskey Barrel-Aged (270 - alcohol free)
- **Espresso Bar & Classics:** Espresso (140), Americano (160), Cappuccino (190), Café Latte (200), Flat White (210), Spanish Latte (230), Hazelnut & Custard Iced Latte (240), Iced Spanish Latte (240), Iced Caramel Macchiato (240), Iced Vietnamese Coffee (230), Mocha Tiramisu Latte (250), Iced/Hot Chocolate (220)
- **Frappés & Shakes:** Tiramisu Affogato Caramel (270), Nutella Fudge Shake (260), Biscoff & Salted Caramel Shake (270), Vanilla Custard Shake (240), Biscoff Frappe (310), Nutella Frappe (310), Hazelnut Frappe (280), Vanilla Frappe (240)
- **Smoothies, Sodas & Mojitos:** Berry Custard Cream Smoothie (250), Dark Chocolate Ganache Smoothie (230), Clarified Strawberry & Basil Sparkler (220), Peach & Thyme Mojito (200), Kaffir Lime & Thai Basil Mojito (210), Masala Lemonade (160), Fresh Lime Soda (140)

---

## 6. Security & Financial Integrity

- **Server-Side Price Validation:** Final order amounts are strictly computed from database prices; client-sent subtotals are never trusted.
- **Idempotent State Machine:** Disallows invalid transitions (e.g. jumping from `PLACED` to `COMPLETED`).
- **Mode Isolation:** Enforces mode-appropriate final states (`READY_FOR_PICKUP` for pickup, `READY_TO_SERVE` for dine-in, `OUT_FOR_DELIVERY` for delivery).
- **Payment Verification:** Cryptographic HMAC signature checking for Razorpay, with graceful sandbox simulation testing mode when keys are not configured.
