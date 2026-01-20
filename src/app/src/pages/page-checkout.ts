import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { formatCurrency } from "@itsme/shared-utils";

interface CartItem {
  productId: string;
  product: any;
  quantity: number;
  price: number;
}

interface SavedAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  label?: string;
}

@customElement("page-checkout")
export class PageCheckout extends LitElement {
  static styles = css`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 2rem;
    }

    .checkout-container {
      display: grid;
      gap: 2rem;
    }

    .section {
      background: white;
      border: 1px solid #e5e5e5;
      border-radius: 0.5rem;
      padding: 1.5rem;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    input,
    select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e5e5e5;
      border-radius: 0.375rem;
      font-size: 1rem;
      box-sizing: border-box;
    }

    input:focus,
    select:focus {
      outline: none;
      border-color: #000;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .order-summary {
      background: #f9fafb;
      padding: 1rem;
      border-radius: 0.375rem;
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

    .payment-methods {
      display: grid;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .payment-method {
      padding: 1rem;
      border: 2px solid #e5e5e5;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .payment-method:hover {
      border-color: #000;
    }

    .payment-method.selected {
      border-color: #000;
      background: #f9fafb;
    }

    .payment-method-icon {
      font-size: 1.5rem;
    }

    .payment-method-info {
      flex: 1;
    }

    .payment-method-name {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .payment-method-desc {
      font-size: 0.875rem;
      color: #666;
    }

    .place-order-btn {
      width: 100%;
      padding: 1rem;
      background: #000;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
    }

    .place-order-btn:hover {
      background: #333;
    }

    .place-order-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .info {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 0.375rem;
      padding: 1rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      color: #1e40af;
    }

    .success-message {
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 0.5rem;
      padding: 2rem;
      text-align: center;
    }

    .success-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .success-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .success-message p {
      margin: 0.5rem 0;
      color: #166534;
    }

    .continue-btn {
      margin-top: 1.5rem;
      padding: 0.75rem 1.5rem;
      background: #000;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 600;
    }

    .continue-btn:hover {
      background: #333;
    }

    .address-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .saved-address-display {
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 0.375rem;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .saved-address-label {
      display: inline-block;
      background: #dcfce7;
      color: #166534;
      padding: 0.25rem 0.75rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }

    .saved-address-text {
      color: #166534;
      font-size: 0.9375rem;
      line-height: 1.6;
      margin: 0.5rem 0;
    }

    .saved-address-text strong {
      font-weight: 600;
    }

    .address-toggle-btn {
      padding: 0.5rem 1rem;
      background: #e5e7eb;
      color: #000;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .address-toggle-btn:hover {
      background: #d1d5db;
    }

    .address-form {
      background: #f9fafb;
      padding: 1rem;
      border-radius: 0.375rem;
      margin-bottom: 1rem;
    }

    .address-form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-buttons {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .btn-save {
      padding: 0.75rem 1.5rem;
      background: #000;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s;
    }

    .btn-save:hover {
      background: #333;
    }

    .btn-cancel {
      padding: 0.75rem 1.5rem;
      background: #e5e7eb;
      color: #000;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-cancel:hover {
      background: #d1d5db;
    }
  `;

  @state() private cartItems: CartItem[] = [];
  @state() private paymentMethod = "cod";
  @state() private processing = false;
  @state() private orderPlaced = false;
  @state() private orderId = "";
  @state() private savedAddress: SavedAddress | null = null;
  @state() private editingAddress = false;
  @state() private editFormData: SavedAddress = {
    street: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    label: "Home",
  };

  connectedCallback() {
    super.connectedCallback();
    this._loadCart();
    this._loadSavedAddress();
  }

  private _loadSavedAddress() {
    const addressData = localStorage.getItem("savedAddress");
    if (addressData) {
      try {
        this.savedAddress = JSON.parse(addressData);
      } catch (e) {
        console.error("Error parsing address:", e);
      }
    }
  }

  private _toggleAddressEdit() {
    if (!this.editingAddress && this.savedAddress) {
      this.editFormData = { ...this.savedAddress };
    } else if (!this.editingAddress) {
      this.editFormData = {
        street: "",
        city: "",
        state: "",
        zip: "",
        phone: "",
        label: "Home",
      };
    }
    this.editingAddress = !this.editingAddress;
  }

  private _updateAddressField(field: keyof SavedAddress, value: string) {
    this.editFormData = { ...this.editFormData, [field]: value };
  }

  private _saveAddress() {
    this.savedAddress = { ...this.editFormData };
    localStorage.setItem("savedAddress", JSON.stringify(this.savedAddress));
    this.editingAddress = false;
  }

  render() {
    if (this.orderPlaced) {
      return html`
        <div class="success-message">
          <div class="success-icon">✅</div>
          <div class="success-title">Order Placed Successfully!</div>
          <p>Order ID: <strong>${this.orderId}</strong></p>
          <p>Thank you for your purchase. Your order is being processed.</p>
          <p>You will receive a confirmation email shortly.</p>
          <button
            class="continue-btn"
            @click=${() => (window.location.href = "/products")}
          >
            Continue Shopping
          </button>
        </div>
      `;
    }

    if (this.cartItems.length === 0) {
      return html`
        <div class="info">
          Your cart is empty. <a href="/products">Continue shopping</a>
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
      <h1>Checkout</h1>

      <div class="info">
        🎭 This is a payment simulation. No real payment will be processed!
      </div>

      <div class="checkout-container">
        <div class="section">
          <div class="address-header">
            <div class="section-title">Shipping Address</div>
            ${this.savedAddress && !this.editingAddress
              ? html`<button
                  class="address-toggle-btn"
                  @click=${this._toggleAddressEdit}
                >
                  Edit Address
                </button>`
              : html``}
          </div>

          ${this.editingAddress
            ? html`
                <div class="address-form">
                  <div class="form-group">
                    <label>Label</label>
                    <input
                      type="text"
                      .value=${this.editFormData.label || ""}
                      @input=${(e: any) =>
                        this._updateAddressField("label", e.target.value)}
                      placeholder="e.g., Home, Office"
                    />
                  </div>

                  <div class="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      .value=${this.editFormData.phone || ""}
                      @input=${(e: any) =>
                        this._updateAddressField("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div class="form-group">
                    <label>Street Address</label>
                    <input
                      type="text"
                      .value=${this.editFormData.street || ""}
                      @input=${(e: any) =>
                        this._updateAddressField("street", e.target.value)}
                      placeholder="123 Fashion Street"
                    />
                  </div>

                  <div class="address-form-row">
                    <div class="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        .value=${this.editFormData.city || ""}
                        @input=${(e: any) =>
                          this._updateAddressField("city", e.target.value)}
                        placeholder="Mumbai"
                      />
                    </div>
                    <div class="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        .value=${this.editFormData.state || ""}
                        @input=${(e: any) =>
                          this._updateAddressField("state", e.target.value)}
                        placeholder="Maharashtra"
                      />
                    </div>
                  </div>

                  <div class="form-group">
                    <label>Postal Code</label>
                    <input
                      type="text"
                      .value=${this.editFormData.zip || ""}
                      @input=${(e: any) =>
                        this._updateAddressField("zip", e.target.value)}
                      placeholder="400001"
                    />
                  </div>

                  <div class="form-buttons">
                    <button class="btn-save" @click=${this._saveAddress}>
                      Save Address
                    </button>
                    <button
                      class="btn-cancel"
                      @click=${this._toggleAddressEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              `
            : html`
                ${this.savedAddress
                  ? html`
                      <div class="saved-address-display">
                        <div class="saved-address-label">
                          ${this.savedAddress.label || "Home"}
                        </div>
                        <div class="saved-address-text">
                          <strong>${this.savedAddress.street}</strong><br />
                          ${this.savedAddress.city}, ${this.savedAddress.state}
                          - ${this.savedAddress.zip}<br />
                          <br />
                          <strong>Phone:</strong> ${this.savedAddress.phone}
                        </div>
                        <button
                          class="address-toggle-btn"
                          @click=${this._toggleAddressEdit}
                          style="margin-top: 1rem;"
                        >
                          Edit Address
                        </button>
                      </div>
                    `
                  : html`
                      <div
                        style="padding: 1rem; background: #fef3c7; border-radius: 0.375rem; margin-bottom: 1rem;"
                      >
                        <p style="color: #92400e; margin: 0;">
                          No saved address found. Please add one below.
                        </p>
                      </div>
                      <button
                        class="address-toggle-btn"
                        @click=${this._toggleAddressEdit}
                        style="background: #000; color: white; border: none; cursor: pointer;"
                      >
                        + Add Address
                      </button>
                    `}
              `}
        </div>

        <div class="section">
          <div class="section-title">Payment Method</div>
          <div class="payment-methods">
            <div
              class="payment-method ${this.paymentMethod === "cod"
                ? "selected"
                : ""}"
              @click=${() => (this.paymentMethod = "cod")}
            >
              <div class="payment-method-icon">💵</div>
              <div class="payment-method-info">
                <div class="payment-method-name">Cash on Delivery</div>
                <div class="payment-method-desc">
                  Pay when you receive your order
                </div>
              </div>
            </div>
            <div
              class="payment-method ${this.paymentMethod === "upi"
                ? "selected"
                : ""}"
              @click=${() => (this.paymentMethod = "upi")}
            >
              <div class="payment-method-icon">📱</div>
              <div class="payment-method-info">
                <div class="payment-method-name">UPI Payment</div>
                <div class="payment-method-desc">
                  PhonePe, Google Pay, Paytm (Simulated)
                </div>
              </div>
            </div>
            <div
              class="payment-method ${this.paymentMethod === "card"
                ? "selected"
                : ""}"
              @click=${() => (this.paymentMethod = "card")}
            >
              <div class="payment-method-icon">💳</div>
              <div class="payment-method-info">
                <div class="payment-method-name">Credit/Debit Card</div>
                <div class="payment-method-desc">
                  Visa, Mastercard, Rupay (Simulated)
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Order Summary</div>
          <div class="order-summary">
            <div class="summary-row">
              <span>Subtotal (${this.cartItems.length} items)</span>
              <span>${formatCurrency(subtotal)}</span>
            </div>
            <div class="summary-row">
              <span>Shipping</span>
              <span>${shipping === 0 ? "FREE" : formatCurrency(shipping)}</span>
            </div>
            <div class="summary-total">
              <span>Total</span>
              <span>${formatCurrency(total)}</span>
            </div>
          </div>
          <button
            class="place-order-btn"
            @click=${this._placeOrder}
            ?disabled=${this.processing}
          >
            ${this.processing
              ? "Processing..."
              : `Place Order - ${formatCurrency(total)}`}
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
    }
  }

  private async _placeOrder() {
    this.processing = true;

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check if address is saved
    if (!this.savedAddress) {
      alert("Please add and save your shipping address first.");
      this.processing = false;
      return;
    }

    // Generate order ID
    this.orderId = `ORD${Date.now().toString(36).toUpperCase()}`;

    const subtotal = this.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const shipping = subtotal > 500 ? 0 : 50;
    const total = subtotal + shipping;

    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const order = {
      id: this.orderId,
      orderDate: new Date().toLocaleDateString(),
      items: this.cartItems.map((item) => ({
        productName: item.product.name || item.productId,
        quantity: item.quantity,
        price: item.price * item.quantity,
        image: item.product.imageUrl || item.product.image,
      })),
      paymentMethod: this.paymentMethod,
      total: total,
      status: "confirmed",
      shippingAddress: {
        street: this.savedAddress.street,
        city: this.savedAddress.city,
        state: this.savedAddress.state,
        zip: this.savedAddress.zip,
      },
      createdAt: new Date().toISOString(),
    };
    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));

    // Clear cart
    localStorage.removeItem("cart");

    // Show success
    this.processing = false;
    this.orderPlaced = true;
  }
}
