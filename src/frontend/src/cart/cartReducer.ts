/**
 * Cart State Reducer
 * Manages cart state with localStorage persistence
 */

import { CartState, CartAction, CartItem } from "../types/cart";
import { calculateCartTotals } from "../utils/cartStorage";

export const initialCartState: CartState = {
  items: [],
  subtotal: 0,
  itemCount: 0,
  lastUpdated: Date.now(),
  isLoading: false,
  error: null,
};

export const cartReducer = (
  state: CartState,
  action: CartAction
): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        (item) => item.productId === action.payload.productId
      );

      let newItems: CartItem[];
      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [...state.items, action.payload];
      }

      const { subtotal, itemCount } = calculateCartTotals(newItems);

      return {
        ...state,
        items: newItems,
        subtotal,
        itemCount,
        lastUpdated: Date.now(),
        error: null,
      };
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter(
        (item) => item.productId !== action.payload
      );
      const { subtotal, itemCount } = calculateCartTotals(newItems);

      return {
        ...state,
        items: newItems,
        subtotal,
        itemCount,
        lastUpdated: Date.now(),
        error: null,
      };
    }

    case "UPDATE_QUANTITY": {
      const { productId, quantity } = action.payload;

      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        const newItems = state.items.filter(
          (item) => item.productId !== productId
        );
        const { subtotal, itemCount } = calculateCartTotals(newItems);

        return {
          ...state,
          items: newItems,
          subtotal,
          itemCount,
          lastUpdated: Date.now(),
          error: null,
        };
      }

      const newItems = state.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
      const { subtotal, itemCount } = calculateCartTotals(newItems);

      return {
        ...state,
        items: newItems,
        subtotal,
        itemCount,
        lastUpdated: Date.now(),
        error: null,
      };
    }

    case "CLEAR_CART":
      return {
        ...initialCartState,
        lastUpdated: Date.now(),
      };

    case "LOAD_CART":
      return {
        ...state,
        items: action.payload.items,
        subtotal: action.payload.subtotal,
        itemCount: action.payload.itemCount,
        lastUpdated: action.payload.lastUpdated,
        isLoading: false,
        error: null,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    default:
      return state;
  }
};
