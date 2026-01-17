/**
 * Cart Hook
 * Provides cart state and operations with localStorage persistence
 * and Firestore sync for authenticated users
 */

import { useReducer, useEffect, useCallback, useRef } from "react";
import { cartReducer, initialCartState } from "./cartReducer";
import { CartItem, CartState } from "../types/cart";
import {
  saveCartToStorage,
  loadCartFromStorage,
  clearCartStorage,
} from "../utils/cartStorage";
import { db, getUserCartDataPath } from "../config/firebase";
import { doc, setDoc, getDoc, onSnapshot, Timestamp, Unsubscribe } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";

export const useCart = () => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  const firestoreSyncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const stateRef = useRef(state);

  // Keep stateRef in sync with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Sync cart to Firestore for authenticated users
  const syncCartToFirestore = useCallback(async (userId: string) => {
    if (!userId) return;
    try {
      const cartDocRef = doc(db, getUserCartDataPath(userId));
      const currentState = stateRef.current;
      await setDoc(cartDocRef, {
        items: currentState.items,
        subtotal: currentState.subtotal,
        itemCount: currentState.itemCount,
        lastUpdated: Timestamp.now(),
      }, { merge: true });
      console.log("✅ Cart synced to Firestore");
    } catch (error) {
      console.error("❌ Failed to sync cart to Firestore:", error);
    }
  }, []);

  // Load cart from Firestore for authenticated users
  const loadCartFromFirestore = useCallback(async (userId: string) => {
    if (!userId) return;
    try {
      const cartDocRef = doc(db, getUserCartDataPath(userId));
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
  const subscribeToCartUpdates = useCallback((userId: string): Unsubscribe | undefined => {
    if (!userId) return undefined;
    try {
      const cartDocRef = doc(db, getUserCartDataPath(userId));
      const unsubscribe = onSnapshot(cartDocRef, (snapshot) => {
        if (snapshot.exists()) {
          dispatch({ type: "LOAD_CART", payload: snapshot.data() as unknown as CartState });
        }
      });
      return unsubscribe;
    } catch (error) {
      console.error("❌ Failed to subscribe to cart updates:", error);
      return undefined;
    }
  }, []);

  // Load cart from localStorage on mount (for anonymous users only)
  useEffect(() => {
    // Only load from localStorage if user is not authenticated
    if (!user?.uid) {
      dispatch({ type: "SET_LOADING", payload: true });
      const storedCart = loadCartFromStorage();
      if (storedCart) {
        console.log(`📦 Anonymous user: Cart loaded from localStorage (${storedCart.items.length} items)`);
        dispatch({ type: "LOAD_CART", payload: storedCart });
      } else {
        console.log('📦 Anonymous user: No cart in localStorage, starting fresh');
        dispatch({ type: "SET_LOADING", payload: false });
      }
    }
  }, [user?.uid]);

  // Load from Firestore when user authenticates
  useEffect(() => {
    if (user?.uid) {
      console.log(`🔥 Authenticated user detected: Loading cart from Firestore (${user.uid})`);
      loadCartFromFirestore(user.uid);
      
      // Migrate localStorage cart to Firestore if it exists
      const localCart = loadCartFromStorage();
      if (localCart && localCart.items.length > 0) {
        console.log(`📦➡️🔥 Migrating ${localCart.items.length} items from localStorage to Firestore`);
        // Dispatch the loaded cart first, then sync
        dispatch({
          type: "LOAD_CART",
          payload: {
            items: localCart.items,
            subtotal: localCart.subtotal,
            itemCount: localCart.itemCount,
            lastUpdated: localCart.lastUpdated,
            isLoading: false,
            error: null,
          },
        });
      }
    }
  }, [user?.uid]);

  // Subscribe to real-time Firestore updates
  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = subscribeToCartUpdates(user.uid);
      if (unsubscribe) {
        unsubscribeRef.current = unsubscribe;
      }
      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      };
    }
  }, [user?.uid, subscribeToCartUpdates]);

  // Save cart to localStorage whenever it changes (for offline support)
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

  // Cleanup timer and subscription on unmount
  useEffect(() => {
    return () => {
      if (firestoreSyncTimerRef.current) {
        clearTimeout(firestoreSyncTimerRef.current);
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: "ADD_ITEM", payload: item });
    
    // Sync to Firestore if user is authenticated (with debounce)
    if (user?.uid) {
      if (firestoreSyncTimerRef.current) {
        clearTimeout(firestoreSyncTimerRef.current);
      }
      firestoreSyncTimerRef.current = setTimeout(() => {
        syncCartToFirestore(user.uid);
      }, 500); // Debounce Firestore sync by 500ms
    }
  }, [user?.uid]);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: productId });
    
    // Sync to Firestore if user is authenticated (with debounce)
    if (user?.uid) {
      if (firestoreSyncTimerRef.current) {
        clearTimeout(firestoreSyncTimerRef.current);
      }
      firestoreSyncTimerRef.current = setTimeout(() => {
        syncCartToFirestore(user.uid);
      }, 500);
    }
  }, [user?.uid]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, quantity } });
    
    // Sync to Firestore if user is authenticated (with debounce)
    if (user?.uid) {
      if (firestoreSyncTimerRef.current) {
        clearTimeout(firestoreSyncTimerRef.current);
      }
      firestoreSyncTimerRef.current = setTimeout(() => {
        syncCartToFirestore(user.uid);
      }, 500);
    }
  }, [user?.uid]);

  const clearCart = useCallback(() => {
    console.log('🗑️ Clearing cart');
    dispatch({ type: "CLEAR_CART" });
    clearCartStorage();
    
    // Sync to Firestore if user is authenticated
    if (user?.uid) {
      syncCartToFirestore(user.uid);
    }
  }, [user?.uid]);

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
