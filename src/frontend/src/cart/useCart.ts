/**
 * Cart Hook
 * Provides cart state and operations with localStorage persistence
 * and Firestore sync for authenticated users
 */

import { useReducer, useEffect, useCallback } from "react";
import { cartReducer, initialCartState } from "./cartReducer";
import { CartItem, CartState } from "../types/cart";
import {
  saveCartToStorage,
  loadCartFromStorage,
  clearCartStorage,
} from "../utils/cartStorage";
import { db } from "../config/firebase";
import { doc, setDoc, getDoc, onSnapshot, Timestamp } from "firebase/firestore";

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

  // Sync cart to Firestore for authenticated users
  const syncCartToFirestore = useCallback(async (userId: string) => {
    if (!userId) return;
    try {
      const cartDocRef = doc(db, "users", userId, "cart", "data");
      await setDoc(cartDocRef, {
        items: state.items,
        subtotal: state.subtotal,
        itemCount: state.itemCount,
        lastUpdated: Timestamp.now(),
      }, { merge: true });
      console.log("✅ Cart synced to Firestore");
    } catch (error) {
      console.error("❌ Failed to sync cart to Firestore:", error);
    }
  }, [state.items, state.subtotal, state.itemCount]);

  // Load cart from Firestore for authenticated users
  const loadCartFromFirestore = useCallback(async (userId: string) => {
    if (!userId) return;
    try {
      const cartDocRef = doc(db, "users", userId, "cart", "data");
      const cartSnap = await getDoc(cartDocRef);
      
      if (cartSnap.exists()) {
        const firestoreCart = cartSnap.data() as unknown as CartState;
        dispatch({ type: "LOAD_CART", payload: firestoreCart });
        console.log("✅ Cart loaded from Firestore");
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } catch (error) {
      console.error("❌ Failed to load cart from Firestore:", error);
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Subscribe to real-time cart updates from Firestore
  const subscribeToCartUpdates = useCallback((userId: string) => {
    if (!userId) return;
    try {
      const cartDocRef = doc(db, "users", userId, "cart", "data");
      const unsubscribe = onSnapshot(cartDocRef, (snapshot) => {
        if (snapshot.exists()) {
          dispatch({ type: "LOAD_CART", payload: snapshot.data() as unknown as CartState });
        }
      });
      return unsubscribe;
    } catch (error) {
      console.error("❌ Failed to subscribe to cart updates:", error);
    }
  }, []);

  return {
    cart: state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    syncCartToFirestore,
    loadCartFromFirestore,
    subscribeToCartUpdates,
  };
};
