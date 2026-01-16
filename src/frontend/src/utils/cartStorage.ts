/**
 * Cart Storage Utilities
 * Handles localStorage persistence for anonymous carts
 * 30-day retention policy
 */

import { Cart, CartItem } from "../types/cart";

const CART_STORAGE_KEY = "itsme_cart";
const CART_EXPIRY_DAYS = 30;

interface StoredCart extends Cart {
  expiresAt: number;
}

/**
 * Save cart to localStorage
 */
export const saveCartToStorage = (cart: Cart): void => {
  try {
    const expiresAt = Date.now() + CART_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    const storedCart: StoredCart = {
      ...cart,
      expiresAt,
    };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(storedCart));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
};

/**
 * Load cart from localStorage
 * Returns null if expired or invalid
 */
export const loadCartFromStorage = (): Cart | null => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return null;

    const storedCart: StoredCart = JSON.parse(stored);

    // Check expiration
    if (storedCart.expiresAt < Date.now()) {
      clearCartStorage();
      return null;
    }

    return {
      items: storedCart.items,
      subtotal: storedCart.subtotal,
      itemCount: storedCart.itemCount,
      lastUpdated: storedCart.lastUpdated,
    };
  } catch (error) {
    console.error("Failed to load cart from localStorage:", error);
    return null;
  }
};

/**
 * Clear cart from localStorage
 */
export const clearCartStorage = (): void => {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear cart from localStorage:", error);
  }
};

/**
 * Calculate cart totals
 */
export const calculateCartTotals = (
  items: CartItem[]
): { subtotal: number; itemCount: number } => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, itemCount };
};
