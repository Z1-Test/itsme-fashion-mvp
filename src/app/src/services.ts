// TODO: Import services when they are fully implemented
// import { CatalogService } from "@itsme/service-catalog";
// import { IdentityService } from "@itsme/service-identity";
// import { CartService } from "@itsme/service-cart";
// import { PaymentService } from "@itsme/service-payments";
// import { DeliveryService } from "@itsme/service-delivery";
import { auth, functions } from "./firebase";
import { AuthService } from "./services/auth";
import { CartService } from "./services/cart";
import { WishlistService } from "./services/wishlist";
import { AddressService } from "./services/address";
import { NotificationService } from "@itsme/design-system";

console.log("🔧 SERVICES.TS LOADED");
console.log("🔧 Functions instance:", functions);

// Initialize Auth Service
export const authService = new AuthService(auth, functions);

// Initialize Cart Service
export const cartServiceInstance = new CartService(functions);

// Initialize Wishlist Service
console.log("🔧 Creating WishlistService instance...");
export const wishlistServiceInstance = new WishlistService(functions);
console.log("🔧 WishlistService instance created:", wishlistServiceInstance);

// Initialize Address Service
export const addressService = new AddressService(functions);

// Export Notification Service
export { NotificationService };

// TODO: Initialize all services when they are fully implemented
// export const catalogService = new CatalogService(db);
// export const identityService = new IdentityService(auth, db);
// export const paymentService = new PaymentService(db);
// export const deliveryService = new DeliveryService(db);

// Export for use in components (placeholders for now)
export const catalogService = null;
export const identityService = null;
export const paymentService = null;
export const deliveryService = null;

// Export for use in components
export {
  authService as auth,
  catalogService as catalog,
  identityService as identity,
  cartServiceInstance as cart,
  wishlistServiceInstance as wishlist,
  addressService as address,
  paymentService as payments,
  deliveryService as delivery,
};
