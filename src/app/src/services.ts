import { CatalogService } from "@itsme/catalog";
import { IdentityService } from "@itsme/identity";
import { CartService } from "@itsme/cart";
import { PaymentService } from "@itsme/payments";
import { DeliveryService } from "@itsme/delivery";
import { auth, db } from "./firebase";

// Initialize all services
export const catalogService = new CatalogService(db);
export const identityService = new IdentityService(auth, db);
export const cartService = new CartService(db);
export const paymentService = new PaymentService(db);
export const deliveryService = new DeliveryService(db);

// Export for use in components
export {
  catalogService as catalog,
  identityService as identity,
  cartService as cart,
  paymentService as payments,
  deliveryService as delivery,
};
