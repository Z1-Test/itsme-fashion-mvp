import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { BeforeEnterObserver, RouterLocation } from "@vaadin/router";
import { getProductById, type Product } from "../services/catalog";
import type { ProductShade } from "@itsme/shared-utils";
import { formatCurrency } from "@itsme/shared-utils";
import { NotificationService } from "../../../packages/design-system/src/notification-service";
import { cart, wishlist, authService } from "../services";

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
      z-index: 100;
    }

    .wishlist-btn {
      width: 2.75rem;
      height: 2.75rem;
      border: none;
      background: lime; /* BRIGHT COLOR TO SEE IF BUTTON EXISTS */
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transition: transform 0.2s;
      pointer-events: auto;
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

  async _loadProduct(productId: string) {
    this.loading = true;
    try {
      this.product = await getProductById(productId);
      this.selectedShadeIndex = 0;
      await this._checkWishlistStatus();
      this._checkCartStatus();
    } catch (error) {
      NotificationService.error("Failed to load product");
      this.product = null;
    } finally {
      this.loading = false;
    }
  }

  private async _checkWishlistStatus() {
    if (!this.product) return;
    try {
      this.isInWishlist = await wishlist.isInWishlist(this.product.id);
    } catch (e) {
      // Silently handle wishlist check errors
    }
  }

  private async _checkCartStatus() {
    if (!this.product) return;
    try {
      if (true) { // authService.getCurrentUser()) {
        // Check from service
        const result = await cart.getCart();
        if (result.success) {
          const shades = this.product?.shades || [];
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
      } else {
        // Check from localStorage - commented out
        // const cartData = localStorage.getItem("cart");
        // const cart = cartData ? JSON.parse(cartData) : { items: [] };
        this.cartQuantity = 0;
      }
    } catch (e) {
      console.warn("Error reading cart:", e);
      this.cartQuantity = 0;
    }
  }

  private async _toggleWishlist() {
    if (!this.product) {
      return;
    }

    // Check if user is authenticated
    const currentUser = authService.getCurrentUser();
    console.log("👤 Current user:", currentUser);
    
    if (!currentUser) {
      NotificationService.error("Please log in to use wishlist");
      return;
    }

    try {
      console.log("📋 Current wishlist state:", this.isInWishlist);
      
      if (this.isInWishlist) {
        console.log("🗑️ Removing from wishlist:", this.product.id);
        const result = await wishlist.removeFromWishlist(this.product.id);
        console.log("🗑️ Remove result:", result);
        
        // Check if the operation was successful
        if (result.success) {
          this.isInWishlist = false;
          NotificationService.success(
            `Removed ${this.product.productName} from wishlist`
          );
        } else {
          NotificationService.error(result.message || "Failed to remove from wishlist");
          return;
        }
      } else {
        console.log("➕ Adding to wishlist:", this.product.id);
        const result = await wishlist.addToWishlist(this.product.id);
        console.log("➕ Add result:", result);
        
        // Check if the operation was successful
        if (result.success) {
          this.isInWishlist = true;
          NotificationService.success(
            `Added ${this.product.productName} to wishlist`
          );
        } else {
          NotificationService.error(result.message || "Failed to add to wishlist");
          return;
        }
      }

      console.log("✅ Wishlist updated successfully");

      // Dispatch event for other components
      window.dispatchEvent(
        new CustomEvent("itsme-wishlist-toggle", {
          detail: { product: this.product, isInWishlist: this.isInWishlist },
        }),
      );
    } catch (error) {
      console.error("❌ Error toggling wishlist:", error);
      NotificationService.error("Failed to update wishlist. Please try again.");
    }
  }

  private async _updateCart(newQuantity: number, showNotification = false) {
    if (!this.product) return;

    const productStock = this.product.shades?.[0]?.stock || 0;
    
    if (productStock < newQuantity) {
      NotificationService.error("Not enough stock available");
      return;
    }

    const shades = this.product?.shades || [];
    const selectedShade =
      shades.length > 0 ? shades[this.selectedShadeIndex] : null;

    if (true) { // authService.getCurrentUser()) {
      // Update via service
      try {
        if (newQuantity === 0) {
          // Remove from cart
          await cart.removeFromCart(this.product.id);
          if (showNotification) {
            NotificationService.info(`Removed ${this.product.productName} from cart`);
          }
        } else {
          // Calculate the delta (how much to add or remove)
          const delta = newQuantity - this.cartQuantity;
          
          if (delta > 0) {
            // Add items
            await cart.addToCart(this.product.id, delta, selectedShade);
            if (showNotification) {
              NotificationService.success(`Added ${this.product.productName} to cart`);
            }
          } else if (delta < 0) {
            // For now, removing requires full removal since we don't have updateQuantity function
            // We need to remove and re-add with new quantity
            await cart.removeFromCart(this.product.id);
            if (newQuantity > 0) {
              await cart.addToCart(this.product.id, newQuantity, selectedShade);
            }
          }
        }
        this.cartQuantity = newQuantity;
        window.dispatchEvent(new Event("cart-updated"));
      } catch (error) {
        console.error("Error updating cart:", error);
        NotificationService.error("Failed to update cart");
      }
    } else {
      // Not authenticated - skip cart update
      console.warn("Cart update requires authentication");
    }
  }

  private async _handleAddToCart() {
    if (!this.product) return;

    try {
      // Verify cart service is available
      if (!cart) {
        console.error("❌ Cart service is not available");
        NotificationService.error("Cart service is not initialized");
        return;
      }

      const shades = this.product?.shades || [];
      const selectedShade =
        shades.length > 0 ? shades[this.selectedShadeIndex] : null;

      const productStock = this.product.shades?.[0]?.stock || 0;
      if (productStock === 0) {
        NotificationService.error("Product is out of stock");
        return;
      }

      console.log("🛒 Cart service:", cart);
      console.log("🛒 Adding to cart:", { 
        productId: this.product.id, 
        quantity: 1, 
        shade: selectedShade 
      });

      // Show loading notification
      NotificationService.info("Adding to cart...");

      // Call the cloud function to add 1 item to Firestore cart
      const result = await cart.addToCart(this.product.id, 1, selectedShade);

      console.log("📦 Cart service response:", result);

      if (result.success) {
        console.log("✅ Product added to cart:", result);
        // Update local state
        this.cartQuantity += 1;
        // Dispatch event for other components to reload
        window.dispatchEvent(new Event("cart-updated"));
        NotificationService.success(result.message || "Added to cart");
      } else {
        console.error("Cart service returned failure:", result);
        NotificationService.error("Failed to add to cart");
      }
    } catch (error: any) {
      console.error("❌ Error adding to cart:", error);
      console.error("Error details:", {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        stack: error?.stack
      });
      
      // More specific error messages
      if (error?.code === 'unavailable') {
        NotificationService.error("Cannot connect to server. Please ensure Firebase emulators are running.");
      } else if (error?.code === 'unauthenticated') {
        NotificationService.error("Please sign in to add items to cart");
      } else {
        NotificationService.error(error?.message || "Error adding product to cart");
      }
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
    const productName = this.product.productName || "Unknown Product";
    const shadesList = this.product.shades || [];
    const normalizedSelectedIndex =
      shadesList.length && this.selectedShadeIndex < shadesList.length
        ? this.selectedShadeIndex
        : 0;
    const visibleShades = shadesList;
    const remainingShades = 0;
    const selectedShade =
      shadesList.length > 0 ? shadesList[normalizedSelectedIndex] : null;
    
    // Use selected shade's stock and price
    const productPrice = selectedShade?.price || this.product.shades?.[0]?.price || 0;
    const productStock = selectedShade?.stock || this.product.shades?.[0]?.stock || 0;

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
              type="button"
              class="wishlist-btn ${this.isInWishlist ? "wishlisted" : ""}"
              .onclick=${() => {
                console.log("🚀🚀🚀 HEART BUTTON CLICKED VIA ONCLICK!!!");
                this._toggleWishlist();
              }}
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
