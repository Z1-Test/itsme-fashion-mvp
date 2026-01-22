import { initializeApp } from "firebase-admin/app";

// Initialize Firebase Admin SDK once for all services
initializeApp();

// Cart Service
export { addToCart, removeFromCart, clearCart, getCart } from "./src/services/cart/src/index";

// Catalog Service
export { getAllProducts, getProductsByCategory, getProductById } from "./src/services/catalog/src/index";

// Delivery Service
export { delivery } from "./src/services/delivery/src/index";

// Identity Service
export { registerUser, saveAddress, getAddresses } from "./src/services/identity/src/index";

// Payments Service
export { payments } from "./src/services/payments/src/index";

// WishList Service
export { addToWishList, removeFromWishList, getWishList } from "./src/services/wishList/src/index";
