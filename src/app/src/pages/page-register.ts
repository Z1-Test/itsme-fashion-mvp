import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("page-register")
export class PageRegister extends LitElement {
  static styles = css`
    :host {
      display: block;
      max-width: 400px;
      margin: 2rem auto;
    }

    .register-card {
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

    .register-btn {
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

    .register-btn:hover {
      background: #333;
    }

    .register-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .login-link {
      text-align: center;
      margin-top: 1.5rem;
      color: #666;
    }

    .login-link a {
      color: #000;
      font-weight: 600;
      text-decoration: none;
    }

    .login-link a:hover {
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

  @state() private name = "";
  @state() private email = "";
  @state() private password = "";
  @state() private confirmPassword = "";
  @state() private error = "";

  render() {
    return html`
      <div class="register-card">
        <h1>Create Account</h1>

        <form @submit=${this._handleSubmit}>
          <div class="form-group">
            <label for="name">Full Name</label>
            <input
              id="name"
              type="text"
              .value=${this.name}
              @input=${this._handleNameInput}
              placeholder="Your name"
              required
            />
          </div>

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

          <div class="form-group">
            <label for="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              .value=${this.confirmPassword}
              @input=${this._handleConfirmPasswordInput}
              placeholder="••••••••"
              required
            />
          </div>

          ${this.error ? html`<div class="error">${this.error}</div>` : ""}

          <button type="submit" class="register-btn">Create Account</button>
        </form>

        <div class="login-link">
          Already have an account? <a href="/login">Login</a>
        </div>
      </div>
    `;
  }

  private _handleNameInput(e: Event) {
    this.name = (e.target as HTMLInputElement).value;
    this.error = "";
  }

  private _handleEmailInput(e: Event) {
    this.email = (e.target as HTMLInputElement).value;
    this.error = "";
  }

  private _handlePasswordInput(e: Event) {
    this.password = (e.target as HTMLInputElement).value;
    this.error = "";
  }

  private _handleConfirmPasswordInput(e: Event) {
    this.confirmPassword = (e.target as HTMLInputElement).value;
    this.error = "";
  }

  private _handleSubmit(e: Event) {
    e.preventDefault();

    if (!this.name.trim()) {
      this.error = "Please enter your name";
      return;
    }

    if (!this.email || !this.email.includes("@")) {
      this.error = "Please enter a valid email address";
      return;
    }

    if (!this.password || this.password.length < 6) {
      this.error = "Password must be at least 6 characters";
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = "Passwords do not match";
      return;
    }

    // Mock registration - just store user data in localStorage
    const user = {
      email: this.email,
      displayName: this.name,
      registeredAt: new Date().toISOString(),
    };

    localStorage.setItem("user", JSON.stringify(user));

    // Redirect to products
    window.location.href = "/products";
  }
}
