// Global notification service using CustomEvent with composed: true
export class NotificationService {
  static show(message: string, type: "success" | "error" | "info" = "success") {
    const event = new CustomEvent("show-notification", {
      detail: { message, type },
      bubbles: true,
      composed: true, // This allows the event to cross shadow DOM boundaries
    });

    // Dispatch on document only to avoid duplicate notifications
    document.dispatchEvent(event);
  }

  static success(message: string) {
    this.show(message, "success");
  }

  static error(message: string) {
    this.show(message, "error");
  }

  static info(message: string) {
    this.show(message, "info");
  }
}
