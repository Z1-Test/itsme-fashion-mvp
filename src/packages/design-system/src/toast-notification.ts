import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

@customElement("toast-notification")
export class ToastNotification extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      top: 2rem;
      right: 2rem;
      z-index: 9999;
      pointer-events: none;
    }

    .toast-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 400px;
    }

    .toast {
      padding: 1rem 1.5rem;
      border-radius: 0.375rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      animation: slideIn 0.3s ease forwards;
      pointer-events: all;
      font-weight: 500;
      max-width: 100%;
      word-wrap: break-word;
      border: 1px solid #e5e5e5;
      background: white;
      color: #000;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }

    .toast.removing {
      animation: slideOut 0.3s ease forwards;
    }

    .toast.success {
      border-left: 3px solid #10b981;
    }

    .toast.error {
      border-left: 3px solid #ef4444;
    }

    .toast.info {
      border-left: 3px solid #3b82f6;
    }

    .icon {
      width: 1.25rem;
      height: 1.25rem;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .message {
      flex: 1;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      color: inherit;
      font-size: 1.25rem;
      line-height: 1;
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }

    .close-btn:hover {
      opacity: 0.7;
    }
  `;

  @state() private toasts: Toast[] = [];
  private boundHandler: ((e: Event) => void) | null = null;

  connectedCallback() {
    super.connectedCallback();
    // Create a bound handler so we can properly remove it later
    this.boundHandler = this._handleNotification.bind(this);

    // Listen on document only (service dispatches on document with composed: true)
    document.addEventListener("show-notification", this.boundHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.boundHandler) {
      document.removeEventListener("show-notification", this.boundHandler);
    }
  }

  private _handleNotification(e: Event) {
    const customEvent = e as CustomEvent;
    if (customEvent.detail && customEvent.detail.message) {
      this.showToast(
        customEvent.detail.message,
        customEvent.detail.type || "success",
      );
    }
  }

  render() {
    return html`
      <div class="toast-container">
        ${this.toasts.map(
          (toast) => html`
            <div class="toast ${toast.type}">
              <div class="icon">
                ${toast.type === "success"
                  ? html`<svg viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                      />
                    </svg>`
                  : toast.type === "error"
                    ? html`<svg viewBox="0 0 24 24" fill="currentColor">
                        <path
                          d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
                        />
                      </svg>`
                    : html`<svg viewBox="0 0 24 24" fill="currentColor">
                        <path
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                        />
                      </svg>`}
              </div>
              <div class="message">${toast.message}</div>
              <button
                class="close-btn"
                @click=${() => this.removeToast(toast.id)}
              >
                ×
              </button>
            </div>
          `,
        )}
      </div>
    `;
  }

  showToast(message: string, type: "success" | "error" | "info" = "success") {
    const id = Date.now().toString();
    const toast: Toast = { id, message, type };
    this.toasts = [...this.toasts, toast];

    // Auto-remove after 4 seconds
    setTimeout(() => {
      this.removeToast(id);
    }, 4000);
  }

  removeToast(id: string) {
    const toast = this.toasts.find((t) => t.id === id);
    if (toast) {
      // Add removing animation
      const index = this.toasts.indexOf(toast);
      const newToasts = [...this.toasts];
      setTimeout(() => {
        this.toasts = newToasts.filter((t) => t.id !== id);
      }, 300);
    }
  }
}
