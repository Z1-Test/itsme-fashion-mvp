import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("page-login")
export class PageLogin extends LitElement {
  static styles = css`
    :host {
      display: block;
      max-width: 400px;
      margin: 2rem auto;
    }

    .login-card {
      background: white;
      border: 1px solid #e5e5e5;
      border-radius: 0.5rem;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    h1 {
      margin-top: 0;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #e5e5e5;
      border-radius: 0.375rem;
      font-size: 1rem;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #000;
    }

    .error {
      color: #dc2626;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .login-btn {
      width: 100%;
      padding: 0.75rem;
      background: #000;
      color: white;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
    }

    .login-btn:hover {
      background: #333;
    }

    .login-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .register-link {
      text-align: center;
      margin-top: 1.5rem;
      color: #666;
    }

    .register-link a {
      color: #000;
      font-weight: 600;
      text-decoration: none;
    }

    .register-link a:hover {
      text-decoration: underline;
    }

    .info {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 0.375rem;
      padding: 1rem;
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
      color: #1e40af;
    }
  `;

  @state() private email = "";
  @state() private password = "";
  @state() private error = "";

  render() {
    return html`
      <div class="login-card">
        <h1>Login</h1>

        <form @submit=${this._handleSubmit}>
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              type="email"
              .value=${this.email}
              @input=${this._handleEmailInput}
              placeholder="you@example.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              .value=${this.password}
              @input=${this._handlePasswordInput}
              placeholder="••••••••"
              required
            />
          </div>

          ${this.error ? html`<div class="error">${this.error}</div>` : ""}

          <button type="submit" class="login-btn">Login</button>
        </form>

        <div class="register-link">
          Don't have an account? <a href="/register">Register</a>
        </div>
      </div>
    `;
  }

  private _handleEmailInput(e: Event) {
    this.email = (e.target as HTMLInputElement).value;
    this.error = "";
  }

  private _handlePasswordInput(e: Event) {
    this.password = (e.target as HTMLInputElement).value;
    this.error = "";
  }

  private _handleSubmit(e: Event) {
    e.preventDefault();

    if (!this.email || !this.email.includes("@")) {
      this.error = "Please enter a valid email address";
      return;
    }

    if (!this.password || this.password.length < 6) {
      this.error = "Password must be at least 6 characters";
      return;
    }

    // Mock login - just store email in localStorage
    const user = {
      email: this.email,
      displayName: this.email.split("@")[0],
      loginAt: new Date().toISOString(),
    };

    localStorage.setItem("user", JSON.stringify(user));

    // Redirect to home or products
    window.location.href = "/products";
  }
}
