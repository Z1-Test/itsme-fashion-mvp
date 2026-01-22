import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { Product, ProductShade } from "@itsme/shared-utils";
import { formatCurrency } from "@itsme/shared-utils";
import { NotificationService } from "./notification-service";

// Access cart and wishlist services from global window object (set by main app)
const getCartService = () => (window as any).cartService;
const getWishlistService = () => (window as any).wishlistService;

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
      min-height: 420px;
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
      flex-shrink: 0;
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
      min-height: 2.8rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
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
      gap: 0.4rem;
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
      padding: 0 0.5rem;
      background: #000;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
      transition: background 0.2s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }

    .buy-now-btn {
      height: 2.225rem;
      padding: 0 0.5rem;
      background: #e5e5e5;
      color: #000;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.85rem;
      transition: background 0.2s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
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
      flex-wrap: nowrap;
      min-height: 1.75rem;
    }

    .shade-placeholder {
      min-height: 1.75rem;
      margin: 0.5rem 0 0.75rem;
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

  private async _checkCartStatus() {
    if (!this.product) return;
    const cartService = getCartService();
    if (!cartService) {
      this.cartQuantity = 0;
      return;
    }
    try {
      // Use cart service to get cart items
      const result = await cartService.getCart();
      if (result.success) {
        const shades = (this.product as any).shades || [];
        const selectedShade =
          shades.length > 0 ? shades[this.selectedShadeIndex] : null;

        const existingItem = result.cart.items.find((item: any) => {
          const isSameProduct = item.productId === this.product?.id;
          const isSameShade = selectedShade
            ? item.shade?.hexCode === selectedShade.hexCode
            : !item.shade;
          return isSameProduct && isSameShade;
        });

        if (existingItem) {
          this.cartQuantity = existingItem.quantity;
        } else {
          this.cartQuantity = 0;
        }
      } else {
        this.cartQuantity = 0;
      }
    } catch (e) {
      console.warn("Error reading cart:", e);
      this.cartQuantity = 0;
    }
  }

  private _handleGlobalWishlistToggle(e: CustomEvent) {
    const { product, isInWishlist } = e.detail;
    // If this card represents the same product that was toggled elsewhere
    if (this.product && product && this.product.id === product.id) {
      console.log(`💚 GLOBAL EVENT - Updating card for product ${this.product.id} to isInWishlist: ${isInWishlist}`);
      this.isInWishlist = isInWishlist;
      this.requestUpdate();
    }
  }

  private async _updateCart(newQuantity: number, showNotification = false) {
    if (!this.product) return;

    const cartService = getCartService();
    if (!cartService) {
      NotificationService.error("Cart service not available");
      return;
    }

    const productStock = (this.product as any).shades?.[0]?.stock || (this.product as any).stock || 0;
    
    if (productStock < newQuantity) {
      NotificationService.error("Not enough stock available");
      return;
    }

    const shades = (this.product as any).shades || [];
    const selectedShade =
      shades.length > 0 ? shades[this.selectedShadeIndex] : null;

    try {
      if (newQuantity === 0) {
        // Remove from cart
        await cartService.removeFromCart(this.product.id);
        if (showNotification) {
          const productName = (this.product as any).productName || (this.product as any).name || "Product";
          NotificationService.info(`Removed ${productName} from cart`);
        }
      } else {
        // Calculate the delta (how much to add or remove)
        const delta = newQuantity - this.cartQuantity;
        
        if (delta > 0) {
          // Add items
          await cartService.addToCart(this.product.id, delta, selectedShade);
          if (showNotification) {
            const productName = (this.product as any).productName || (this.product as any).name || "Product";
            NotificationService.success(`Added ${productName} to cart`);
          }
        } else if (delta < 0) {
          // For now, removing requires full removal since we don't have updateQuantity function
          // We need to remove and re-add with new quantity
          await cartService.removeFromCart(this.product.id);
          if (newQuantity > 0) {
            await cartService.addToCart(this.product.id, newQuantity, selectedShade);
          }
        }
      }
      this.cartQuantity = newQuantity;
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      console.error("Error updating cart:", error);
      NotificationService.error("Failed to update cart");
    }
  }

  render() {
    if (!this.product) return html``;

    // Map Firestore product fields to expected format
    const name = (this.product as any).productName || this.product.name || "Unknown Product";
    const brand = (this.product as any).brand || "It's Me";
    const price = (this.product as any).shades?.[0]?.price || (this.product as any).price || 0;
    const imageUrl = (this.product as any).imageUrl || `https://placehold.co/400x400?text=${encodeURIComponent(name)}`;
    const ethicalMarkers = (this.product as any).ethicalMarkers || [];
    const stock = (this.product as any).shades?.[0]?.stock || (this.product as any).stock || 0;
    const shades = (this.product as any).shades || [];
    
    const isOutOfStock = stock === 0;
    const visibleShades = (shades || []).slice(0, 4);
    const remainingShades = Math.max(
      (shades?.length || 0) - visibleShades.length,
      0,
    );

    // Debug log
    console.log(`💚 RENDER - Product: ${this.product.id}, isInWishlist: ${this.isInWishlist}`);

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
                    (shade: ProductShade, idx: number) => html`
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
            : html`<div class="shade-placeholder"></div>`}
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
    const productStock = (this.product as any).shades?.[0]?.stock || (this.product as any).stock || 0;
    if (this.cartQuantity < productStock) {
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

  private async _toggleWishlist(e: Event) {
    e.stopPropagation();
    e.preventDefault();

    console.log("💚 PRODUCT CARD WISHLIST CLICKED!");

    if (!this.product) {
      console.log("💚 No product");
      return;
    }

    if (!this.isLoggedIn) {
      console.log("💚 Not logged in, redirecting");
      window.location.href = "/login";
      return;
    }

    const wishlistService = getWishlistService();
    console.log("💚 Wishlist service:", wishlistService);

    if (!wishlistService) {
      console.error("💚 Wishlist service not available, falling back to localStorage");
      // Fallback to localStorage
      const wishlistData = localStorage.getItem("wishlist");
      const wishlistIds = wishlistData ? JSON.parse(wishlistData) : [];
      const index = wishlistIds.indexOf(this.product.id);
      const productName = (this.product as any).productName || (this.product as any).name || "Product";
      
      if (index > -1) {
        wishlistIds.splice(index, 1);
        this.isInWishlist = false;
        NotificationService.info(`Removed ${productName} from wishlist`);
      } else {
        wishlistIds.push(this.product.id);
        this.isInWishlist = true;
        NotificationService.success(`Added ${productName} to wishlist`);
      }
      
      localStorage.setItem("wishlist", JSON.stringify(wishlistIds));
      this.dispatchEvent(
        new CustomEvent("itsme-wishlist-toggle", {
          detail: { product: this.product, isInWishlist: this.isInWishlist },
          bubbles: true,
          composed: true,
        }),
      );
      return;
    }

    // Use wishlist service (cloud functions)
    const productName = (this.product as any).productName || (this.product as any).name || "Product";
    console.log("💚 Toggling wishlist for:", productName, "Current state:", this.isInWishlist);

    try {
      if (this.isInWishlist) {
        console.log("💚 Removing from wishlist via service");
        const result = await wishlistService.removeFromWishlist(this.product.id);
        console.log("💚 Remove result:", result);
        
        if (result.success) {
          this.isInWishlist = false;
          console.log("💚 State updated, isInWishlist:", this.isInWishlist);
          NotificationService.info(`Removed ${productName} from wishlist`);
          this.dispatchEvent(
            new CustomEvent("itsme-wishlist-toggle", {
              detail: { product: this.product, isInWishlist: false },
              bubbles: true,
              composed: true,
            }),
          );
        } else {
          NotificationService.error(result.message || "Failed to remove from wishlist");
        }
      } else {
        console.log("💚 Adding to wishlist via service");
        const result = await wishlistService.addToWishlist(this.product.id);
        console.log("💚 Add result:", result);
        
        if (result.success) {
          this.isInWishlist = true;
          console.log("💚 State updated, isInWishlist:", this.isInWishlist);
          NotificationService.success(`Added ${productName} to wishlist`);
          this.dispatchEvent(
            new CustomEvent("itsme-wishlist-toggle", {
              detail: { product: this.product, isInWishlist: true },
              bubbles: true,
              composed: true,
            }),
          );
        } else {
          NotificationService.error(result.message || "Failed to add to wishlist");
        }
      }
    } catch (error) {
      console.error("💚 Error toggling wishlist:", error);
      NotificationService.error("Failed to update wishlist");
    }
  }
}
