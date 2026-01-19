import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("itsme-button")
export class ItsmeButton extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }

    button {
      font-family: inherit;
      font-size: 1rem;
      font-weight: 500;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .primary {
      background-color: #000;
      color: #fff;
    }

    .primary:hover:not(:disabled) {
      background-color: #333;
    }

    .secondary {
      background-color: #fff;
      color: #000;
      border: 2px solid #000;
    }

    .secondary:hover:not(:disabled) {
      background-color: #f5f5f5;
    }

    .outline {
      background-color: transparent;
      color: #000;
      border: 1px solid #ddd;
    }

    .outline:hover:not(:disabled) {
      background-color: #f5f5f5;
    }

    .small {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .large {
      padding: 1rem 2rem;
      font-size: 1.125rem;
    }

    .full-width {
      width: 100%;
    }
  `;

  @property({ type: String }) variant: "primary" | "secondary" | "outline" =
    "primary";
  @property({ type: String }) size: "small" | "medium" | "large" = "medium";
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean, attribute: "full-width" }) fullWidth = false;

  render() {
    return html`
      <button
        class="${this.variant} ${this.size} ${this.fullWidth
          ? "full-width"
          : ""}"
        ?disabled=${this.disabled}
        @click=${this._handleClick}
      >
        <slot></slot>
      </button>
    `;
  }

  private _handleClick(e: Event) {
    if (!this.disabled) {
      this.dispatchEvent(
        new CustomEvent("itsme-click", { bubbles: true, composed: true })
      );
    }
  }
}
