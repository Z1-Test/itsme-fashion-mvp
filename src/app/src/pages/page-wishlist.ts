import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { Product } from "@itsme/shared-utils";
import { NotificationService } from "../../../packages/design-system/src/notification-service";

@customElement("page-wishlist")
export class PageWishlist extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    h1 {
      margin-bottom: 2rem;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 2rem;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }

    .empty-state h2 {
      margin-bottom: 1rem;
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
      width: 120px;
      height: 120px;
      background-color: #f5f5f5;
      border-radius: 0.375rem;
      overflow: hidden;
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
      font-size: 1rem;
    }

    .wishlist-item-brand {
      color: #666;
      font-size: 0.875rem;
    }

    .wishlist-item-price {
      font-size: 1.125rem;
      font-weight: 700;
      margin: 0.5rem 0;
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
                @itsme-add-to-cart=${this._handleAddToCart}
                @itsme-wishlist-toggle=${this._handleWishlistToggle}
              ></itsme-product-card>
            `,
          )}
        </div>
      </div>
    `;
  }

  private _loadWishlist() {
    this.loading = true;

    // Load wishlist from localStorage
    const wishlistData = localStorage.getItem("wishlist");
    const wishlistIds = wishlistData ? JSON.parse(wishlistData) : [];

    // Load all products
    const cartData = localStorage.getItem("cart");
    const cart = cartData ? JSON.parse(cartData) : { items: [] };

    // Get all unique products from cart (as a proxy for all available products)
    const allProducts = new Map();
    cart.items.forEach((item: any) => {
      if (item.product) {
        allProducts.set(item.product.id, item.product);
      }
    });

    // Filter wishlist items
    this.wishlistItems = wishlistIds
      .map((id: string) => allProducts.get(id))
      .filter((p: Product | undefined) => p !== undefined);

    this.loading = false;
  }

  private _handleAddToCart(e: CustomEvent) {
    const { product, quantity } = e.detail;

    // Get existing cart from localStorage
    const cartData = localStorage.getItem("cart");
    const cart = cartData ? JSON.parse(cartData) : { items: [] };

    // Check if product already exists in cart
    const existingItem = cart.items.find(
      (item: any) => item.productId === product.id,
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId: product.id,
        product: product,
        quantity: quantity,
        price: product.price,
      });
    }

    // Save cart
    localStorage.setItem("cart", JSON.stringify(cart));

    // Show notification
    NotificationService.success(`Added ${quantity} × ${product.name} to cart!`);
  }

  private _handleWishlistToggle(e: CustomEvent) {
    const { product } = e.detail;

    // Get existing wishlist from localStorage
    const wishlistData = localStorage.getItem("wishlist");
    const wishlistIds = wishlistData ? JSON.parse(wishlistData) : [];

    // Remove from wishlist
    const index = wishlistIds.indexOf(product.id);
    if (index > -1) {
      wishlistIds.splice(index, 1);
    }

    // Save wishlist
    localStorage.setItem("wishlist", JSON.stringify(wishlistIds));

    // Reload wishlist
    this._loadWishlist();

    NotificationService.info(`Removed ${product.name} from wishlist`);
  }
}
