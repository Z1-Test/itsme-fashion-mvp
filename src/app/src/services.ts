// TODO: Import services when they are fully implemented
// import { CatalogService } from "@itsme/service-catalog";
// import { IdentityService } from "@itsme/service-identity";
// import { CartService } from "@itsme/service-cart";
// import { PaymentService } from "@itsme/service-payments";
// import { DeliveryService } from "@itsme/service-delivery";
import { auth, functions } from "./firebase";
import { AuthService } from "./services/auth";

// Initialize Auth Service
export const authService = new AuthService(auth, functions);

// TODO: Initialize all services when they are fully implemented
// export const catalogService = new CatalogService(db);
// export const identityService = new IdentityService(auth, db);
// export const cartService = new CartService(db);
// export const paymentService = new PaymentService(db);
// export const deliveryService = new DeliveryService(db);

// Export for use in components (placeholders for now)
export const catalogService = null;
export const identityService = null;
export const cartService = null;
export const paymentService = null;
export const deliveryService = null;

// Export for use in components
export {
  authService as auth,
  catalogService as catalog,
  identityService as identity,
  cartService as cart,
  paymentService as payments,
  deliveryService as delivery,
};
