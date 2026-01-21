import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { BeforeEnterObserver, RouterLocation } from "@vaadin/router";
import { getProductById, type Product } from "../services/catalog";
import type { ProductShade } from "@itsme/shared-utils";
import { formatCurrency } from "@itsme/shared-utils";
import { NotificationService } from "../../../packages/design-system/src/notification-service";
import { cart } from "../services";

@customElement("page-product-detail")
export class PageProductDetail
  extends LitElement
  implements BeforeEnterObserver {
  static styles = css`
    :host {
      display: block;
      padding-bottom: 2rem;
    }

    .container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2.5rem;
      margin-top: 1.5rem;
    }

    @media (max-width: 1024px) {
      .container {
        gap: 2rem;
      }
    }

    @media (max-width: 768px) {
      .container {
        grid-template-columns: 1fr;
        gap: 1.5rem;
        margin-top: 1rem;
      }
    }

    @media (max-width: 480px) {
      .container {
        gap: 1rem;
      }
    }

    .image-container {
      position: relative;
    }

    .image-container img {
      width: 100%;
      height: auto;
      border-radius: 0.5rem;
      object-fit: cover;
    }

    .wishlist-btn-container {
      position: absolute;
      top: 1rem;
      right: 1rem;
    }

    .wishlist-btn {
      width: 2.75rem;
      height: 2.75rem;
      border: none;
      background: white;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transition: transform 0.2s;
    }

    .wishlist-btn:hover {
      transform: scale(1.05);
    }

    .heart-icon {
      width: 1.25rem;
      height: 1.25rem;
    }

    .wishlist-btn.wishlisted .heart-icon path {
      fill: #ef4444;
      stroke: #ef4444;
    }

    .wishlist-btn .heart-icon path {
      fill: none;
      stroke: #000;
      stroke-width: 2;
    }

    .details {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .brand {
      color: #666;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    h1 {
      margin: 0;
      font-size: 1.75rem;
      line-height: 1.3;
    }

    .price {
      font-size: 1.5rem;
      font-weight: 500;
    }

    .stock-status {
      font-size: 0.875rem;
      font-weight: 500;
    }
    .stock-status.in-stock {
      color: #16a34a;
    }
    .stock-status.low-stock {
      color: #ea580c;
    }
    .stock-status.out-of-stock {
      color: #dc2626;
    }

    .description {
      line-height: 1.6;
      color: #333;
      font-size: 0.95rem;
    }

    .meta {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .tag {
      background: #f5f5f5;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }

    .shades {
      margin-top: 0.75rem;
    }
    .shade-title {
      font-weight: 600;
      margin-bottom: 0.5rem;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    @media (max-width: 768px) {
      h1 {
        font-size: 1.5rem;
      }

      .price {
        font-size: 1.25rem;
      }

      .details {
        gap: 1rem;
      }

      .description {
        font-size: 0.9rem;
      }
    }

    @media (max-width: 480px) {
      :host {
        overflow-x: hidden;
      }

      .container {
        gap: 1rem;
      }

      h1 {
        font-size: 1.25rem;
      }

      .price {
        font-size: 1.1rem;
      }

      .details {
        gap: 0.75rem;
      }

      .brand {
        font-size: 0.75rem;
      }

      .description {
        font-size: 0.85rem;
      }

      .tag {
        font-size: 0.7rem;
        padding: 0.2rem 0.4rem;
      }
    }

    .shade-swatches {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      align-items: center;
    }
    .shade-swatch {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.1);
      position: relative;
      cursor: pointer;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
      transition:
        transform 0.15s ease,
        box-shadow 0.15s ease;
    }
    .shade-swatch:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
    }
    .shade-swatch.selected {
      outline: 2px solid #000;
      outline-offset: 3px;
    }
    .shade-check {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      color: #fff;
      font-weight: 700;
      font-size: 1rem;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
    }
    .shade-more {
      font-size: 0.9rem;
      color: #555;
      padding: 0 0.5rem;
      font-weight: 600;
    }
    .shade-meta {
      margin-top: 0.5rem;
      display: flex;
      gap: 0.5rem;
      align-items: center;
      font-size: 0.95rem;
      color: #222;
    }
    .shade-name {
      font-weight: 700;
    }
    .shade-code {
      background: #f5f5f5;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      font-size: 0.85rem;
      color: #444;
    }

    .section-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      margin-top: 1.5rem;
      border-bottom: 1px solid #eee;
      padding-bottom: 0.5rem;
    }

    .info-grid {
      display: grid;
      gap: 1rem;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .actions {
      margin-top: 1rem;
      display: flex;
      gap: 1rem;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 0;
      border: 1px solid #000;
      border-radius: 4px;
      height: 2.5rem;
      flex: 1;
    }

    .quantity-btn {
      background: none;
      border: none;
      width: 2.5rem;
      height: 100%;
      font-size: 1.25rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .quantity-btn:hover {
      background: #f5f5f5;
    }

    .quantity-display {
      flex: 1;
      text-align: center;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .back-link {
      display: inline-block;
      margin-bottom: 1rem;
      color: #666;
      text-decoration: none;
    }

    .back-link:hover {
      text-decoration: underline;
    }

    .error {
      text-align: center;
      padding: 2rem;
    }
  `;

  @state() private product: Product | null = null;
  @state() private loading = true;
  @state() private isInWishlist = false;
  @state() private cartQuantity = 0;
  @state() private selectedShadeIndex = 0;

  onBeforeEnter(location: RouterLocation) {
    const id = location.params.id as string;
    this._loadProduct(id);
  }

  private async _loadProduct(id: string) {
    this.loading = true;
    try {
      this.product = await getProductById(id);
      this.selectedShadeIndex = 0;
      this._checkWishlistStatus();
      this._checkCartStatus();
    } catch (error) {
      console.error("Error loading product:", error);
      this.product = null;
    } finally {
      this.loading = false;
    }
  }

  private _checkWishlistStatus() {
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

      const shades = this.product?.shades || [];
      const selectedShade =
        shades.length > 0 ? shades[this.selectedShadeIndex] : null;

      const existingItem = cart.items.find((item: any) => {
        const isSameProduct = item.productId === this.product?.id;
        const isSameShade = selectedShade
          ? item.selectedShade?.hexCode === selectedShade.hexCode
          : !item.selectedShade;
        return isSameProduct && isSameShade;
      });

      if (existingItem) {
        this.cartQuantity = existingItem.quantity;
      } else {
        this.cartQuantity = 0;
      }
    } catch (e) {
      console.warn("Error reading cart:", e);
      this.cartQuantity = 0;
    }
  }

  private _toggleWishlist() {
    if (!this.product) return;

    const wishlistData = localStorage.getItem("wishlist");
    const wishlistIds = wishlistData ? JSON.parse(wishlistData) : [];

    if (this.isInWishlist) {
      const index = wishlistIds.indexOf(this.product.id);
      if (index > -1) {
        wishlistIds.splice(index, 1);
        this.isInWishlist = false;
      }
    } else {
      if (!wishlistIds.includes(this.product.id)) {
        wishlistIds.push(this.product.id);
        this.isInWishlist = true;
      }
    }

    localStorage.setItem("wishlist", JSON.stringify(wishlistIds));

    // Dispatch event for other components
    window.dispatchEvent(
      new CustomEvent("itsme-wishlist-toggle", {
        detail: { product: this.product, isInWishlist: this.isInWishlist },
      }),
    );
  }

  private _updateCart(quantity: number, showNotification = false) {
    if (!this.product) return;

    const productStock = this.product.shades?.[0]?.stock || 0;
    
    if (productStock < quantity) {
      NotificationService.error("Not enough stock available");
      return;
    }

    const cartData = localStorage.getItem("cart");
    const cart = cartData ? JSON.parse(cartData) : { items: [] };

    const shades = this.product?.shades || [];
    const selectedShade =
      shades.length > 0 ? shades[this.selectedShadeIndex] : null;

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
          price: this.product.shades?.[0]?.price || 0,
          selectedShade: selectedShade,
        });
      }
      if (showNotification) {
        NotificationService.success(`Added ${this.product.productName} to cart`);
      }
    } else {
      if (existingItemIndex > -1) {
        cart.items.splice(existingItemIndex, 1);
        if (showNotification) {
          NotificationService.info(`Removed ${this.product.productName} from cart`);
        }
      }
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    this.cartQuantity = quantity;
    window.dispatchEvent(new Event("cart-updated"));
  }

  private async _handleAddToCart() {
    if (!this.product) return;

    try {
      // Call the cloud function to add product to Firestore cart
      const result = await cart.addToCart(this.product.id);

      if (result.success) {
        // Also update local cart for UI consistency
        this._updateCart(1, true);
        NotificationService.success(result.message);
      } else {
        NotificationService.error("Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      NotificationService.error("Error adding product to cart");
    }
  }

  private _incrementQuantity() {
    if (!this.product) return;
    const productStock = this.product.shades?.[0]?.stock || 0;
    if (this.cartQuantity < productStock) {
      this._updateCart(this.cartQuantity + 1);
    } else {
      NotificationService.error("Max stock reached");
    }
  }

  private _decrementQuantity() {
    if (this.cartQuantity > 0) {
      this._updateCart(this.cartQuantity - 1);
    }
  }

  private _handleBuyNow() {
    if (this.cartQuantity === 0) {
      this._updateCart(1);
    }
    window.location.href = "/checkout";
  }

  private _selectShade(index: number) {
    if (!this.product?.shades) return;
    if (index < 0 || index >= this.product.shades.length) return;
    this.selectedShadeIndex = index;
    this._checkCartStatus();
  }

  render() {
    if (this.loading) {
      return html`<div>Loading...</div>`;
    }

    if (!this.product) {
      return html`
        <div class="error">
          <h2>Product not found</h2>
          <a href="/products" class="back-link">Back to products</a>
        </div>
      `;
    }

    // Map Firestore product to expected format
    console.log("Product data:", this.product);
    const productName = this.product.productName || "Unknown Product";
    const productPrice = this.product.shades?.[0]?.price || 0;
    const productStock = this.product.shades?.[0]?.stock || 0;
    console.log("Mapped values:", { productName, productPrice, productStock });
    const shadesList = this.product.shades || [];
    const normalizedSelectedIndex =
      shadesList.length && this.selectedShadeIndex < shadesList.length
        ? this.selectedShadeIndex
        : 0;
    const visibleShades = shadesList.slice(0, 6);
    const remainingShades = Math.max(
      shadesList.length - visibleShades.length,
      0,
    );
    const selectedShade =
      shadesList.length > 0 ? shadesList[normalizedSelectedIndex] : null;

    let stockStatus = html`<span class="stock-status in-stock">In Stock</span>`;
    if (productStock === 0) {
      stockStatus = html`<span class="stock-status out-of-stock"
        >Out of Stock</span
      >`;
    } else if (productStock < 10) {
      stockStatus = html`<span class="stock-status low-stock"
        >Low Stock: Only ${productStock} left!</span
      >`;
    }

    return html`
      <a href="/products" class="back-link">← Back to Products</a>
      <div class="container">
        <div class="image-container">
          <img src="${this.product?.imageUrl || this.product?.url || `https://placehold.co/600x600?text=${encodeURIComponent(productName)}`}" alt="${productName}" />
          <div class="wishlist-btn-container">
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
          </div>
        </div>
        <div class="details">
          <div>
            <div class="brand">It's Me</div>
            <h1>${productName}</h1>
            ${this.product.tagline
              ? html`<p
                  style="font-style: italic; color: #666; margin-top: 0.5rem;"
                >
                  ${this.product.tagline}
                </p>`
        : ""}
          </div>

          <div class="price">₹${productPrice}</div>

          <div>${stockStatus}</div>

          ${shadesList.length > 0
        ? html`
                <div class="shades">
                  <div class="shade-title">Available Shades</div>
                  <div class="shade-swatches">
                    ${visibleShades.map(
          (s, idx) => html`
                        <button
                          class="shade-swatch ${normalizedSelectedIndex === idx
              ? "selected"
              : ""}"
                          style="background-color: ${s.hexCode}"
                          title=${s.shadeName}
                          @click=${() => this._selectShade(idx)}
                        >
                          ${normalizedSelectedIndex === idx
              ? html`<span class="shade-check">✓</span>`
              : ""}
                        </button>
                      `,
        )}
                    ${remainingShades > 0
            ? html`<span class="shade-more"
                          >+${remainingShades} more</span
                        >`
            : ""}
                  </div>
                  ${selectedShade
            ? html`
                        <div class="shade-meta">
                          <span class="shade-name">${selectedShade.shadeName}</span>
                          ${selectedShade.shadeCode
                            ? html`<span class="shade-code"
                                >Shade ${selectedShade.shadeCode}</span
                              >`
                : ""}
                        </div>
                      `
            : ""}
                </div>
              `
        : ""}

          <div class="actions">
            ${this.cartQuantity > 0
        ? html`
                  <div class="quantity-controls">
                    <button
                      class="quantity-btn"
                      @click=${this._decrementQuantity}
                    >
                      −
                    </button>
                    <div class="quantity-display">${this.cartQuantity}</div>
                    <button
                      class="quantity-btn"
                      @click=${this._incrementQuantity}
                    >
                      +
                    </button>
                  </div>
                `
        : html`
                  <itsme-button
                    @itsme-click=${this._handleAddToCart}
                    ?disabled=${productStock === 0}
                    style="flex: 1"
                  >
                    Add to Cart
                  </itsme-button>
                `}

            <itsme-button
              @itsme-click=${this._handleBuyNow}
              variant="primary"
              ?disabled=${productStock === 0}
              style="flex: 1"
            >
              Buy Now
            </itsme-button>
          </div>

          <div class="description">${this.product.description}</div>

          ${this.product.keyBenefits
            ? html`
                <div>
                  <div class="section-title">Benefits</div>
                  <p>${this.product.keyBenefits}</p>
                </div>
              `
            : ""}
          ${this.product.howToUse
            ? html`
                <div>
                  <div class="section-title">How to Use</div>
                  <p>${this.product.howToUse}</p>
                </div>
              `
            : ""}
          ${this.product.ingredients
            ? html`
                <div>
                  <div class="section-title">Ingredients</div>
                  <p style="font-size: 0.85rem; color: #555;">${this.product.ingredients}</p>
                </div>
              `
        : ""}
        </div>
      </div>
    `;
  }
}
