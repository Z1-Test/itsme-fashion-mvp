import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { 
  getAllProducts, 
  getProductsByCategory, 
  type Product 
} from "../services/catalog";

import { NotificationService } from "../../../packages/design-system/src/notification-service";
import { wishlist } from "../services";
import { initRemoteConfig, getVisibleCategories } from "../services/remoteconfig";

@customElement("page-products")
export class PageProducts extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    h1 {
      margin-bottom: 1.5rem;
      font-size: 1.75rem;
    }

    .filters {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1.5rem;
    }

    .loading {
      text-align: center;
      padding: 3rem 1rem;
      color: #666;
    }

    .error {
      padding: 1.5rem 1rem;
      background: #fee;
      border: 1px solid #fcc;
      border-radius: 0.5rem;
      color: #c00;
      font-size: 0.9rem;
    }

    @media (max-width: 1024px) {
      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1.25rem;
      }
    }

    @media (max-width: 768px) {
      h1 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
      }

      .filters {
        gap: 0.5rem;
        margin-bottom: 1.5rem;
      }

      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
      }

      .loading {
        padding: 2rem 0.75rem;
      }

      .error {
        padding: 1rem 0.75rem;
        font-size: 0.85rem;
      }
    }

    @media (max-width: 480px) {
      :host {
        display: block;
        overflow-x: hidden;
      }

      h1 {
        font-size: 1.25rem;
      }

      .filters {
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .products-grid {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }

      .loading {
        padding: 1.5rem 0.5rem;
      }

      .error {
        padding: 0.75rem 0.5rem;
        font-size: 0.8rem;
      }
    }
  `;

  @state() private products: Product[] = [];
  @state() private loading = true;
  @state() private error = "";
  @state() private selectedCategory = "all";
  @state() private wishlistIds: string[] = [];
  @state() private visibleCategories: string[] = [];

  async connectedCallback() {
    super.connectedCallback();

    await initRemoteConfig();
    this.visibleCategories = getVisibleCategories();

    // Keep default selectedCategory = "all" so we always
    // load all products initially, even if the All button
    // is hidden when the flag is off.

    this._loadProducts();
    this._loadWishlist();
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
        ${this.visibleCategories.includes("all") ? html`
          <itsme-button 
            variant="${this.selectedCategory === "all" ? "primary" : "outline"}" 
            size="small"
            @click=${() => this._filterByCategory("all")}
          >
            All
          </itsme-button>
        ` : ""}
        ${this.visibleCategories.includes("eyes") ? html`
          <itsme-button 
            variant="${this.selectedCategory === "eyes" ? "primary" : "outline"}" 
            size="small"
            @click=${() => this._filterByCategory("eyes")}
          >
            Eyes
          </itsme-button>
        ` : ""}
        ${this.visibleCategories.includes("lips") ? html`
          <itsme-button 
            variant="${this.selectedCategory === "lips" ? "primary" : "outline"}" 
            size="small"
            @click=${() => this._filterByCategory("lips")}
          >
            Lips
          </itsme-button>
        ` : ""}
        ${this.visibleCategories.includes("face") ? html`
          <itsme-button 
            variant="${this.selectedCategory === "face" ? "primary" : "outline"}" 
            size="small"
            @click=${() => this._filterByCategory("face")}
          >
            Face
          </itsme-button>
        ` : ""}
      </div>

      <div class="products-grid">
        ${this.products.map(
          (product) => html`
            <a
              href="/product/${product.id}"
              style="text-decoration: none; color: inherit; display: block;"
            >
              <itsme-product-card 
                .product=${product}
                .isWishlisted=${this.wishlistIds.includes(product.id)}
                @itsme-wishlist-toggle=${this._handleWishlistToggle}
              ></itsme-product-card>
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

    try {
      if (this.selectedCategory === "all") {
        this.products = await getAllProducts();
      } else {
        this.products = await getProductsByCategory(this.selectedCategory);
      }
    } catch (err: any) {
      this.error = err.message || "Failed to load products";
      console.error("Error loading products:", err);
    } finally {
      this.loading = false;
    }
  }

  private async _filterByCategory(category: string) {
    this.selectedCategory = category;
    await this._loadProducts();
  }

  private async _loadWishlist() {
    try {
      this.wishlistIds = await wishlist.getWishlist();
    } catch (error) {
      console.error("Error loading wishlist:", error);
    }
  }

  private async _handleWishlistToggle(e: CustomEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    const { product, isWishlisted } = e.detail;

    try {
      if (isWishlisted) {
        const result = await wishlist.removeFromWishlist(product.id);
        if (result.success) {
          NotificationService.success(`Removed ${product.name} from wishlist`);
          // Update local wishlist state
          this.wishlistIds = this.wishlistIds.filter(id => id !== product.id);
        } else {
          NotificationService.error(result.message || "Failed to remove from wishlist");
        }
      } else {
        const result = await wishlist.addToWishlist(product.id);
        if (result.success) {
          NotificationService.success(`Added ${product.name} to wishlist`);
          // Update local wishlist state
          this.wishlistIds = [...this.wishlistIds, product.id];
        } else {
          NotificationService.error(result.message || "Failed to add to wishlist");
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      NotificationService.error("Failed to update wishlist");
    }
  }
}
