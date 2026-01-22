import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { formatCurrency } from "@itsme/shared-utils";
import { NotificationService } from "../../../packages/design-system/src/notification-service";
import { authService, cartServiceInstance } from "../services";
import type { CartItem as ServiceCartItem, Cart } from "../services/cart";

interface CartItem {
  productId: string;
  product: any;
  quantity: number;
  price: number;
  selectedShade?: any;
}

@customElement("page-cart")
export class PageCart extends LitElement {
  static styles = css`
    :host {
      display: block;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 1.5rem;
      font-size: 1.75rem;
    }

    .cart-container {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 2rem;
    }

    @media (max-width: 1024px) {
      .cart-container {
        grid-template-columns: 1fr 320px;
        gap: 1.5rem;
      }
    }

    @media (max-width: 768px) {
      .cart-container {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      h1 {
        font-size: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      :host {
        overflow-x: hidden;
      }

      .cart-container {
        gap: 1rem;
      }

      h1 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
      }
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 80px 1fr auto;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #e5e5e5;
      border-radius: 0.5rem;
      align-items: center;
    }

    .item-image {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 0.375rem;
    }

    .item-details {
      flex: 1;
    }

    .item-name {
      font-weight: 600;
      font-size: 1rem;
      margin-bottom: 0.25rem;
      line-height: 1.3;
    }

    .item-brand {
      color: #666;
      font-size: 0.8rem;
      margin-bottom: 0.5rem;
    }

    .item-price {
      font-weight: 600;
      color: #000;
      font-size: 0.95rem;
    }

    .item-shade {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
      font-size: 0.8rem;
      color: #555;
    }

    .shade-swatch-cart {
      width: 0.9rem;
      height: 0.9rem;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.1);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
    }

    .shade-name {
      font-weight: 500;
    }

    .item-controls {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      align-items: flex-end;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      border: 1px solid #e5e5e5;
      border-radius: 0.375rem;
      padding: 0.2rem;
    }

    .quantity-btn {
      width: 1.75rem;
      height: 1.75rem;
      border: none;
      background: #f5f5f5;
      border-radius: 0.25rem;
      cursor: pointer;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .quantity-btn:hover {
      background: #e5e5e5;
    }

    .quantity {
      min-width: 1.75rem;
      text-align: center;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .remove-btn {
      background: none;
      border: none;
      color: #dc2626;
      cursor: pointer;
      font-size: 0.75rem;
      text-decoration: underline;
      padding: 0;
    }

    .remove-btn:hover {
      color: #991b1b;
    }

    .cart-summary {
      border: 1px solid #e5e5e5;
      border-radius: 0.5rem;
      padding: 1.25rem;
      height: fit-content;
      position: sticky;
      top: 1rem;
    }

    .summary-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .summary-total {
      display: flex;
      justify-content: space-between;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 2px solid #e5e5e5;
      font-size: 1.1rem;
      font-weight: 700;
    }

    .checkout-btn {
      width: 100%;
      padding: 0.75rem;
      background: #000;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95rem;
      margin-top: 1rem;
      transition: background 0.2s;
    }

    .checkout-btn:hover:not(:disabled) {
      background: #333;
    }

    .checkout-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .clear-cart-btn {
      width: 100%;
      padding: 0.75rem;
      background: transparent;
      color: #dc2626;
      border: 1px solid #dc2626;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.875rem;
      margin-top: 0.75rem;
      transition: all 0.2s;
    }

    .clear-cart-btn:hover {
      background: #dc2626;
      color: white;
    }

    .cart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .cart-header h1 {
      margin: 0;
    }

    @media (max-width: 768px) {
      .cart-item {
        grid-template-columns: 70px 1fr auto;
        gap: 0.75rem;
        padding: 0.75rem;
      }

      .item-image {
        width: 70px;
        height: 70px;
      }

      .item-name {
        font-size: 0.95rem;
      }

      .item-controls {
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
        gap: 0.5rem;
      }

      .quantity-controls {
        gap: 0;
      }

      .quantity-btn {
        width: 1.5rem;
        height: 1.5rem;
        font-size: 0.8rem;
      }

      .quantity {
        min-width: 1.5rem;
        font-size: 0.85rem;
      }

      .cart-summary {
        padding: 1rem;
        position: static;
        top: auto;
      }

      .summary-title {
        font-size: 1rem;
        margin-bottom: 0.75rem;
      }

      .summary-row {
        font-size: 0.8rem;
        margin-bottom: 0.4rem;
      }

      .summary-total {
        font-size: 1rem;
        margin-top: 0.75rem;
        padding-top: 0.75rem;
      }

      .checkout-btn {
        padding: 0.65rem;
        font-size: 0.9rem;
        margin-top: 0.75rem;
      }
    }

    @media (max-width: 480px) {
      .cart-item {
        grid-template-columns: 60px 1fr auto;
        gap: 0.5rem;
        padding: 0.5rem;
      }

      .item-image {
        width: 60px;
        height: 60px;
      }

      .item-name {
        font-size: 0.85rem;
      }

      .item-brand {
        font-size: 0.7rem;
      }

      .item-price {
        font-size: 0.85rem;
      }

      .cart-summary {
        padding: 0.75rem;
      }

      .summary-title {
        font-size: 0.95rem;
      }

      .summary-row {
        font-size: 0.75rem;
        margin-bottom: 0.3rem;
      }

      .summary-total {
        font-size: 0.95rem;
        margin-top: 0.5rem;
        padding-top: 0.5rem;
      }

      .checkout-btn {
        padding: 0.6rem;
        font-size: 0.85rem;
        margin-top: 0.5rem;
      }
    }

    .empty-cart {
      text-align: center;
      padding: 3rem 1rem;
    }

    .empty-cart-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-cart-text {
      font-size: 1.1rem;
      color: #666;
      margin-bottom: 1.5rem;
    }

    .continue-shopping {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #000;
      color: white;
      text-decoration: none;
      border-radius: 0.375rem;
      font-weight: 600;
    }

    .continue-shopping:hover {
      background: #333;
    }

    @media (max-width: 480px) {
      .empty-cart {
        padding: 2rem 0.75rem;
      }

      .empty-cart-icon {
        font-size: 2.5rem;
      }

      .empty-cart-text {
        font-size: 1rem;
      }

      .continue-shopping {
        font-size: 0.9rem;
        padding: 0.6rem 1.2rem;
      }
    }
  `;

  @state() private cartItems: CartItem[] = [];

  async connectedCallback() {
    super.connectedCallback();
    await this._loadCart();

    // Listen for cart-updated events from other pages
    window.addEventListener("cart-updated", () => this._loadCart());
    // Listen for storage changes (for anonymous users)
    window.addEventListener("storage", this._loadCart.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("storage", this._loadCart.bind(this));
  }

  render() {
    if (this.cartItems.length === 0) {
      return html`
        <div class="empty-cart">
          <div class="empty-cart-icon">🛒</div>
          <div class="empty-cart-text">Your cart is empty</div>
          <a href="/products" class="continue-shopping">Continue Shopping</a>
        </div>
      `;
    }

    const subtotal = this.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const shipping = subtotal > 500 ? 0 : 50;
    const total = subtotal + shipping;

    return html`
      <h1>Shopping Cart</h1>

      <div class="cart-container">
        <div class="cart-items">
          ${this.cartItems.map(
            (item) => html`
              <div class="cart-item">
                <img
                  class="item-image"
                  src=${item.product.imageUrl}
                  alt=${item.product.name}
                />
                <div class="item-details">
                  <div class="item-name">${item.product.name}</div>
                  <div class="item-brand">${item.product.brand}</div>
                  ${item.selectedShade
                    ? html`
                        <div class="item-shade">
                          <span
                            class="shade-swatch-cart"
                            style="background-color: ${item.selectedShade
                              .hexCode}"
                            title=${item.selectedShade.name}
                          ></span>
                          <span class="shade-name"
                            >${item.selectedShade.name}</span
                          >
                        </div>
                      `
                    : ""}
                  <div class="item-price">
                    ${formatCurrency(item.price)} × ${item.quantity} =
                    ${formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
                <div class="item-controls">
                  <div class="quantity-controls">
                    <button
                      class="quantity-btn"
                      @click=${() =>
                        this._updateQuantity(
                          item.productId,
                          -1,
                          item.selectedShade,
                        )}
                    >
                      −
                    </button>
                    <span class="quantity">${item.quantity}</span>
                    <button
                      class="quantity-btn"
                      @click=${() =>
                        this._updateQuantity(
                          item.productId,
                          1,
                          item.selectedShade,
                        )}
                    >
                      +
                    </button>
                  </div>
                  <button
                    class="remove-btn"
                    @click=${() =>
                      this._removeItem(item.productId, item.selectedShade)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            `,
          )}
        </div>

        <div class="cart-summary">
          <div class="summary-title">Order Summary</div>
          <div class="summary-row">
            <span>Subtotal (${this.cartItems.length} items)</span>
            <span>${formatCurrency(subtotal)}</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span>${shipping === 0 ? "FREE" : formatCurrency(shipping)}</span>
          </div>
          ${shipping === 50
            ? html`
                <div
                  class="summary-row"
                  style="color: #059669; font-size: 0.875rem;"
                >
                  <span
                    >Add ${formatCurrency(500 - subtotal)} for FREE
                    shipping</span
                  >
                </div>
              `
            : ""}
          <div class="summary-total">
            <span>Total</span>
            <span>${formatCurrency(total)}</span>
          </div>
          <button class="checkout-btn" @click=${this._checkout}>
            Proceed to Checkout
          </button>
          <button class="clear-cart-btn" @click=${this._clearCart}>
            Clear Cart
          </button>
        </div>
      </div>
    `;
  }

  private async _loadCart() {
    if (true) { // authService.getCurrentUser()) {
      // Load from service
      try {
        const result = await cartServiceInstance.getCart();
        console.log("🛒 Cart loaded from service:", result);
        if (result.success) {
          // Transform service cart items to local format
          this.cartItems = result.cart.items.map(item => ({
            productId: item.productId,
            product: {
              id: item.productId,
              name: item.name,
              brand: item.brand || '',
              price: item.price,
              imageUrl: item.imageUrl,
            },
            quantity: item.quantity,
            price: item.price,
            selectedShade: item.shade,
          }));
          console.log("📦 Transformed cart items:", this.cartItems);
          this.requestUpdate();
        } else {
          this.cartItems = [];
          this.requestUpdate();
        }
      } catch (error) {
        console.error("❌ Error loading cart from service:", error);
        this.cartItems = [];
        this.requestUpdate();
      }
    } else {
      // Not authenticated - cart is empty
      this.cartItems = [];
    }
  }

  private async _updateQuantity(
    productId: string,
    change: number,
    selectedShade?: any,
  ) {
    const item = this.cartItems.find((i) => {
      const isSameProduct = i.productId === productId;
      const isSameShade = selectedShade
        ? i.selectedShade?.hexCode === selectedShade.hexCode
        : !i.selectedShade;
      return isSameProduct && isSameShade;
    });
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity > 0) {
        if (true) { // authService.getCurrentUser()) {
          // Update via service using updateQuantity instead of addToCart
          try {
            await cartServiceInstance.updateQuantity(productId, newQuantity);
            // Reload cart to get updated data
            await this._loadCart();
          } catch (error) {
            console.error("Error updating quantity:", error);
            NotificationService.show("Error updating cart", "error");
          }
        } else {
          // Update local - commented out
          // item.quantity = newQuantity;
          // this._saveCart();
        }
      } else if (newQuantity === 0) {
        // Remove item if quantity reaches 0
        await this._removeItem(productId, selectedShade);
      }
    }
  }

  private async _removeItem(productId: string, selectedShade?: any) {
    const itemToRemove = this.cartItems.find((i) => {
      const isSameProduct = i.productId === productId;
      const isSameShade = selectedShade
        ? i.selectedShade?.hexCode === selectedShade.hexCode
        : !i.selectedShade;
      return isSameProduct && isSameShade;
    });

    if (itemToRemove) {
      NotificationService.info(
        `Removed ${itemToRemove.product.name} from cart`,
      );
    }

    if (true) { // authService.getCurrentUser()) {
      // Remove via service
      try {
        await cartServiceInstance.removeFromCart(productId);
        // Reload cart
        await this._loadCart();
      } catch (error) {
        console.error("Error removing item:", error);
        NotificationService.show("Error removing item from cart", "error");
      }
    } else {
      // Remove from local - commented out
      // this.cartItems = this.cartItems.filter((i) => {
      //   const isSameProduct = i.productId !== productId;
      //   if (isSameProduct) return true;
      //   const isSameShade = selectedShade
      //     ? i.selectedShade?.hexCode === selectedShade.hexCode
      //     : !i.selectedShade;
      //   return !isSameShade;
      // });
      // this._saveCart();
    }
  }

  // _saveCart removed - using cloud functions instead

  private async _clearCart() {
    if (this.cartItems.length === 0) {
      NotificationService.info("Cart is already empty");
      return;
    }

    try {
      await cartServiceInstance.clearCart();
      this.cartItems = [];
      NotificationService.success("Cart cleared successfully");
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      console.error("Error clearing cart:", error);
      NotificationService.error("Error clearing cart");
    }
  }

  private _checkout() {
    window.location.href = "/checkout";
  }
}
