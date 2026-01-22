import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { getProductById, type Product } from "../services/catalog";
import { NotificationService } from "../../../packages/design-system/src/notification-service";
import { wishlist } from "../services";

@customElement("page-wishlist")
export class PageWishlist extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1.5rem;
    }

    h1 {
      margin-bottom: 1.5rem;
      font-size: 1.75rem;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1.5rem;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: #666;
    }

    .empty-state h2 {
      margin-bottom: 1rem;
      font-size: 1.25rem;
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
      font-size: 0.95rem;
    }

    .empty-state a:hover {
      background: #333;
    }

    .wishlist-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #e5e5e5;
      border-radius: 0.5rem;
    }

    .wishlist-item-image {
      width: 100px;
      height: 100px;
      background-color: #f5f5f5;
      border-radius: 0.375rem;
      overflow: hidden;
      flex-shrink: 0;
    }

    .wishlist-item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .wishlist-item-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .wishlist-item-title {
      font-weight: 600;
      font-size: 0.95rem;
      line-height: 1.3;
    }

    .wishlist-item-brand {
      color: #666;
      font-size: 0.8rem;
    }

    .wishlist-item-price {
      font-size: 1rem;
      font-weight: 700;
      margin: 0.4rem 0;
    }

    .wishlist-item-actions {
      display: flex;
      gap: 0.75rem;
    }

    .action-btn {
      padding: 0.5rem 1rem;
      border: 1px solid #e5e5e5;
      border-radius: 0.375rem;
      background: white;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .action-btn.primary {
      background: #000;
      color: white;
      border-color: #000;
    }

    .action-btn:hover {
      background: #f5f5f5;
    }

    .action-btn.primary:hover {
      background: #333;
    }

    .remove-btn {
      padding: 0.5rem 1rem;
      background: #fee;
      color: #c00;
      border: 1px solid #fcc;
    }

    .remove-btn:hover {
      background: #fdd;
    }

    @media (max-width: 1024px) {
      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1.25rem;
      }
    }

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      h1 {
        font-size: 1.5rem;
        margin-bottom: 1.25rem;
      }

      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
      }

      .wishlist-item {
        padding: 0.75rem;
        gap: 0.75rem;
      }

      .wishlist-item-image {
        width: 80px;
        height: 80px;
      }

      .wishlist-item-title {
        font-size: 0.9rem;
      }

      .wishlist-item-brand {
        font-size: 0.75rem;
      }

      .wishlist-item-price {
        font-size: 0.95rem;
      }

      .add-to-cart-btn,
      .remove-btn {
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
      }

      .empty-state {
        padding: 2rem 0.75rem;
      }

      .empty-state h2 {
        font-size: 1.1rem;
      }

      .empty-state a {
        padding: 0.6rem 1.2rem;
        font-size: 0.9rem;
      }
    }

    @media (max-width: 480px) {
      :host {
        overflow-x: hidden;
      }

      .container {
        padding: 0.75rem;
      }

      h1 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
      }

      .products-grid {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }

      .wishlist-item {
        padding: 0.6rem;
        gap: 0.6rem;
        flex-direction: column;
      }

      .wishlist-item-image {
        width: 100%;
        height: 200px;
      }

      .wishlist-item-title {
        font-size: 0.85rem;
      }

      .wishlist-item-brand {
        font-size: 0.7rem;
      }

      .wishlist-item-price {
        font-size: 0.9rem;
      }

      .add-to-cart-btn,
      .remove-btn {
        padding: 0.45rem 0.9rem;
        font-size: 0.75rem;
      }

      .empty-state {
        padding: 1.5rem 0.5rem;
      }

      .empty-state h2 {
        font-size: 1rem;
      }

      .empty-state a {
        padding: 0.55rem 1rem;
        font-size: 0.8rem;
      }
    }
  `;

  @state() private wishlistItems: Product[] = [];
  @state() private loading = true;

  connectedCallback() {
    super.connectedCallback();
    this._loadWishlist();
  }

  render() {
    if (this.loading) {
      return html`
        <div class="container">
          <h1>My Wishlist</h1>
          <div style="text-align: center; padding: 4rem;">
            Loading wishlist...
          </div>
        </div>
      `;
    }

    if (this.wishlistItems.length === 0) {
      return html`
        <div class="container">
          <h1>My Wishlist</h1>
          <div class="empty-state">
            <h2>Your wishlist is empty</h2>
            <p>
              Start adding products to your wishlist to save them for later!
            </p>
            <a href="/products">Continue Shopping</a>
          </div>
        </div>
      `;
    }

    return html`
      <div class="container">
        <h1>My Wishlist (${this.wishlistItems.length} items)</h1>
        <div class="products-grid">
          ${this.wishlistItems.map(
            (product) => html`
              <itsme-product-card
                .product=${product}
                .isWishlisted=${true}
                @itsme-wishlist-toggle=${this._handleWishlistToggle}
              ></itsme-product-card>
            `,
          )}
        </div>
      </div>
    `;
  }

  private async _loadWishlist() {
    this.loading = true;

    try {
      // Load wishlist from service
      const wishlistIds = await wishlist.getWishlist();

      const wishlistProducts: Product[] = [];
      for (const id of wishlistIds) {
        try {
          const product = await getProductById(id);
          if (product) {
            wishlistProducts.push(product);
          }
        } catch (error) {
          console.error(`Failed to load product ${id}:`, error);
        }
      }

      this.wishlistItems = wishlistProducts;
    } catch (error) {
      console.error("Error loading wishlist:", error);
      NotificationService.error("Failed to load wishlist");
    } finally {
      this.loading = false;
    }
  }

  private async _handleWishlistToggle(e: CustomEvent) {
    const { product, isInWishlist } = e.detail;

    // Only update local state - the product-card already made the API call
    if (!isInWishlist) {
      // Product was removed from wishlist, reload the list
      this._loadWishlist();
    }
  }
}
