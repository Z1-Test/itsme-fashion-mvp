import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("page-home")
export class PageHome extends LitElement {
  static styles = css`
    :host {
      display: block;
      overflow-x: hidden;
    }

    .hero {
      text-align: center;
      padding: 3rem 1.5rem;
      background: linear-gradient(135deg, #f5f5f5 0%, #fff 100%);
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: #000;
    }

    .subtitle {
      font-size: 1.125rem;
      color: #666;
      margin-bottom: 2rem;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-top: 3rem;
      padding: 0 1.5rem;
    }

    .feature {
      text-align: center;
      padding: 1.5rem 1rem;
    }

    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .feature h3 {
      margin-bottom: 0.5rem;
      font-size: 1rem;
    }

    .feature p {
      font-size: 0.875rem;
      color: #666;
    }

    @media (max-width: 768px) {
      .hero {
        padding: 2rem 1rem;
      }

      h1 {
        font-size: 2rem;
      }

      .subtitle {
        font-size: 1rem;
      }

      .features {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-top: 2rem;
        padding: 0 1rem;
      }

      .feature {
        padding: 1rem 0.75rem;
      }

      .feature-icon {
        font-size: 2rem;
        margin-bottom: 0.75rem;
      }
    }

    @media (max-width: 480px) {
      :host {
        overflow-x: hidden;
      }

      .hero {
        padding: 1.5rem 0.75rem;
      }

      h1 {
        font-size: 1.5rem;
      }

      .subtitle {
        font-size: 0.9rem;
        margin-bottom: 1.5rem;
      }

      .features {
        grid-template-columns: 1fr;
        gap: 1rem;
        margin-top: 1.5rem;
        padding: 0 0.75rem;
      }

      .feature {
        padding: 1rem 0.5rem;
      }

      .feature-icon {
        font-size: 2rem;
      }

      .feature h3 {
        font-size: 0.95rem;
      }

      .feature p {
        font-size: 0.8rem;
      }
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
