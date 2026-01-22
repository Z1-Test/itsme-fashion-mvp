// Import all pages
import "./pages/page-home.js";
import "./pages/page-products.js";
import "./pages/page-product-detail.js";
import "./pages/page-cart.js";
import "./pages/page-checkout.js";
import "./pages/page-login.js";
import "./pages/page-register.js";
import "./pages/page-profile.js";
import "./pages/page-orders.js";
import "./pages/page-wishlist.js";
import "./pages/page-not-found.js";

// Import app shell
import "./app-shell.js";

// Import and expose services globally for product-card component
import { cart, wishlist } from "./services";

// Make services globally accessible
(window as any).cartService = cart;
(window as any).wishlistService = wishlist;

console.log("🌐 Global services exposed:", { cart, wishlist });

// Mount app
const app = document.getElementById("app");
if (app) {
  const shell = document.createElement("app-shell");
  app.appendChild(shell);
}
