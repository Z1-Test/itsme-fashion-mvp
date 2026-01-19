import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { Product } from "@itsme/shared-utils";
import { formatCurrency } from "@itsme/shared-utils";

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
    }

    .wishlist-btn:hover {
      background: white;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
    }

    .heart-icon {
      width: 1.25rem;
      height: 1.25rem;
      fill: currentColor;
      transition: all 0.2s ease;
    }

    .wishlist-btn.wishlisted .heart-icon {
      color: #dc2626;
      filter: drop-shadow(0 2px 4px rgba(220, 38, 38, 0.3));
    }

    .wishlist-btn:not(.wishlisted) .heart-icon {
      color: #000;
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
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
      align-items: center;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border: 1px solid #e5e5e5;
      border-radius: 0.375rem;
      padding: 0.25rem;
    }

    .quantity-btn {
      width: 2rem;
      height: 2rem;
      border: none;
      background: #f5f5f5;
      border-radius: 0.25rem;
      cursor: pointer;
      font-size: 1.125rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .quantity-btn:hover {
      background: #e5e5e5;
    }

    .quantity-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quantity {
      min-width: 2rem;
      text-align: center;
      font-weight: 600;
    }

    .add-to-cart-btn {
      flex: 1;
      padding: 0.5rem 1rem;
      background: #000;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s;
    }

    .add-to-cart-btn:hover {
      background: #333;
    }

    .add-to-cart-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  `;

  @property({ type: Object }) product!: Product;
  @property({ type: Number }) quantity = 1;
  @property({ type: Boolean }) isWishlisted = false;
  @state() private isInWishlist = false;
  @state() private isLoggedIn = false;

  connectedCallback() {
    super.connectedCallback();
    // Check user login status and wishlist status when component connects
    this._checkLoginStatus();
    this._checkWishlistStatus();
  }

  updated(changedProperties: Map<string, any>) {
    // Check wishlist status when product changes
    if (changedProperties.has("product")) {
      this._checkWishlistStatus();
    }
    if (changedProperties.has("isWishlisted")) {
      this.isInWishlist = this.isWishlisted;
    }
  }

  private _checkLoginStatus() {
    const user = localStorage.getItem("user");
    this.isLoggedIn = !!user;
  }

  private _checkWishlistStatus() {
    if (!this.product) return;

    const wishlistData = localStorage.getItem("wishlist");
    const wishlistIds = wishlistData ? JSON.parse(wishlistData) : [];
    this.isInWishlist = wishlistIds.includes(this.product.id);
  }

  render() {
    if (!this.product) return html``;

    const { name, brand, price, imageUrl, ethicalMarkers, stock } =
      this.product;
    const isOutOfStock = stock === 0;

    return html`
      <div class="card">
        <div class="image-container">
          ${imageUrl
            ? html`<img class="image" src=${imageUrl} alt=${name} />`
            : html`<div class="image"></div>`}
          ${this.isLoggedIn
            ? html`<button
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
                  ${this.isInWishlist
                    ? html`<path
                        fill="currentColor"
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      />`
                    : html`<path
                        fill="currentColor"
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35zm0-2.23c4.57-4.08 7-6.79 7-8.62 0-2.05-1.48-3.7-3.5-3.7-1.54 0-3.01.86-3.57 2.36h-1.86C6.48 5.84 5.01 4.98 3.5 4.98 1.48 4.98 0 6.63 0 8.68c0 1.83 2.43 4.54 7 8.62l5 4.42z"
                      />`}
                </svg>
              </button>`
            : ""}
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
          <div class="price">${formatCurrency(price)}</div>
          ${isOutOfStock
            ? html`<div class="stock-indicator">Out of Stock</div>`
            : html`
                <div class="cart-controls">
                  <div class="quantity-controls">
                    <button
                      class="quantity-btn"
                      @click=${this._decrementQuantity}
                      ?disabled=${this.quantity <= 1}
                    >
                      −
                    </button>
                    <span class="quantity">${this.quantity}</span>
                    <button
                      class="quantity-btn"
                      @click=${this._incrementQuantity}
                      ?disabled=${this.quantity >= stock}
                    >
                      +
                    </button>
                  </div>
                  <button
                    class="add-to-cart-btn"
                    @click=${this._addToCart}
                    ?disabled=${isOutOfStock}
                  >
                    Add to Cart
                  </button>
                </div>
              `}
        </div>
      </div>
    `;
  }

  private _incrementQuantity(e: Event) {
    e.stopPropagation();
    if (this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  private _decrementQuantity(e: Event) {
    e.stopPropagation();
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  private _addToCart(e: Event) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("itsme-add-to-cart", {
        detail: { product: this.product, quantity: this.quantity },
        bubbles: true,
        composed: true,
      }),
    );
    this.quantity = 1;
  }
  private _toggleWishlist(e: Event) {
    e.stopPropagation();
    e.preventDefault();

    if (!this.product) return;

    // Get existing wishlist from localStorage
    const wishlistData = localStorage.getItem("wishlist");
    const wishlistIds = wishlistData ? JSON.parse(wishlistData) : [];

    // Toggle wishlist status
    const index = wishlistIds.indexOf(this.product.id);
    if (index > -1) {
      // Remove from wishlist
      wishlistIds.splice(index, 1);
      this.isInWishlist = false;
    } else {
      // Add to wishlist
      wishlistIds.push(this.product.id);
      this.isInWishlist = true;
    }

    // Save wishlist
    localStorage.setItem("wishlist", JSON.stringify(wishlistIds));

    // Dispatch event
    this.dispatchEvent(
      new CustomEvent("itsme-wishlist-toggle", {
        detail: { product: this.product, isInWishlist: this.isInWishlist },
        bubbles: true,
        composed: true,
      }),
    );
  }
}
