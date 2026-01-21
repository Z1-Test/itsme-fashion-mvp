import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { formatCurrency } from "@itsme/shared-utils";
import { addressService } from "../services";
import { authService } from "../services";
import { NotificationService } from "../services";
import type { Address } from "../services/address";

interface MockUser {
  email: string;
  displayName: string;
  avatar?: string;
}

interface SavedAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  label?: string;
}

interface Order {
  id: string;
  orderDate: string;
  total: number;
  status: string;
  items: OrderItem[];
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
  image?: string;
}

@customElement("page-profile")
export class PageProfile extends LitElement {
  static styles = css`
    :host {
      display: block;
      max-width: 1200px;
      margin: 0 auto;
    }

    .container {
      padding: 1.5rem;
    }

    h1 {
      margin-bottom: 1.5rem;
      color: #000;
      font-size: 1.75rem;
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: white;
      border: 1px solid #e5e5e5;
      border-radius: 0.5rem;
      flex-wrap: wrap;
    }

    .profile-avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 3rem;
      flex-shrink: 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .profile-header-info {
      flex: 1;
      min-width: 200px;
    }

    .profile-header-info h2 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      color: #000;
    }

    .profile-header-info p {
      color: #666;
      margin: 0.25rem 0;
      font-size: 0.95rem;
    }

    .profile-grid {
      display: block;
      margin-bottom: 0.5rem;
    }

    .profile-card {
      background: white;
      border: 1px solid #e5e5e5;
      border-radius: 0.5rem;
      padding: 2rem;
    }

    .address-section {
      background: white;
      border: 1px solid #e5e5e5;
      border-radius: 0.5rem;
      padding: 2rem;
      margin-bottom: 2rem;
    }

    .address-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .address-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #000;
    }

    .edit-address-btn {
      padding: 0.5rem 1rem;
      background: #f3f4f6;
      color: #000;
      border: 1px solid #e5e5e5;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.8rem;
      transition: all 0.2s;
      padding: 0.6rem 1.2rem;
    }

    .edit-address-btn:hover {
      background: #e5e7eb;
      border-color: #d1d5db;
    }

    .address-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .address-card {
      border: 2px solid #e5e5e5;
      border-radius: 0.375rem;
      padding: 1rem;
      background: #f9fafb;
    }

    .address-label {
      font-weight: 600;
      color: #000;
      margin-bottom: 0.5rem;
      display: inline-block;
      padding: 0.2rem 0.6rem;
      background: #e5e7eb;
      border-radius: 0.25rem;
      font-size: 0.7rem;
      text-transform: uppercase;
    }

    .address-text {
      color: #666;
      font-size: 0.9rem;
      line-height: 1.6;
      margin-top: 0.5rem;
    }

    .address-form {
      display: grid;
      gap: 0.75rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .form-group label {
      font-weight: 500;
      color: #333;
      font-size: 0.85rem;
    }

    .form-group input {
      padding: 0.65rem;
      border: 1px solid #e5e5e5;
      border-radius: 0.375rem;
      font-size: 0.95rem;
    }

    .form-group input:focus {
      outline: none;
      border-color: #000;
    }

    .form-buttons {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .btn-save {
      padding: 0.6rem 1.2rem;
      background: #000;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: background 0.2s;
    }

    .btn-save:hover {
      background: #333;
    }

    .btn-cancel {
      padding: 0.6rem 1.2rem;
      background: #e5e7eb;
      color: #000;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.2s;
    }

    .btn-cancel:hover {
      background: #d1d5db;
    }

    .profile-section-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: #000;
    }

    .profile-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    @media (max-width: 768px) {
      .profile-info {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }

      .address-content {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }
    }

    @media (max-width: 480px) {
      :host {
        overflow-x: hidden;
      }

      .profile-info {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }
    }

    .info-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;
    }

    .info-label {
      font-size: 0.8rem;
      color: #666;
      font-weight: 500;
    }

    .info-value {
      font-size: 1rem;
      color: #000;
      font-weight: 500;
    }

    .edit-btn {
      padding: 0.6rem 1.2rem;
      background: #000;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: background 0.2s;
      align-self: flex-start;
    }

    .edit-btn:hover {
      background: #333;
    }

    .orders-section {
      margin-top: 3rem;
    }

    .orders-section h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: #000;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .order-card {
      background: white;
      border: 1px solid #e5e5e5;
      border-radius: 0.5rem;
      padding: 1.5rem;
      cursor: pointer;
      transition: box-shadow 0.2s;
    }

    .order-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      gap: 1rem;
    }

    .order-id-date {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .order-id {
      font-weight: 600;
      color: #000;
    }

    .order-date {
      font-size: 0.875rem;
      color: #666;
    }

    .order-status {
      display: inline-block;
      padding: 0.375rem 1rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .order-status-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .order-status-confirmed {
      background: #dcfce7;
      color: #166534;
    }

    .order-status-shipped {
      background: #dbeafe;
      color: #1e40af;
    }

    .order-status-delivered {
      background: #c6f6d5;
      color: #22543d;
    }

    .order-items {
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e5e5e5;
    }

    .order-item {
      display: grid;
      grid-template-columns: 70px 1fr 80px 100px;
      gap: 0.75rem;
      align-items: center;
      padding: 0.75rem;
      background: #f9fafb;
      border-radius: 0.375rem;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .order-item:last-child {
      margin-bottom: 0;
    }

    .item-image {
      width: 70px;
      height: 70px;
      background-color: #e5e5e5;
      border-radius: 0.375rem;
      object-fit: cover;
      border: 1px solid #d1d5db;
    }

    .item-details {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    @media (max-width: 768px) {
      .order-item {
        grid-template-columns: 60px 1fr 70px;
        gap: 0.5rem;
        padding: 0.6rem;
        margin-bottom: 0.4rem;
      }

      .item-image {
        width: 60px;
        height: 60px;
      }

      .order-item-price,
      .order-item-qty {
        text-align: right;
        font-size: 0.8rem;
      }
    }

    @media (max-width: 480px) {
      .order-card {
        padding: 1rem;
        margin-bottom: 1rem;
      }

      .order-header {
        flex-direction: column;
        gap: 0.75rem;
      }

      .order-id-date {
        width: 100%;
      }

      .order-id {
        font-size: 0.9rem;
        word-break: break-word;
      }

      .order-status {
        align-self: flex-start;
        padding: 0.35rem 0.75rem;
        font-size: 0.8rem;
      }

      .order-item {
        grid-template-columns: 50px 1fr;
        gap: 0.4rem;
        padding: 0.5rem;
        margin-bottom: 0.3rem;
        font-size: 0.8rem;
      }

      .item-image {
        width: 50px;
        height: 50px;
      }

      .order-item-price,
      .order-item-qty {
        display: none;
      }
    }
    .item-name {
      font-weight: 600;
      color: #000;
      font-size: 1rem;
    }

    .item-sku {
      font-size: 0.75rem;
      color: #999;
    }

    .item-qty {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f0f0f0 0%, #e5e5e5 100%);
      padding: 0.35rem 0.65rem;
      border-radius: 0.25rem;
      font-weight: 600;
      color: #333;
      font-size: 0.8rem;
      border: 1px solid #d5d5d5;
      white-space: nowrap;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .item-price {
      font-weight: 700;
      color: #000;
      text-align: right;
      font-size: 1rem;
    }

    .collapsed-preview {
      display: flex;
      gap: 0.5rem;
      padding: 0.75rem 0;
      align-items: center;
      flex-wrap: wrap;
    }

    .item-preview {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: #f3f4f6;
      border-radius: 0.375rem;
      font-size: 0.75rem;
    }

    .item-preview-img {
      width: 35px;
      height: 35px;
      background-color: #e5e5e5;
      border-radius: 0.25rem;
      object-fit: cover;
    }

    .order-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
      font-size: 1.125rem;
      font-weight: 700;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 2px solid #e5e5e5;
    }

    .shipping-info {
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 0.375rem;
      font-size: 0.9375rem;
      color: #166534;
    }

    .shipping-info strong {
      display: block;
      margin-bottom: 0.5rem;
      color: #15803d;
      font-weight: 700;
    }

    .shipping-info div {
      margin: 0.25rem 0;
      line-height: 1.5;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
      background: white;
      border: 1px solid #e5e5e5;
      border-radius: 0.5rem;
    }

    .empty-state h3 {
      margin-bottom: 1rem;
      color: #000;
    }

    .empty-state a {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: #000;
      color: white;
      border-radius: 0.375rem;
      text-decoration: none;
      font-weight: 600;
      transition: background 0.2s;
    }

    .empty-state a:hover {
      background: #333;
    }

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      h1 {
        font-size: 1.5rem;
        margin-bottom: 1.25rem;
      }

      .profile-header {
        padding: 1rem;
        gap: 1rem;
      }

      .profile-avatar {
        width: 100px;
        height: 100px;
        font-size: 2.5rem;
      }

      .profile-header-info h2 {
        font-size: 1.25rem;
      }

      .profile-section-title {
        font-size: 1.1rem;
        margin-bottom: 1rem;
      }

      .address-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .address-content {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }

      .address-card {
        padding: 0.75rem;
      }

      .edit-address-btn {
        padding: 0.5rem 1rem;
        font-size: 0.75rem;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 0.6rem;
      }

      .form-group input {
        padding: 0.55rem;
        font-size: 0.9rem;
      }

      .form-buttons {
        gap: 0.6rem;
      }

      .btn-save,
      .btn-cancel {
        padding: 0.55rem 1rem;
        font-size: 0.85rem;
      }

      .empty-state {
        padding: 2rem 1rem;
      }

      .empty-state-icon {
        font-size: 2.5rem;
      }

      .empty-state h2 {
        font-size: 1.1rem;
      }

      .empty-state a {
        padding: 0.6rem 1.2rem;
        font-size: 0.85rem;
      }
    }

    @media (max-width: 480px) {
      .container {
        padding: 0.75rem;
      }

      h1 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
      }

      .profile-header {
        padding: 0.75rem;
        gap: 0.75rem;
        flex-direction: column;
        text-align: center;
      }

      .profile-avatar {
        width: 90px;
        height: 90px;
        font-size: 2rem;
      }

      .profile-header-info {
        min-width: 100%;
      }

      .profile-header-info h2 {
        font-size: 1.1rem;
      }

      .profile-header-info p {
        font-size: 0.85rem;
      }

      .profile-section-title {
        font-size: 1rem;
        margin-bottom: 0.75rem;
      }

      .profile-info {
        gap: 0.5rem;
      }

      .info-label {
        font-size: 0.75rem;
      }

      .info-value {
        font-size: 0.95rem;
      }

      .edit-btn {
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
      }

      .address-content {
        gap: 0.5rem;
      }

      .address-card {
        padding: 0.6rem;
      }

      .address-text {
        font-size: 0.85rem;
      }

      .form-group label {
        font-size: 0.8rem;
      }

      .form-group input {
        padding: 0.5rem;
        font-size: 0.85rem;
      }

      .btn-save,
      .btn-cancel {
        padding: 0.5rem 0.9rem;
        font-size: 0.8rem;
        flex: 1;
      }

      .form-buttons {
        gap: 0.5rem;
      }

      .empty-state {
        padding: 1.5rem 0.75rem;
      }

      .empty-state-icon {
        font-size: 2rem;
      }

      .empty-state h2 {
        font-size: 1rem;
      }

      .empty-state a {
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
      }
    }
  `;

  @state() private currentUser: MockUser | null = null;
  @state() private orders: Order[] = [];
  @state() private expandedOrderId: string | null = null;
  @state() private editingAddress = false;
  @state() private savedAddress: SavedAddress | null = null;
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
    this._loadUserAndOrders();
    this._loadAddresses();
  }

  private _loadUserAndOrders() {
    // Load user from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      this.currentUser = JSON.parse(userData);
    } else {
      // Redirect to login if not authenticated
      window.location.href = "/login";
      return;
    }

    // Load orders from localStorage
    const ordersData = localStorage.getItem("orders");
    if (ordersData) {
      try {
        this.orders = JSON.parse(ordersData);
      } catch (e) {
        console.error("Error parsing orders:", e);
        this.orders = [];
      }
    } else {
      this.orders = [];
    }

    // Load saved address from localStorage or use mock address
    const addressData = localStorage.getItem("savedAddress");
    if (addressData) {
      try {
        this.savedAddress = JSON.parse(addressData);
      } catch (e) {
        console.error("Error parsing address:", e);
        this._initializeMockAddress();
      }
    } else {
      this._initializeMockAddress();
    }
  }

  private _initializeMockAddress() {
    // Initialize with mock address
    this.savedAddress = {
      label: "Home",
      street: "123 Fashion Street, 5th Floor",
      city: "Mumbai",
      state: "Maharashtra",
      zip: "400001",
      phone: "+91 98765 43210",
    };
    localStorage.setItem("savedAddress", JSON.stringify(this.savedAddress));
  }

  private _toggleEditAddress() {
    if (!this.editingAddress && this.savedAddress) {
      this.editFormData = { ...this.savedAddress };
    }
    this.editingAddress = !this.editingAddress;
  }

  private _updateAddressField(field: keyof SavedAddress, value: string) {
    this.editFormData = { ...this.editFormData, [field]: value };
  }

  private async _saveAddress() {
    try {
      const user = authService.getCurrentUser();
      if (!user || !user.uid) {
        NotificationService.error("User not authenticated");
        return;
      }

      const addressData: Address = {
        uid: user.uid,
        street: this.editFormData.street,
        city: this.editFormData.city,
        state: this.editFormData.state,
        zip: this.editFormData.zip,
        phone: this.editFormData.phone,
        label: this.editFormData.label || "Home",
      };

      // Save address
      await addressService.saveAddress(addressData);

      NotificationService.success("Address saved successfully");

      this.editingAddress = false;
      this.savedAddress = { ...this.editFormData };
      localStorage.setItem("savedAddress", JSON.stringify(this.savedAddress));
    } catch (error) {
      console.error("Error saving address:", error);
      NotificationService.error(`Error saving address: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private async _loadAddresses() {
    try {
      const user = authService.getCurrentUser();
      if (!user || !user.uid) return;

      const addresses = await addressService.getAddresses(user.uid);
      if (addresses.length > 0) {
        const address = addresses[0];
        this.savedAddress = {
          label: address.label || "Home",
          street: address.street,
          city: address.city,
          state: address.state,
          zip: address.zip,
          phone: address.phone,
        };
        localStorage.setItem("savedAddress", JSON.stringify(this.savedAddress));
      } else {
        this._initializeMockAddress();
      }
    } catch (error) {
      console.error("Error loading addresses:", error);
      this._initializeMockAddress();
    }
  }

  private _toggleOrderExpanded(orderId: string) {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  render() {
    if (!this.currentUser) {
      return html`<div class="container">Loading...</div>`;
    }

    const displayName = this.currentUser.displayName || "User";
    const initials = displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

    return html`
      <div class="container">
        <h1>My Profile</h1>

        <!-- Profile Header with Avatar -->
        <div class="profile-header">
          <div class="profile-avatar">${initials}</div>
          <div class="profile-header-info">
            <h2>${displayName}</h2>
            <p>${this.currentUser.email || "No email"}</p>
            <p style="font-size: 0.875rem; color: #999;">
              Member since January 2026
            </p>
          </div>
        </div>

        <!-- Saved Address Section -->
        <div class="address-section">
          <div class="address-header">
            <h3 class="address-title">📍 Saved Address</h3>
            <button class="edit-address-btn" @click=${this._toggleEditAddress}>
              ${this.editingAddress ? "Cancel" : "Edit Address"}
            </button>
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

                  <div class="form-row">
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
                      @click=${this._toggleEditAddress}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              `
            : html`
                ${this.savedAddress
                  ? html`
                      <div class="address-content">
                        <div class="address-card">
                          <div class="address-label">
                            ${this.savedAddress.label || "Home"}
                          </div>
                          <div class="address-text">
                            <strong>${this.savedAddress.street}</strong><br />
                            ${this.savedAddress.city},
                            ${this.savedAddress.state}
                            ${this.savedAddress.zip}<br />
                            <br />
                            <strong>Phone:</strong> ${this.savedAddress.phone}
                          </div>
                        </div>
                      </div>
                    `
                  : html`<p>No address saved yet.</p>`}
              `}
        </div>

        <h2
          style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; color: #000; margin-top: 2rem;"
        >
          📊 Account Statistics
        </h2>
        <div class="profile-card">
          <div class="profile-info">
            <div class="info-group">
              <span class="info-label">Total Orders</span>
              <span class="info-value">${this.orders.length}</span>
            </div>

            <div class="info-group">
              <span class="info-label">Total Spent</span>
              <span class="info-value">
                ${formatCurrency(
                  this.orders.reduce((sum, order) => sum + order.total, 0),
                )}
              </span>
            </div>

            <div class="info-group">
              <span class="info-label">Active Orders</span>
              <span class="info-value">
                ${this.orders.filter(
                  (order) =>
                    order.status !== "delivered" &&
                    order.status !== "cancelled",
                ).length}
              </span>
            </div>
          </div>
        </div>

        <!-- Orders Section -->
        <div class="orders-section">
          <h2>📦 Order History</h2>

          ${this.orders.length === 0
            ? html`
                <div class="empty-state">
                  <h3>No Orders Yet</h3>
                  <p>You haven't placed any orders yet. Start shopping now!</p>
                  <a href="/products">Browse Products</a>
                </div>
              `
            : html`
                <div class="orders-list">
                  ${this.orders.map(
                    (order) => html`
                      <div
                        class="order-card"
                        @click=${() => this._toggleOrderExpanded(order.id)}
                      >
                        <div class="order-header">
                          <div class="order-id-date">
                            <span class="order-id">Order #${order.id}</span>
                            <span class="order-date">${order.orderDate}</span>
                          </div>
                          <span
                            class="order-status order-status-${order.status}"
                          >
                            ${order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                          </span>
                        </div>

                        ${this.expandedOrderId !== order.id
                          ? html`
                              <div class="collapsed-preview">
                                ${order.items.slice(0, 3).map(
                                  (item) => html`
                                    <div class="item-preview">
                                      <img
                                        src="${item.image ||
                                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='35' height='35'%3E%3Crect fill='%23e5e5e5' width='35' height='35'/%3E%3C/svg%3E"}"
                                        alt="${item.productName}"
                                        class="item-preview-img"
                                        @error=${(e: any) => {
                                          e.target.src =
                                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='35' height='35'%3E%3Crect fill='%23e5e5e5' width='35' height='35'/%3E%3C/svg%3E";
                                        }}
                                      />
                                      <span>${item.productName}</span>
                                    </div>
                                  `,
                                )}
                                ${order.items.length > 3
                                  ? html`<div class="item-preview">
                                      +${order.items.length - 3} more
                                    </div>`
                                  : html``}
                              </div>
                            `
                          : html``}
                        ${this.expandedOrderId === order.id
                          ? html`
                              <div class="order-items">
                                <div
                                  style="font-weight: 600; margin-bottom: 0.75rem; color: #000;"
                                >
                                  Items Ordered:
                                </div>
                                ${order.items.map(
                                  (item) => html`
                                    <div class="order-item">
                                      <img
                                        src="${item.image ||
                                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23e5e5e5' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='12' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E"}"
                                        alt="${item.productName}"
                                        class="item-image"
                                        @error=${(e: any) => {
                                          e.target.src =
                                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23e5e5e5' width='80' height='80'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='12' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";
                                        }}
                                      />
                                      <div class="item-details">
                                        <div class="item-name">
                                          ${item.productName}
                                        </div>
                                        <div class="item-sku">
                                          SKU: ITEM-001
                                        </div>
                                      </div>
                                      <div class="item-qty">
                                        ${item.quantity}
                                        item${item.quantity !== 1 ? "s" : ""}
                                      </div>
                                      <div class="item-price">
                                        ${formatCurrency(item.price)}
                                      </div>
                                    </div>
                                  `,
                                )}
                              </div>

                              ${order.shippingAddress
                                ? html`
                                    <div class="shipping-info">
                                      <strong>📮 Shipping Address</strong>
                                      <div>
                                        <strong
                                          >${order.shippingAddress
                                            .street}</strong
                                        >
                                      </div>
                                      <div>
                                        ${order.shippingAddress.city},
                                        ${order.shippingAddress.state} -
                                        ${order.shippingAddress.zip}
                                      </div>
                                    </div>
                                  `
                                : html``}
                            `
                          : html``}

                        <div class="order-total">
                          <span>Order Total:</span>
                          <span>${formatCurrency(order.total)}</span>
                        </div>
                      </div>
                    `,
                  )}
                </div>
              `}
        </div>
      </div>
    `;
  }
}
