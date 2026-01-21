import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("page-orders")
export class PageOrders extends LitElement {
  static styles = css`
    :host {
      display: block;
      max-width: 1200px;
      margin: 0 auto;
    }

    .container {
      padding: 2rem;
      text-align: center;
      color: #666;
    }

    h1 {
      margin-bottom: 1rem;
    }

    p {
      margin-bottom: 1.5rem;
    }

    a {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #000;
      color: white;
      border-radius: 0.375rem;
      text-decoration: none;
      font-weight: 600;
      transition: background 0.2s;
    }

    a:hover {
      background: #333;
    }
  `;

  render() {
    return html`
      <div class="container">
        <h1>Your Orders</h1>
        <p>
          Please visit your <a href="/profile">profile page</a> to view your
          orders and account details.
        </p>
      </div>
    `;
  }
}
