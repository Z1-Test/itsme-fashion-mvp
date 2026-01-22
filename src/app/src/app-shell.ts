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
      overflow-x: hidden;
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
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-size: 1.25rem;
      font-weight: 700;
      color: #000;
      text-decoration: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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
      white-space: nowrap;
    }

    nav a:hover {
      color: #000;
    }

    .user-menu {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .menu-toggle {
      display: none;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
      margin-right: -0.5rem;
    }

    .mobile-nav {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border-bottom: 1px solid #e5e5e5;
      padding: 1rem;
      flex-direction: column;
      gap: 1rem;
      z-index: 99;
    }

    .mobile-nav.open {
      display: flex;
    }

    .mobile-nav a,
    .mobile-nav > div {
      color: #333;
      text-decoration: none;
      font-weight: 500;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .mobile-nav a:last-child,
    .mobile-nav > div:last-child {
      border-bottom: none;
    }

    main {
      flex: 1;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      width: 100%;
      overflow-x: hidden;
      box-sizing: border-box;
    }

    footer {
      background: #f5f5f5;
      padding: 2rem 1.5rem;
      text-align: center;
      color: #666;
      margin-top: auto;
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .header-content {
        padding: 1rem 1rem;
      }

      .logo {
        font-size: 1.1rem;
      }

      nav {
        display: none;
      }

      .menu-toggle {
        display: block;
      }

      main {
        padding: 1.5rem 1rem;
        width: 100%;
        box-sizing: border-box;
      }

      footer {
        padding: 1.5rem 1rem;
      }
    }

    @media (max-width: 480px) {
      .header-content {
        padding: 0.75rem 0.5rem;
      }

      .logo {
        font-size: 1rem;
      }

      main {
        padding: 1rem 0.75rem;
        width: 100%;
        box-sizing: border-box;
      }

      footer {
        padding: 1rem 0.75rem;
      }
    }
  `;

  @state() private currentUser: MockUser | null = null;
  @state() private mobileMenuOpen = false;

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
          <button class="menu-toggle" @click=${this._toggleMobileMenu}>
            ${this.mobileMenuOpen ? "✕" : "☰"}
          </button>
          <nav>
            <a href="/products">Products</a>
            <a href="/cart">Cart</a>
            <a href="/wishlist">Wishlist</a>
            ${this.currentUser
              ? html`
                  <div class="user-menu">
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
        <div class="mobile-nav ${this.mobileMenuOpen ? "open" : ""}">
          <a href="/products" @click=${this._closeMobileMenu}>Products</a>
          <a href="/cart" @click=${this._closeMobileMenu}>Cart</a>
          <a href="/wishlist" @click=${this._closeMobileMenu}>Wishlist</a>
          ${this.currentUser
            ? html`
                <a href="/profile" @click=${this._closeMobileMenu}>Profile</a>
                <itsme-button
                  size="small"
                  @itsme-click=${this._handleLogoutMobile}
                >
                  Logout
                </itsme-button>
              `
            : html`
                <a href="/login" @click=${this._closeMobileMenu}>Login</a>
                <a href="/register" @click=${this._closeMobileMenu}>Register</a>
              `}
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

  private _toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  private _closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  private async _handleLogout() {
    localStorage.removeItem("user");
    this.currentUser = null;
    window.location.href = "/";
  }

  private async _handleLogoutMobile() {
    this._closeMobileMenu();
    await this._handleLogout();
  }
}
