import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("itsme-input")
export class ItsmeInput extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #333;
    }

    input {
      font-family: inherit;
      font-size: 1rem;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 0.5rem;
      transition: border-color 0.2s ease;
      width: 100%;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #000;
    }

    input:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }

    .error input {
      border-color: #dc2626;
    }

    .error-message {
      font-size: 0.875rem;
      color: #dc2626;
    }
  `;

  @property({ type: String }) label = "";
  @property({ type: String }) type = "text";
  @property({ type: String }) value = "";
  @property({ type: String }) placeholder = "";
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) required = false;
  @property({ type: String }) error = "";

  render() {
    return html`
      <div class="input-wrapper ${this.error ? "error" : ""}">
        ${this.label
          ? html`<label>${this.label}${this.required ? " *" : ""}</label>`
          : ""}
        <input
          type=${this.type}
          .value=${this.value}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          ?required=${this.required}
          @input=${this._handleInput}
          @change=${this._handleChange}
        />
        ${this.error
          ? html`<span class="error-message">${this.error}</span>`
          : ""}
      </div>
    `;
  }

  private _handleInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this.dispatchEvent(
      new CustomEvent("itsme-input", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleChange(e: Event) {
    this.dispatchEvent(
      new CustomEvent("itsme-change", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      })
    );
  }
}
