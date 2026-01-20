import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { Product } from "@itsme/shared-utils";
import { MOCK_PRODUCTS } from "../mock-products";
import { NotificationService } from "../../../packages/design-system/src/notification-service";

@customElement("page-products")
export class PageProducts extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    h1 {
      margin-bottom: 2rem;
    }

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 2rem;
    }

    .loading {
      text-align: center;
      padding: 4rem;
      color: #666;
    }

    .error {
      padding: 2rem;
      background: #fee;
      border: 1px solid #fcc;
      border-radius: 0.5rem;
      color: #c00;
    }
  `;

  @state() private products: Product[] = [];
  @state() private loading = true;
  @state() private error = "";

  connectedCallback() {
    super.connectedCallback();
    this._loadProducts();
  }

  render() {
    if (this.loading) {
      return html`<div class="loading">Loading products...</div>`;
    }

    if (this.error) {
      return html`<div class="error">${this.error}</div>`;
    }

    return html`
      <h1>Our Products</h1>

      <div class="filters">
        <itsme-button variant="outline" size="small">All</itsme-button>
        <itsme-button variant="outline" size="small">Vegan</itsme-button>
        <itsme-button variant="outline" size="small">Cruelty-Free</itsme-button>
        <itsme-button variant="outline" size="small">Organic</itsme-button>
      </div>

      <div class="products-grid">
        ${this.products.map(
          (product) => html`
            <a
              href="/product/${product.id}"
              style="text-decoration: none; color: inherit; display: block;"
            >
              <itsme-product-card .product=${product}></itsme-product-card>
            </a>
          `,
        )}
      </div>

      ${this.products.length === 0
        ? html`
            <p>
              No products found. Please import products using the import script.
            </p>
          `
        : ""}
    `;
  }

  private async _loadProducts() {
    this.loading = true;
    this.error = "";

    // Load products directly from CSV data
    this.products = MOCK_PRODUCTS;

    this.loading = false;
  }
}
