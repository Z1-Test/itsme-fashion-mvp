import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { formatCurrency } from "@itsme/shared-utils";
import { NotificationService } from "../../../packages/design-system/src/notification-service";

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
      margin-bottom: 2rem;
    }

    .cart-container {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 2rem;
    }

    @media (max-width: 768px) {
      .cart-container {
        grid-template-columns: 1fr;
      }
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cart-item {
      display: grid;
      grid-template-columns: 100px 1fr auto;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #e5e5e5;
      border-radius: 0.5rem;
      align-items: center;
    }

    .item-image {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 0.375rem;
    }

    .item-details {
      flex: 1;
    }

    .item-name {
      font-weight: 600;
      font-size: 1.125rem;
      margin-bottom: 0.25rem;
    }

    .item-brand {
      color: #666;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .item-price {
      font-weight: 600;
      color: #000;
    }

    .item-shade {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #555;
    }

    .shade-swatch-cart {
      width: 1rem;
      height: 1rem;
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
      gap: 1rem;
      align-items: flex-end;
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

    .quantity {
      min-width: 2rem;
      text-align: center;
      font-weight: 600;
    }

    .remove-btn {
      background: none;
      border: none;
      color: #dc2626;
      cursor: pointer;
      font-size: 0.875rem;
      text-decoration: underline;
    }

    .remove-btn:hover {
      color: #991b1b;
    }

    .cart-summary {
      border: 1px solid #e5e5e5;
      border-radius: 0.5rem;
      padding: 1.5rem;
      height: fit-content;
      position: sticky;
      top: 1rem;
    }

    .summary-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      font-size: 0.9375rem;
    }

    .summary-total {
      display: flex;
      justify-content: space-between;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 2px solid #e5e5e5;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .checkout-btn {
      width: 100%;
      padding: 1rem;
      background: #000;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      margin-top: 1rem;
      transition: background 0.2s;
    }

    .checkout-btn:hover {
      background: #333;
    }

    .checkout-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .empty-cart {
      text-align: center;
      padding: 4rem;
    }

    .empty-cart-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-cart-text {
      font-size: 1.25rem;
      color: #666;
      margin-bottom: 2rem;
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
  `;

  @state() private cartItems: CartItem[] = [];

  connectedCallback() {
    super.connectedCallback();
    this._loadCart();

    // Listen for storage changes
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
                      @click=${() => this._updateQuantity(item.productId, -1)}
                    >
                      −
                    </button>
                    <span class="quantity">${item.quantity}</span>
                    <button
                      class="quantity-btn"
                      @click=${() => this._updateQuantity(item.productId, 1)}
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
        </div>
      </div>
    `;
  }

  private _loadCart() {
    const cartData = localStorage.getItem("cart");
    if (cartData) {
      const cart = JSON.parse(cartData);
      this.cartItems = cart.items || [];
    } else {
      this.cartItems = [];
    }
  }

  private _updateQuantity(
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
      if (newQuantity > 0 && newQuantity <= item.product.stock) {
        item.quantity = newQuantity;
        this._saveCart();
      }
    }
  }

  private _removeItem(productId: string, selectedShade?: any) {
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

    this.cartItems = this.cartItems.filter((i) => {
      const isSameProduct = i.productId !== productId;
      if (isSameProduct) return true;
      const isSameShade = selectedShade
        ? i.selectedShade?.hexCode === selectedShade.hexCode
        : !i.selectedShade;
      return !isSameShade;
    });
    this._saveCart();
  }

  private _saveCart() {
    const cart = { items: this.cartItems };
    localStorage.setItem("cart", JSON.stringify(cart));
    this.requestUpdate();
  }

  private _checkout() {
    window.location.href = "/checkout";
  }
}
