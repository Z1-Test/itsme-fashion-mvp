import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("page-not-found")
export class PageNotFound extends LitElement {
  static styles = css`
    :host {
      display: block;
      text-align: center;
      padding: 3rem 1rem;
    }

    h1 {
      font-size: 3.5rem;
      margin-bottom: 1rem;
      color: #000;
    }

    p {
      font-size: 1.25rem;
      color: #666;
      margin-bottom: 2rem;
    }

    @media (max-width: 768px) {
      :host {
        padding: 2rem 1rem;
      }

      h1 {
        font-size: 3rem;
        margin-bottom: 0.75rem;
      }

      p {
        font-size: 1.1rem;
        margin-bottom: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      :host {
        padding: 1.5rem 0.75rem;
        overflow-x: hidden;
      }

      h1 {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
      }

      p {
        font-size: 1rem;
        margin-bottom: 1.25rem;
      }
    }
  `;

  render() {
    return html`
      <h1>404</h1>
      <p>Page not found</p>
      <itsme-button @itsme-click=${() => (window.location.href = "/")}>
        Go Home
      </itsme-button>
    `;
  }
}
