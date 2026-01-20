import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { Product } from "@itsme/shared-utils";
import { formatCurrency } from "@itsme/shared-utils";
import { NotificationService } from "./notification-service";

@customElement("itsme-product-card")
export class ItsmeProductCard extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .card {
      border: 1px solid #e5e5e5;
      border-radius: 0.5rem;
      overflow: hidden;
      transition: box-shadow 0.2s ease;
      cursor: pointer;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .image-container {
      position: relative;
      width: 100%;
      padding-top: 100%;
      background-color: #f5f5f5;
      overflow: hidden;
    }

    .image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .wishlist-btn {
      position: absolute;
      top: 0.75rem;
      left: 0.75rem;
      width: 2.5rem;
      height: 2.5rem;
      border: none;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      padding: 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      z-index: 2;
    }

    .wishlist-btn:hover {
      background: white;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
    }

    .heart-icon {
      width: 1.25rem;
      height: 1.25rem;
      transition: all 0.2s ease;
    }

    .wishlist-btn.wishlisted .heart-icon path {
      fill: #dc2626;
      stroke: none;
    }

    .wishlist-btn.wishlisted .heart-icon {
      filter: drop-shadow(0 2px 4px rgba(220, 38, 38, 0.3));
    }

    .wishlist-btn:not(.wishlisted) .heart-icon path {
      fill: none;
      stroke: #000;
      stroke-width: 2;
    }

    .ethical-badges {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      display: flex;
      gap: 0.25rem;
      flex-direction: column;
    }

    .badge {
      background-color: rgba(255, 255, 255, 0.9);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .content {
      padding: 1rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .brand {
      font-size: 0.875rem;
      color: #666;
      margin-bottom: 0.25rem;
    }

    .name {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }

    .price {
      font-size: 1.125rem;
      font-weight: 700;
      margin-top: auto;
    }

    .stock-indicator {
      font-size: 0.875rem;
      color: #dc2626;
      margin-top: 0.5rem;
    }

    .cart-controls {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 0;
      border: 1px solid #e5e5e5;
      border-radius: 0.375rem;
      height: 2.225rem;
      background: #fff;
    }

    .quantity-btn {
      width: 2rem;
      height: 100%;
      border: none;
      background: none;
      cursor: pointer;
      font-size: 1.125rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .quantity-btn:hover {
      background: #f5f5f5;
    }

    .quantity-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quantity {
      flex: 1;
      text-align: center;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .add-to-cart-btn {
      height: 2.225rem;
      padding: 0 1rem;
      background: #000;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: background 0.2s;
      white-space: nowrap;
    }

    .buy-now-btn {
      height: 2.225rem;
      padding: 0 1rem;
      background: #e5e5e5;
      color: #000;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: background 0.2s;
      white-space: nowrap;
    }

    .buy-now-btn:hover {
      background: #d5d5d5;
    }

    .add-to-cart-btn:hover {
      background: #333;
    }

    .add-to-cart-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .shade-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0.5rem 0 0.75rem;
      flex-wrap: wrap;
    }

    .shade-swatch {
      width: 1.25rem;
      height: 1.25rem;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
      cursor: pointer;
      padding: 0;
      background-color: inherit;
      transition: all 0.15s ease;
    }

    .shade-swatch:hover {
      transform: scale(1.1);
      box-shadow:
        inset 0 0 0 1px rgba(255, 255, 255, 0.4),
        0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .shade-swatch.selected {
      outline: 2px solid #000;
      outline-offset: 2px;
    }

    .shade-more {
      font-size: 0.85rem;
      color: #555;
      padding-left: 0.25rem;
      font-weight: 600;
    }
  `;

  @property({ type: Object }) product!: Product;
  @property({ type: Boolean }) isWishlisted = false;

  @state() private isInWishlist = false;
  @state() private isLoggedIn = false;
  @state() private cartQuantity = 0;
  @state() private selectedShadeIndex = 0;

  private _boundHandleGlobalWishlist =
    this._handleGlobalWishlistToggle.bind(this);

  private _boundCheckCartStatus = this._checkCartStatus.bind(this);

  connectedCallback() {
    super.connectedCallback();
    // Check user login status and wishlist status when component connects
    this._checkLoginStatus();
    this._checkWishlistStatus();
    this._checkCartStatus();

    // Listen for global wishlist updates
    window.addEventListener(
      "itsme-wishlist-toggle",
      this._boundHandleGlobalWishlist as EventListener,
    );
    window.addEventListener("cart-updated", this._boundCheckCartStatus);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener(
      "itsme-wishlist-toggle",
      this._boundHandleGlobalWishlist as EventListener,
    );
    window.removeEventListener("cart-updated", this._boundCheckCartStatus);
  }

  updated(changedProperties: Map<string, any>) {
    // Check wishlist status when product or isWishlisted prop changes
    if (
      changedProperties.has("product") ||
      changedProperties.has("isWishlisted")
    ) {
      this._checkWishlistStatus();
      this._checkCartStatus();
      this.selectedShadeIndex = 0;
    }
  }

  private _checkLoginStatus() {
    const user = localStorage.getItem("user");
    this.isLoggedIn = !!user;
  }

  private _checkWishlistStatus() {
    if (this.isWishlisted) {
      this.isInWishlist = true;
      return;
    }

    if (!this.product) return;

    try {
      const wishlistData = localStorage.getItem("wishlist");
      const wishlistIds = wishlistData ? JSON.parse(wishlistData) : [];
      if (Array.isArray(wishlistIds)) {
        this.isInWishlist = wishlistIds.includes(this.product.id);
      }
    } catch (e) {
      console.warn("Error reading wishlist:", e);
    }
  }

  private _checkCartStatus() {
    if (!this.product) return;
    try {
      const cartData = localStorage.getItem("cart");
      const cart = cartData ? JSON.parse(cartData) : { items: [] };
      const existingItem = cart.items.find(
        (item: any) => item.productId === this.product?.id,
      );
      this.cartQuantity = existingItem ? existingItem.quantity : 0;
    } catch (e) {
      this.cartQuantity = 0;
    }
  }

  private _handleGlobalWishlistToggle(e: CustomEvent) {
    const { product } = e.detail;
    // If this card represents the same product that was toggled elsewhere
    if (this.product && product && this.product.id === product.id) {
      this._checkWishlistStatus();
    }
  }

  private _updateCart(quantity: number, showNotification = false) {
    if (!this.product) return;

    if (this.product.stock < quantity) {
      NotificationService.error("Not enough stock available");
      return;
    }

    const cartData = localStorage.getItem("cart");
    const cart = cartData ? JSON.parse(cartData) : { items: [] };

    const selectedShade =
      this.product.shades && this.product.shades.length > 0
        ? this.product.shades[this.selectedShadeIndex]
        : null;

    const existingItemIndex = cart.items.findIndex((item: any) => {
      const isSameProduct = item.productId === this.product?.id;
      const isSameShade = selectedShade
        ? item.selectedShade?.hexCode === selectedShade.hexCode
        : !item.selectedShade;
      return isSameProduct && isSameShade;
    });

    if (quantity > 0) {
      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity = quantity;
      } else {
        cart.items.push({
          productId: this.product.id,
          product: this.product,
          quantity: quantity,
          price: this.product.price,
          selectedShade: selectedShade,
        });
      }
      if (showNotification) {
        NotificationService.success(`Added ${this.product.name} to cart`);
      }
    } else {
      if (existingItemIndex > -1) {
        cart.items.splice(existingItemIndex, 1);
        if (showNotification) {
          NotificationService.info(`Removed ${this.product.name} from cart`);
        }
      }
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    this.cartQuantity = quantity;
    window.dispatchEvent(new Event("cart-updated"));
  }

  render() {
    if (!this.product) return html``;

    const { name, brand, price, imageUrl, ethicalMarkers, stock, shades } =
      this.product;
    const isOutOfStock = stock === 0;
    const visibleShades = (shades || []).slice(0, 4);
    const remainingShades = Math.max(
      (shades?.length || 0) - visibleShades.length,
      0,
    );

    return html`
      <div class="card">
        <div class="image-container">
          ${imageUrl
            ? html`<img class="image" src=${imageUrl} alt=${name} />`
            : html`<div class="image"></div>`}

          <button
            class="wishlist-btn ${this.isInWishlist ? "wishlisted" : ""}"
            @click=${this._toggleWishlist}
            title="${this.isInWishlist
              ? "Remove from wishlist"
              : "Add to wishlist"}"
          >
            <svg
              class="heart-icon"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
          </button>

          <div class="ethical-badges">
            ${ethicalMarkers?.includes("Vegan")
              ? html`<span class="badge">🌱 Vegan</span>`
              : ""}
            ${ethicalMarkers?.includes("Cruelty-Free")
              ? html`<span class="badge">🐰 Cruelty-Free</span>`
              : ""}
            ${ethicalMarkers?.includes("Organic")
              ? html`<span class="badge">🌿 Organic</span>`
              : ""}
          </div>
        </div>
        <div class="content">
          <div class="brand">${brand}</div>
          <div class="name">${name}</div>
          ${(shades?.length || 0) > 0
            ? html`
                <div class="shade-row">
                  ${visibleShades.map(
                    (shade, idx) => html`
                      <button
                        class="shade-swatch ${this.selectedShadeIndex === idx
                          ? "selected"
                          : ""}"
                        style="background-color: ${shade.hexCode}"
                        title=${shade.name}
                        @click=${(e: Event) => this._selectCardShade(idx, e)}
                      ></button>
                    `,
                  )}
                  ${remainingShades > 0
                    ? html`<span class="shade-more"
                        >+${remainingShades} Shades</span
                      >`
                    : ""}
                </div>
              `
            : ""}
          <div class="price">${formatCurrency(price)}</div>
          ${isOutOfStock
            ? html`<div class="stock-indicator">Out of Stock</div>`
            : html`
                <div class="cart-controls">
                  ${this.cartQuantity > 0
                    ? html`
                        <div class="quantity-controls" @click=${this._stopProp}>
                          <button
                            class="quantity-btn"
                            @click=${this._decrementQuantity}
                          >
                            −
                          </button>
                          <span class="quantity">${this.cartQuantity}</span>
                          <button
                            class="quantity-btn"
                            @click=${this._incrementQuantity}
                          >
                            +
                          </button>
                        </div>
                      `
                    : html`
                        <button
                          class="add-to-cart-btn"
                          @click=${this._addToCart}
                          ?disabled=${isOutOfStock}
                        >
                          Add to Cart
                        </button>
                      `}
                  <button
                    class="buy-now-btn"
                    @click=${this._handleBuyNow}
                    ?disabled=${isOutOfStock}
                  >
                    Buy Now
                  </button>
                </div>
              `}
        </div>
      </div>
    `;
  }

  private _stopProp(e: Event) {
    e.stopPropagation();
    e.preventDefault();
  }

  private _incrementQuantity(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    if (this.cartQuantity < this.product.stock) {
      this._updateCart(this.cartQuantity + 1);
    } else {
      NotificationService.error("Max stock reached");
    }
  }

  private _decrementQuantity(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    if (this.cartQuantity > 0) {
      this._updateCart(this.cartQuantity - 1);
    }
  }

  private _selectCardShade(index: number, e: Event) {
    e.stopPropagation();
    e.preventDefault();
    if (!this.product?.shades) return;
    if (index < 0 || index >= this.product.shades.length) return;
    this.selectedShadeIndex = index;
  }

  private _addToCart(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    this._updateCart(1, true);
  }

  private _handleBuyNow(e: Event) {
    e.stopPropagation();
    e.preventDefault();
    if (this.cartQuantity === 0) {
      this._updateCart(1);
    }
    window.location.href = "/checkout";
  }

  private _toggleWishlist(e: Event) {
    e.stopPropagation();
    e.preventDefault();

    if (!this.product) return;

    if (!this.isLoggedIn) {
      window.location.href = "/login";
      return;
    }

    // Get existing wishlist from localStorage
    const wishlistData = localStorage.getItem("wishlist");
    const wishlistIds = wishlistData ? JSON.parse(wishlistData) : [];

    // Toggle wishlist status
    const index = wishlistIds.indexOf(this.product.id);
    if (index > -1) {
      // Remove from wishlist
      wishlistIds.splice(index, 1);
      this.isInWishlist = false;
      NotificationService.info(`Removed ${this.product.name} from wishlist`);
    } else {
      // Add to wishlist
      wishlistIds.push(this.product.id);
      this.isInWishlist = true;
      NotificationService.success(`Added ${this.product.name} to wishlist`);
    }

    // Save wishlist
    localStorage.setItem("wishlist", JSON.stringify(wishlistIds));

    // Dispatch event for other components to handle notifications
    this.dispatchEvent(
      new CustomEvent("itsme-wishlist-toggle", {
        detail: { product: this.product, isInWishlist: this.isInWishlist },
        bubbles: true,
        composed: true,
      }),
    );
  }
}
