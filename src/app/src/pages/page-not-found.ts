import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("page-not-found")
export class PageNotFound extends LitElement {
  static styles = css`
    :host {
      display: block;
      text-align: center;
      padding: 4rem 2rem;
    }

    h1 {
      font-size: 4rem;
      margin-bottom: 1rem;
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
