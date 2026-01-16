/**
 * Love List Hook
 * Provides love list state and operations with localStorage persistence
 * and Firestore sync for authenticated users
 */

import { useReducer, useEffect, useCallback, useRef } from "react";
import { loveListReducer, initialLoveListState } from "./loveListReducer";
import { LoveListItem } from "../types/loveList";
import {
  saveLoveListToStorage,
  loadLoveListFromStorage,
  clearLoveListStorage,
} from "../utils/loveListStorage";
import { db, getUserLoveListDataPath } from "../config/firebase";
import { doc, setDoc, getDoc, onSnapshot, Timestamp, Unsubscribe } from "firebase/firestore";
import { useAuth } from "../hooks/useAuth";

export const useLoveList = () => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(loveListReducer, initialLoveListState);
  const firebaseSyncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  // Sync love list to Firestore
  const syncLoveListToFirestore = useCallback(async (userId: string) => {
    if (!userId) return;
    try {
      const loveListDocRef = doc(db, getUserLoveListDataPath(userId));
      await setDoc(loveListDocRef, {
        items: state.items,
        itemCount: state.items.length,
        lastUpdated: Timestamp.now(),
      }, { merge: true });
      console.log("✅ Love list synced to Firestore");
    } catch (error) {
      console.error("❌ Failed to sync love list to Firestore:", error);
    }
  }, [state.items]);

  // Load love list from Firestore
  const loadLoveListFromFirestore = useCallback(async (userId: string) => {
    if (!userId) return;
    try {
      const loveListDocRef = doc(db, getUserLoveListDataPath(userId));
      const loveListSnap = await getDoc(loveListDocRef);
      
      if (loveListSnap.exists()) {
        const firestoreLoveList = loveListSnap.data();
        dispatch({ type: "LOAD_LOVE_LIST", payload: firestoreLoveList.items || [] });
        console.log("✅ Love list loaded from Firestore");
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    } catch (error) {
      console.error("❌ Failed to load love list from Firestore:", error);
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Subscribe to real-time love list updates
  const subscribeLoveListUpdates = useCallback((userId: string): Unsubscribe | undefined => {
    if (!userId) return undefined;
    try {
      const loveListDocRef = doc(db, getUserLoveListDataPath(userId));
      const unsubscribe = onSnapshot(loveListDocRef, (snapshot) => {
        if (snapshot.exists()) {
          dispatch({ type: "LOAD_LOVE_LIST", payload: snapshot.data().items || [] });
        }
      });
      return unsubscribe;
    } catch (error) {
      console.error("❌ Failed to subscribe to love list updates:", error);
      return undefined;
    }
  }, []);

  // Load love list from localStorage on mount
  useEffect(() => {
    dispatch({ type: "SET_LOADING", payload: true });
    const storedLoveList = loadLoveListFromStorage();
    if (storedLoveList) {
      dispatch({ type: "LOAD_LOVE_LIST", payload: storedLoveList });
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Load from Firestore when user changes
  useEffect(() => {
    if (user?.uid) {
      loadLoveListFromFirestore(user.uid);
    }
  }, [user?.uid, loadLoveListFromFirestore]);

  // Subscribe to real-time Firestore updates
  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = subscribeLoveListUpdates(user.uid);
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
  }, [user?.uid, subscribeLoveListUpdates]);

  // Save love list to localStorage whenever it changes (for offline support)
  useEffect(() => {
    if (!state.isLoading) {
      if (state.items.length > 0) {
        saveLoveListToStorage(state.items);
      } else {
        clearLoveListStorage();
      }
    }
  }, [state.items, state.isLoading]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (firebaseSyncTimerRef.current) {
        clearTimeout(firebaseSyncTimerRef.current);
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const addItem = useCallback((item: Omit<LoveListItem, "addedAt">) => {
    dispatch({
      type: "ADD_ITEM",
      payload: { ...item, addedAt: Date.now() },
    });

    // Sync to Firestore if user is authenticated (with debounce)
    if (user?.uid) {
      if (firebaseSyncTimerRef.current) {
        clearTimeout(firebaseSyncTimerRef.current);
      }
      firebaseSyncTimerRef.current = setTimeout(() => {
        syncLoveListToFirestore(user.uid);
      }, 500);
    }
  }, [user?.uid, syncLoveListToFirestore]);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: productId });

    // Sync to Firestore if user is authenticated (with debounce)
    if (user?.uid) {
      if (firebaseSyncTimerRef.current) {
        clearTimeout(firebaseSyncTimerRef.current);
      }
      firebaseSyncTimerRef.current = setTimeout(() => {
        syncLoveListToFirestore(user.uid);
      }, 500);
    }
  }, [user?.uid, syncLoveListToFirestore]);

  const clearLoveList = useCallback(() => {
    dispatch({ type: "CLEAR_LOVE_LIST" });

    // Sync to Firestore if user is authenticated
    if (user?.uid) {
      syncLoveListToFirestore(user.uid);
    }
  }, [user?.uid, syncLoveListToFirestore]);

  const isInLoveList = (productId: string): boolean => {
    return state.items.some((item) => item.productId === productId);
  };

  return {
    loveList: state,
    addItem,
    removeItem,
    clearLoveList,
    isInLoveList,
    syncLoveListToFirestore,
    loadLoveListFromFirestore,
  };
};
