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

// Mount app
const app = document.getElementById("app");
if (app) {
  const shell = document.createElement("app-shell");
  app.appendChild(shell);
}
