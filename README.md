# 🛒 itsme.fashion: Project Requirements

This repository contains the core codebase for the **itsme.fashion** e-commerce platform. It is structured to follow professional development standards using a micro-services approach.

## 📌 Project Mission

Create a premium, clean-beauty e-commerce experience that is fast, secure, and intuitive for users.

---

## 🛠️ Required Tech Stack

The project must be built using:

* **Web Framework**: [Lit](https://lit.dev/) + [Vite](https://vitejs.dev/)
* **Backend Services**: Firebase (Functions, Auth, Storage, Remote Config)
* **Database**: Firestore Instance: **`st-db`**
* **Development Environment**: All features must be tested and verified using **Firebase Emulators**.

---

## 📂 System Architecture

To ensure scalability, the project follows a Service-Oriented structure:

```text
dev-ecom-test/
├── 📂 data/                     # Product dataset (CSV)
├── 📂 src/
│   ├── 📂 packages/             # Shared logic and UI tokens
│   │   ├── 🎨 design-system     # Reusable components
│   │   └── 🛠️ shared-utils      # Global types and helpers
│   └── 📂 services/             # Core Business Domains
│       ├── 🛍️ catalog           # Product browsing & search
│       ├── 🔑 identity          # User accounts and security
│       ├── 🛒 cart              # Basket and item persistence
│       ├── � payments          # Transaction logic (SIMULATED)
│       └── � delivery          # Shipping and tracking (SIMULATED)
```

---

## � Required Product Features

The following features must be implemented as per client requirements:

### 1. User Accounts & Security

* **Secure Authentication**: Support email and password-based registration and login.
* **User Profiles**: Allow users to manage their basic account data.

### 2. Product Discovery

* **Smart Catalog**: Display products using the provided `products.csv` dataset.
* **Ethics & Categories**: Users must be able to filter products by category and ethical markers (e.g., Vegan, Cruelty-free).
* **Rich Product Views**: Detailed pages showing ingredients, usage instructions, and shade selection using specific color hex codes.
* **Search**: A fast, keyword-based search for the entire catalog.

### 3. Shopping Experience

* **Persistent Cart**: Items added to the cart must persist across user sessions.
* **Wishlist**: Authenticated users should be able to save items to a personal "love" list.

### 4. Checkout & Fulfillment

* **One-Page Checkout**: A smooth flow to capture shipping addresses and select payment methods.
* **Payment Simulation**: Since we are in development, **DO NOT** use live payment SDKs. Create a simulator that mimics the behavior of a payment gateway (handling success, pending, and failure states).
* **Order Confirmation**: Generate a unique order record upon successful payment.
* **Shipping Simulation**: Create a logic to simulate order fulfillment. After an order is paid, generate a tracking ID and update the delivery status automatically (Simulating a carrier API).

---

## ⚠️ Important Implementation Rules

1. **Emulator First**: Development on live cloud resources is prohibited. Always run `firebase emulators:start`.
2. **External Integrations**: Payments (Cashfree) and Shipping (Shiprocket) must be **simulated**. Write internal logic to handle these triggers without installing their external SDKs.
3. **Data Discipline**: Use the provided `products.csv` in the `/data` folder as the definitive source for the product catalog.

---

**Database ID**: `st-db` | **Client Reference**: itsme.fashion PRD V1.1
