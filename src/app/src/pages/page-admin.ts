import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { isUserAdmin } from "../services/admin-guard";
import { getAllOrders, getOrderStatistics, updateOrderStatus } from "../services/admin-functions";
import { NotificationService } from "../../../packages/design-system/src/notification-service";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  byStatus: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  byPaymentStatus: {
    pending: number;
    completed: number;
    failed: number;
    refunded: number;
  };
}

@customElement("page-admin")
export class PageAdmin extends LitElement {
  @state() orders: Order[] = [];
  @state() selectedOrder: Order | null = null;
  @state() stats: OrderStats | null = null;
  @state() loading = false;
  @state() view: "dashboard" | "orders" | "order-detail" = "dashboard";
  @state() filterStatus = "";
  @state() filterPaymentStatus = "";
  @state() searchQuery = "";
  @state() isAdmin = false;
  @state() isCheckingAuth = true;
  @state() accessDenied = false;

  static styles = css`
    :host {
      display: block;
      background: #f5f5f5;
      min-height: 100vh;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    header h1 {
      margin: 0;
      font-size: 2rem;
    }

    .nav-buttons {
      display: flex;
      gap: 1rem;
    }

    .nav-buttons button {
      padding: 0.75rem 1.5rem;
      background: #000;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s;
    }

    .nav-buttons button:hover {
      background: #333;
    }

    .nav-buttons button.active {
      background: #2563eb;
    }

    /* Dashboard Styles */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .stat-card h3 {
      margin: 0 0 0.5rem 0;
      color: #666;
      font-size: 0.875rem;
      text-transform: uppercase;
    }

    .stat-card .value {
      font-size: 2rem;
      font-weight: 700;
      color: #000;
    }

    .stat-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e5e5;
    }

    .stat-row-item {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
    }

    /* Orders Table Styles */
    .filters {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .filter-input,
    .filter-select {
      padding: 0.5rem 1rem;
      border: 1px solid #e5e5e5;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .filter-input {
      flex: 1;
      min-width: 200px;
    }

    .filter-button {
      padding: 0.5rem 1rem;
      background: #000;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s;
    }

    .filter-button:hover {
      background: #333;
    }

    .export-button {
      padding: 0.5rem 1rem;
      background: #10b981;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s;
    }

    .export-button:hover {
      background: #059669;
    }

    .orders-table {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: #f9f9f9;
      border-bottom: 2px solid #e5e5e5;
    }

    th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      font-size: 0.875rem;
      text-transform: uppercase;
      color: #666;
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid #e5e5e5;
      font-size: 0.875rem;
    }

    tbody tr:hover {
      background: #f5f5f5;
    }

    tbody tr {
      cursor: pointer;
      transition: background 0.2s;
    }

    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: capitalize;
    }

    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .status-processing {
      background: #dbeafe;
      color: #0c2d6b;
    }

    .status-shipped {
      background: #d1fae5;
      color: #065f46;
    }

    .status-delivered {
      background: #dcfce7;
      color: #166534;
    }

    .status-cancelled {
      background: #fee2e2;
      color: #991b1b;
    }

    /* Order Detail Modal */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 2rem;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      max-width: 800px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      padding: 2rem;
      box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      border-bottom: 2px solid #e5e5e5;
      padding-bottom: 1rem;
    }

    .modal-header h2 {
      margin: 0;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
      transition: color 0.2s;
    }

    .close-button:hover {
      color: #000;
    }

    .order-section {
      margin-bottom: 1.5rem;
    }

    .order-section h3 {
      font-size: 0.875rem;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 0.75rem;
      border-bottom: 1px solid #e5e5e5;
      padding-bottom: 0.5rem;
    }

    .order-info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
    }

    .info-label {
      font-size: 0.75rem;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 0.25rem;
    }

    .info-value {
      font-weight: 600;
      color: #000;
    }

    .items-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .items-list li {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid #e5e5e5;
    }

    .items-list li:last-child {
      border-bottom: none;
    }

    .item-name {
      flex: 1;
    }

    .item-qty {
      color: #666;
      margin: 0 1rem;
    }

    .item-price {
      font-weight: 600;
      min-width: 80px;
      text-align: right;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
      border-top: 1px solid #e5e5e5;
      padding-top: 1.5rem;
    }

    .modal-actions button {
      flex: 1;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s;
    }

    .action-primary {
      background: #2563eb;
      color: white;
    }

    .action-primary:hover {
      background: #1d4ed8;
    }

    .action-secondary {
      background: #e5e5e5;
      color: #000;
    }

    .action-secondary:hover {
      background: #d4d4d4;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #2563eb;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      color: #666;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: #000;
    }

    .update-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .update-form select {
      padding: 0.75rem;
      border: 1px solid #e5e5e5;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .update-form textarea {
      padding: 0.75rem;
      border: 1px solid #e5e5e5;
      border-radius: 4px;
      font-size: 0.875rem;
      min-height: 80px;
      resize: vertical;
    }

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .nav-buttons {
        width: 100%;
        flex-direction: column;
      }

      .nav-buttons button {
        width: 100%;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .filters {
        flex-direction: column;
      }

      .filter-input {
        min-width: unset;
        width: 100%;
      }

      .order-info-grid {
        grid-template-columns: 1fr;
      }

      .modal {
        padding: 1rem;
      }

      .modal-content {
        padding: 1.5rem;
      }

      table {
        font-size: 0.75rem;
      }

      th,
      td {
        padding: 0.5rem;
      }
    }

    .access-denied {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
    }

    .access-denied-content {
      background: white;
      padding: 3rem 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 500px;
    }

    .access-denied-content h2 {
      color: #991b1b;
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }

    .access-denied-content p {
      color: #666;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .access-denied-content a {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #2563eb;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      transition: background 0.2s;
    }

    .access-denied-content a:hover {
      background: #1d4ed8;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this._checkAdminAccess();
  }

  private async _checkAdminAccess() {
    try {
      const user = localStorage.getItem("user");
      if (!user) {
        window.location.href = "/login";
        return;
      }

      // Check if user is admin
      const isAdmin = await isUserAdmin();
      
      if (!isAdmin) {
        NotificationService.error("Access denied - you are not an admin");
        this.accessDenied = true;
        this.isCheckingAuth = false;
        return;
      }

      this.isAdmin = true;
      this.isCheckingAuth = false;
      this._loadDashboard();
    } catch (error) {
      NotificationService.error("Error checking admin access");
      this.accessDenied = true;
      this.isCheckingAuth = false;
    }
  }

  private async _loadDashboard() {
    this.loading = true;
    try {
      const response = await getOrderStatistics();
      this.stats = response.data;
      this.loading = false;
    } catch (error) {
      NotificationService.error("Error loading dashboard");
      this.loading = false;
    }
  }

  private async _loadOrders() {
    this.loading = true;
    try {
      const response = await getAllOrders();
      this.orders = response.data;
      this.loading = false;
    } catch (error) {
      NotificationService.error("Error loading orders");
      this.loading = false;
    }
  }

  private _setView(
    view: "dashboard" | "orders" | "order-detail"
  ) {
    this.view = view;
    if (view === "orders") {
      this._loadOrders();
    } else if (view === "dashboard") {
      this._loadDashboard();
    }
  }

  private _selectOrder(order: Order) {
    this.selectedOrder = order;
    this.view = "order-detail";
  }

  private _closeDetail() {
    this.selectedOrder = null;
    this.view = "orders";
  }

  private async _updateOrderStatus(
    status: string,
    paymentStatus?: string,
    notes?: string
  ) {
    if (!this.selectedOrder) return;

    try {
      await updateOrderStatus({
        orderId: this.selectedOrder.id,
        orderStatus: status,
        paymentStatus,
        notes,
      });

      // Update local state
      this.selectedOrder = {
        ...this.selectedOrder,
        orderStatus: status as any,
        paymentStatus: paymentStatus as any,
        notes,
        updatedAt: new Date().toISOString(),
      };

      this.requestUpdate();
      NotificationService.success("Order updated successfully");
    } catch (error) {
      NotificationService.error("Error updating order");
    }
  }

  private _exportOrders() {
    const csv = [
      "Order ID,User ID,Total,Status,Payment Status,Created At",
      ...this.orders.map(
        (o) =>
          `${o.id},${o.userId},${o.total},${o.orderStatus},${o.paymentStatus},${o.createdAt}`
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  private _getFilteredOrders() {
    return this.orders.filter((order) => {
      const matchesStatus =
        !this.filterStatus || order.orderStatus === this.filterStatus;
      const matchesPayment =
        !this.filterPaymentStatus ||
        order.paymentStatus === this.filterPaymentStatus;
      const matchesSearch =
        !this.searchQuery ||
        order.id.includes(this.searchQuery) ||
        order.userId.includes(this.searchQuery);
      return matchesStatus && matchesPayment && matchesSearch;
    });
  }

  render() {
    // Show loading state
    if (this.isCheckingAuth) {
      return html`
        <div class="loading">
          <div class="spinner"></div>
          <p>Verifying access...</p>
        </div>
      `;
    }

    // Show access denied
    if (this.accessDenied || !this.isAdmin) {
      return html`
        <div class="access-denied">
          <div class="access-denied-content">
            <h2>Access Denied</h2>
            <p>
              You do not have permission to access the admin panel.
            </p>
            <a href="/">Return to Home</a>
          </div>
        </div>
      `;
    }

    return html`
      <div class="container">
        <header>
          <h1>Admin Dashboard</h1>
          <div class="nav-buttons">
            <button
              class="${this.view === "dashboard" ? "active" : ""}"
              @click=${() => this._setView("dashboard")}
            >
              Dashboard
            </button>
            <button
              class="${this.view === "orders" ? "active" : ""}"
              @click=${() => this._setView("orders")}
            >
              Orders
            </button>
          </div>
        </header>

        ${this.view === "dashboard" ? this._renderDashboard() : ""}
        ${this.view === "orders" ? this._renderOrders() : ""}
        ${this.view === "order-detail" && this.selectedOrder
          ? this._renderOrderDetail()
          : ""}
      </div>
    `;
  }

  private _renderDashboard() {
    if (this.loading) {
      return html`
        <div class="loading">
          <div class="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      `;
    }

    if (!this.stats) {
      return html`
        <div class="empty-state">
          <h3>No data available</h3>
          <p>Orders will appear here once available</p>
        </div>
      `;
    }

    return html`
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Orders</h3>
          <div class="value">${this.stats.totalOrders}</div>
        </div>

        <div class="stat-card">
          <h3>Total Revenue</h3>
          <div class="value">$${this.stats.totalRevenue.toFixed(2)}</div>
        </div>

        <div class="stat-card">
          <h3>Average Order Value</h3>
          <div class="value">$${this.stats.averageOrderValue.toFixed(2)}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
        <div class="stat-card">
          <h3>Order Status Distribution</h3>
          <div class="stat-row">
            <div class="stat-row-item">
              <span>Pending</span>
              <strong>${this.stats.byStatus.pending}</strong>
            </div>
            <div class="stat-row-item">
              <span>Processing</span>
              <strong>${this.stats.byStatus.processing}</strong>
            </div>
            <div class="stat-row-item">
              <span>Shipped</span>
              <strong>${this.stats.byStatus.shipped}</strong>
            </div>
            <div class="stat-row-item">
              <span>Delivered</span>
              <strong>${this.stats.byStatus.delivered}</strong>
            </div>
            <div class="stat-row-item">
              <span>Cancelled</span>
              <strong>${this.stats.byStatus.cancelled}</strong>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <h3>Payment Status Distribution</h3>
          <div class="stat-row">
            <div class="stat-row-item">
              <span>Pending</span>
              <strong>${this.stats.byPaymentStatus.pending}</strong>
            </div>
            <div class="stat-row-item">
              <span>Completed</span>
              <strong>${this.stats.byPaymentStatus.completed}</strong>
            </div>
            <div class="stat-row-item">
              <span>Failed</span>
              <strong>${this.stats.byPaymentStatus.failed}</strong>
            </div>
            <div class="stat-row-item">
              <span>Refunded</span>
              <strong>${this.stats.byPaymentStatus.refunded}</strong>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private _renderOrders() {
    if (this.loading) {
      return html`
        <div class="loading">
          <div class="spinner"></div>
          <p>Loading orders...</p>
        </div>
      `;
    }

    const filteredOrders = this._getFilteredOrders();

    return html`
      <div class="filters">
        <input
          type="text"
          class="filter-input"
          placeholder="Search by Order ID or User ID..."
          @input=${(e: any) => {
            this.searchQuery = e.target.value;
          }}
        />
        <select
          class="filter-select"
          @change=${(e: any) => {
            this.filterStatus = e.target.value;
          }}
        >
          <option value="">All Order Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          class="filter-select"
          @change=${(e: any) => {
            this.filterPaymentStatus = e.target.value;
          }}
        >
          <option value="">All Payment Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <button class="export-button" @click=${this._exportOrders}>
          Export CSV
        </button>
      </div>

      ${filteredOrders.length === 0
        ? html`
            <div class="empty-state">
              <h3>No orders found</h3>
              <p>Try adjusting your filters</p>
            </div>
          `
        : html`
            <div class="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>User ID</th>
                    <th>Total</th>
                    <th>Order Status</th>
                    <th>Payment Status</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredOrders.map(
                    (order) => html`
                      <tr @click=${() => this._selectOrder(order)}>
                        <td>${order.id}</td>
                        <td>${order.userId}</td>
                        <td>$${order.total.toFixed(2)}</td>
                        <td>
                          <span
                            class="status-badge status-${order.orderStatus}"
                          >
                            ${order.orderStatus}
                          </span>
                        </td>
                        <td>
                          <span
                            class="status-badge status-${order.paymentStatus}"
                          >
                            ${order.paymentStatus}
                          </span>
                        </td>
                        <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            style="padding: 0.5rem 1rem; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;"
                            @click=${(e: Event) => {
                              e.stopPropagation();
                              this._selectOrder(order);
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    `
                  )}
                </tbody>
              </table>
            </div>
          `}
    `;
  }

  private _renderOrderDetail() {
    if (!this.selectedOrder) return html``;

    const order = this.selectedOrder;
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return html`
      <div class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Order Details</h2>
            <button class="close-button" @click=${this._closeDetail}>×</button>
          </div>

          <div class="order-section">
            <h3>Order Information</h3>
            <div class="order-info-grid">
              <div class="info-item">
                <span class="info-label">Order ID</span>
                <span class="info-value">${order.id}</span>
              </div>
              <div class="info-item">
                <span class="info-label">User ID</span>
                <span class="info-value">${order.userId}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Order Status</span>
                <span
                  class="status-badge status-${order.orderStatus}"
                  style="margin-top: 0.25rem;"
                >
                  ${order.orderStatus}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Payment Status</span>
                <span
                  class="status-badge status-${order.paymentStatus}"
                  style="margin-top: 0.25rem;"
                >
                  ${order.paymentStatus}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Created</span>
                <span class="info-value">${new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Updated</span>
                <span class="info-value">${new Date(order.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div class="order-section">
            <h3>Items</h3>
            <ul class="items-list">
              ${order.items.map(
                (item) => html`
                  <li>
                    <span class="item-name">${item.productName}</span>
                    <span class="item-qty">×${item.quantity}</span>
                    <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                `
              )}
            </ul>
          </div>

          <div class="order-section">
            <h3>Order Summary</h3>
            <div class="order-info-grid">
              <div class="info-item">
                <span class="info-label">Subtotal</span>
                <span class="info-value">$${order.subtotal.toFixed(2)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Tax</span>
                <span class="info-value">$${order.tax.toFixed(2)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Shipping</span>
                <span class="info-value">$${order.shipping.toFixed(2)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Total</span>
                <span class="info-value" style="font-size: 1.25rem; color: #2563eb;">
                  $${order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div class="order-section">
            <h3>Shipping Address</h3>
            <div class="order-info-grid">
              <div class="info-item" style="grid-column: 1 / -1;">
                <span class="info-label">Address</span>
                <span class="info-value">
                  ${order.shippingAddress.street}<br/>
                  ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br/>
                  ${order.shippingAddress.country}
                </span>
              </div>
            </div>
          </div>

          <div class="order-section">
            <h3>Payment Method</h3>
            <div class="info-item">
              <span class="info-value">${order.paymentMethod}</span>
            </div>
          </div>

          ${order.notes
            ? html`
                <div class="order-section">
                  <h3>Notes</h3>
                  <div class="info-item">
                    <span class="info-value">${order.notes}</span>
                  </div>
                </div>
              `
            : ""}

          <div class="order-section">
            <h3>Update Order Status</h3>
            <div class="update-form">
              <label style="display: flex; flex-direction: column; gap: 0.5rem;">
                <span style="font-weight: 600; font-size: 0.875rem;">Order Status</span>
                <select
                  id="orderStatus"
                  style="padding: 0.75rem; border: 1px solid #e5e5e5; border-radius: 4px;"
                >
                  <option value="pending" ?selected=${order.orderStatus === "pending"}>Pending</option>
                  <option value="processing" ?selected=${order.orderStatus === "processing"}>Processing</option>
                  <option value="shipped" ?selected=${order.orderStatus === "shipped"}>Shipped</option>
                  <option value="delivered" ?selected=${order.orderStatus === "delivered"}>Delivered</option>
                  <option value="cancelled" ?selected=${order.orderStatus === "cancelled"}>Cancelled</option>
                </select>
              </label>
              <label style="display: flex; flex-direction: column; gap: 0.5rem;">
                <span style="font-weight: 600; font-size: 0.875rem;">Payment Status</span>
                <select
                  id="paymentStatus"
                  style="padding: 0.75rem; border: 1px solid #e5e5e5; border-radius: 4px;"
                >
                  <option value="pending" ?selected=${order.paymentStatus === "pending"}>Pending</option>
                  <option value="completed" ?selected=${order.paymentStatus === "completed"}>Completed</option>
                  <option value="failed" ?selected=${order.paymentStatus === "failed"}>Failed</option>
                  <option value="refunded" ?selected=${order.paymentStatus === "refunded"}>Refunded</option>
                </select>
              </label>
              <label style="display: flex; flex-direction: column; gap: 0.5rem;">
                <span style="font-weight: 600; font-size: 0.875rem;">Add Notes</span>
                <textarea
                  id="notes"
                  placeholder="Add any notes about this order..."
                  style="padding: 0.75rem; border: 1px solid #e5e5e5; border-radius: 4px; font-family: inherit;"
                >${order.notes || ""}</textarea>
              </label>
            </div>
          </div>

          <div class="modal-actions">
            <button
              class="action-primary"
              @click=${() => {
                const orderStatusEl = this.shadowRoot?.querySelector(
                  "#orderStatus"
                ) as HTMLSelectElement;
                const paymentStatusEl = this.shadowRoot?.querySelector(
                  "#paymentStatus"
                ) as HTMLSelectElement;
                const notesEl = this.shadowRoot?.querySelector(
                  "#notes"
                ) as HTMLTextAreaElement;
                this._updateOrderStatus(
                  orderStatusEl.value,
                  paymentStatusEl.value,
                  notesEl.value
                );
              }}
            >
              Save Changes
            </button>
            <button class="action-secondary" @click=${this._closeDetail}>
              Close
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
