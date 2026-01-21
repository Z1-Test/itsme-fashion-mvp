// Validators

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
}

export function isValidPostalCode(
  postalCode: string,
  country: string = "US"
): boolean {
  const patterns: Record<string, RegExp> = {
    US: /^\d{5}(-\d{4})?$/,
    IN: /^\d{6}$/,
    GB: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
  };
  const pattern = patterns[country] || /^.+$/;
  return pattern.test(postalCode);
}

export function isValidHexColor(hex: string): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(hex);
}

export function isPositiveNumber(value: number): boolean {
  return typeof value === "number" && value > 0 && !isNaN(value);
}

export function isNonNegativeNumber(value: number): boolean {
  return typeof value === "number" && value >= 0 && !isNaN(value);
}

export function validateProduct(product: any): string[] {
  const errors: string[] = [];

  if (!product.name || typeof product.name !== "string") {
    errors.push("Product name is required");
  }

  if (!product.brand || typeof product.brand !== "string") {
    errors.push("Product brand is required");
  }

  if (!product.category || typeof product.category !== "string") {
    errors.push("Product category is required");
  }

  if (!isPositiveNumber(product.price)) {
    errors.push("Product price must be a positive number");
  }

  if (!isNonNegativeNumber(product.stock)) {
    errors.push("Product stock must be non-negative");
  }

  return errors;
}

export function validateAddress(address: any): string[] {
  const errors: string[] = [];

  if (!address.name) errors.push("Address name is required");
  if (!address.line1) errors.push("Address line 1 is required");
  if (!address.city) errors.push("City is required");
  if (!address.state) errors.push("State is required");
  if (!address.postalCode) errors.push("Postal code is required");
  if (!address.country) errors.push("Country is required");
  if (!address.phone) errors.push("Phone is required");

  if (address.phone && !isValidPhone(address.phone)) {
    errors.push("Invalid phone number");
  }

  return errors;
}
