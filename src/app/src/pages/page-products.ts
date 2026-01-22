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
import { remoteConfig } from "../firebase";
import { fetchAndActivate, getValue } from "firebase/remote-config";

@customElement("page-products")
export class PageProducts extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .sale-banner {
      background: #FF6B6B;
      color: #FFFFFF;
      text-align: center;
      padding: 1rem;
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      animation: slideDown 0.3s ease-out;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 1.5rem;
    }

    @keyframes slideDown {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
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
  @state() private showSaleBanner = false;

  async connectedCallback() {
    super.connectedCallback();

    await initRemoteConfig();
    this.visibleCategories = getVisibleCategories();

    // Keep default selectedCategory = "all" so we always
    // load all products initially, even if the All button
    // is hidden when the flag is off.

    this._loadProducts();
    this._loadWishlist();
    this._loadRemoteConfig();
  }

  render() {
    if (this.loading) {
      return html`<div class="loading">Loading products...</div>`;
    }

    if (this.error) {
      return html`<div class="error">${this.error}</div>`;
    }

    return html`
      ${this.showSaleBanner
        ? html`
            <div class="sale-banner">
              🔥 30% OFF SALE! 🔥
            </div>
          `
        : ""}
      
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
    
    const { product, isInWishlist } = e.detail;

    // Only update local state - the product-card already made the API call
    if (isInWishlist) {
      // Product was added to wishlist
      if (!this.wishlistIds.includes(product.id)) {
        this.wishlistIds = [...this.wishlistIds, product.id];
      }
    } else {
      // Product was removed from wishlist
      this.wishlistIds = this.wishlistIds.filter(id => id !== product.id);
    }
  }

  private async _loadRemoteConfig() {
    try {
      // Set config settings for emulator
      remoteConfig.settings = {
        minimumFetchIntervalMillis: 0,
        fetchTimeoutMillis: 0,
      };

      // Set default values - IMPORTANT: This sets the fallback
      remoteConfig.defaultConfig = {
        show_sale_banner: "false", // String, not boolean
      };

      // Fetch and activate
      const activated = await fetchAndActivate(remoteConfig);
      console.log("📡 Remote Config activated:", activated);
      
      // Get the value from show_sale_banner parameter
      const showSaleBannerConfig = getValue(remoteConfig, "show_sale_banner");
      const stringValue = showSaleBannerConfig.asString();
      this.showSaleBanner = stringValue === "true";
      
      console.log("🎯 Remote Config - show_sale_banner:", {
        rawValue: stringValue,
        showBanner: this.showSaleBanner
      });
    } catch (error) {
      console.error("❌ Error loading Remote Config:", error);
      // Default to FALSE if config fails to load (don't show banner on error)
      this.showSaleBanner = false;
    }
  }
}
