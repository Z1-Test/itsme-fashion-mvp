/**
 * Cart Hook
 * Provides cart state and operations with localStorage persistence
 * TODO: Add Firestore sync for authenticated users
 */

import { useReducer, useEffect } from "react";
import { cartReducer, initialCartState } from "./cartReducer";
import { CartItem } from "../types/cart";
import {
  saveCartToStorage,
  loadCartFromStorage,
  clearCartStorage,
} from "../utils/cartStorage";

export const useCart = () => {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  // Load cart from localStorage on mount
  useEffect(() => {
    dispatch({ type: "SET_LOADING", payload: true });
    const storedCart = loadCartFromStorage();
    if (storedCart) {
      dispatch({ type: "LOAD_CART", payload: storedCart });
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!state.isLoading && state.items.length > 0) {
      saveCartToStorage({
        items: state.items,
        subtotal: state.subtotal,
        itemCount: state.itemCount,
        lastUpdated: state.lastUpdated,
      });
    } else if (!state.isLoading && state.items.length === 0) {
      clearCartStorage();
    }
  }, [
    state.items,
    state.subtotal,
    state.itemCount,
    state.lastUpdated,
    state.isLoading,
  ]);

  const addItem = (item: CartItem) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  };

  const removeItem = (productId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: productId });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  return {
    cart: state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
};
