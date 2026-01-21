import { initializeApp } from "firebase-admin/app";

// Initialize Firebase Admin SDK once for all services
initializeApp();

export { addToCart, removeFromCart, clearCart } from "./src/services/cart/src/index";
export { catalog } from "./src/services/catalog/src/index";
export { payments } from "./src/services/payments/src/index";
export { delivery } from "./src/services/delivery/src/index";
export { addToWishList, removeFromWishList } from "./src/services/wishList/src/index";
export { registerUser } from "./src/services/identity/src/index";