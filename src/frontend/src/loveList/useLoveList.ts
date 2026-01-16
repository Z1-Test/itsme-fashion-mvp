/**
 * Love List Hook
 * Provides love list state and operations with localStorage persistence
 * TODO: Add Firestore sync for authenticated users
 */

import { useReducer, useEffect } from "react";
import { loveListReducer, initialLoveListState } from "./loveListReducer";
import { LoveListItem } from "../types/loveList";
import {
  saveLoveListToStorage,
  loadLoveListFromStorage,
  clearLoveListStorage,
} from "../utils/loveListStorage";

export const useLoveList = () => {
  const [state, dispatch] = useReducer(loveListReducer, initialLoveListState);

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

  // Save love list to localStorage whenever it changes
  useEffect(() => {
    if (!state.isLoading) {
      if (state.items.length > 0) {
        saveLoveListToStorage(state.items);
      } else {
        clearLoveListStorage();
      }
    }
  }, [state.items, state.isLoading]);

  const addItem = (item: Omit<LoveListItem, "addedAt">) => {
    dispatch({
      type: "ADD_ITEM",
      payload: { ...item, addedAt: Date.now() },
    });
  };

  const removeItem = (productId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: productId });
  };

  const clearLoveList = () => {
    dispatch({ type: "CLEAR_LOVE_LIST" });
  };

  const isInLoveList = (productId: string): boolean => {
    return state.items.some((item) => item.productId === productId);
  };

  return {
    loveList: state,
    addItem,
    removeItem,
    clearLoveList,
    isInLoveList,
  };
};
