import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { Router } from "@vaadin/router";
// Import design system components directly from source to ensure they're registered
import "../../packages/design-system/src/button";
import "../../packages/design-system/src/input";
import "../../packages/design-system/src/product-card";
import "../../packages/design-system/src/toast-notification";

interface MockUser {
  email: string;
  displayName: string;
}

@customElement("app-shell")
export class AppShell extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }

    header {
      background: #fff;
      border-bottom: 1px solid #e5e5e5;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: #000;
      text-decoration: none;
    }

    nav {
      display: flex;
      gap: 2rem;
      align-items: center;
    }

    nav a {
      color: #333;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }

    nav a:hover {
      color: #000;
    }

    .user-menu {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    main {
      flex: 1;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      width: 100%;
    }

    footer {
      background: #f5f5f5;
      padding: 2rem;
      text-align: center;
      color: #666;
      margin-top: auto;
    }
  `;

  @state() private currentUser: MockUser | null = null;

  connectedCallback() {
    super.connectedCallback();

    // Load user from localStorage
    this._loadUser();

    // Listen for storage changes (login/logout from other tabs)
    window.addEventListener("storage", this._loadUser.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("storage", this._loadUser.bind(this));
  }

  private _loadUser() {
    const userData = localStorage.getItem("user");
    if (userData) {
      this.currentUser = JSON.parse(userData);
    } else {
      this.currentUser = null;
    }
  }

  firstUpdated() {
    // Initialize router
    const outlet = this.shadowRoot?.querySelector("#outlet");
    if (outlet) {
      const router = new Router(outlet);
      router.setRoutes([
        { path: "/", component: "page-home" },
        { path: "/products", component: "page-products" },
        { path: "/product/:id", component: "page-product-detail" },
        { path: "/cart", component: "page-cart" },
        { path: "/checkout", component: "page-checkout" },
        { path: "/login", component: "page-login" },
        { path: "/register", component: "page-register" },
        { path: "/profile", component: "page-profile" },
        { path: "/orders", component: "page-orders" },
        { path: "/wishlist", component: "page-wishlist" },
        { path: "(.*)", component: "page-not-found" },
      ]);
    }
  }

  render() {
    return html`
      <header>
        <div class="header-content">
          <a href="/" class="logo">itsme.fashion</a>
          <nav>
            <a href="/products">Products</a>
            <a href="/cart">Cart</a>
            ${this.currentUser
              ? html`
                  <div class="user-menu">
                    <a href="/orders">Orders</a>
                    <a href="/wishlist">Wishlist</a>
                    <a href="/profile">Profile</a>
                    <itsme-button
                      size="small"
                      @itsme-click=${this._handleLogout}
                    >
                      Logout
                    </itsme-button>
                  </div>
                `
              : html`
                  <div class="user-menu">
                    <a href="/login">Login</a>
                    <a href="/register">Register</a>
                  </div>
                `}
          </nav>
        </div>
      </header>

      <main id="outlet"></main>

      <footer>
        <p>&copy; 2026 itsme.fashion - Premium Clean Beauty</p>
        <p>Vegan • Cruelty-Free • Sustainable</p>
      </footer>

      <toast-notification></toast-notification>
    `;
  }

  private async _handleLogout() {
    localStorage.removeItem("user");
    this.currentUser = null;
    window.location.href = "/";
  }
}
