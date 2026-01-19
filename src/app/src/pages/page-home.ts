import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("page-home")
export class PageHome extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .hero {
      text-align: center;
      padding: 4rem 2rem;
      background: linear-gradient(135deg, #f5f5f5 0%, #fff 100%);
    }

    h1 {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #000;
    }

    .subtitle {
      font-size: 1.25rem;
      color: #666;
      margin-bottom: 2rem;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-top: 4rem;
    }

    .feature {
      text-align: center;
      padding: 2rem;
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .feature h3 {
      margin-bottom: 0.5rem;
    }
  `;

  render() {
    return html`
      <div class="hero">
        <h1>Welcome to itsme.fashion</h1>
        <p class="subtitle">Discover Premium Clean Beauty Products</p>
        <itsme-button
          @itsme-click=${() => (window.location.href = "/products")}
        >
          Shop Now
        </itsme-button>
      </div>

      <div class="features">
        <div class="feature">
          <div class="feature-icon">🌱</div>
          <h3>100% Vegan</h3>
          <p>All our products are plant-based and cruelty-free</p>
        </div>
        <div class="feature">
          <div class="feature-icon">🐰</div>
          <h3>Cruelty-Free</h3>
          <p>Never tested on animals, certified and verified</p>
        </div>
        <div class="feature">
          <div class="feature-icon">🌿</div>
          <h3>Sustainable</h3>
          <p>Eco-friendly packaging and ethical sourcing</p>
        </div>
        <div class="feature">
          <div class="feature-icon">✨</div>
          <h3>Premium Quality</h3>
          <p>Curated selection of the finest beauty brands</p>
        </div>
      </div>
    `;
  }
}
