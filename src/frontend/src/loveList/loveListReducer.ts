/**
 * Love List Reducer
 * Manages love list state with localStorage persistence
 */

import { LoveListState, LoveListAction } from "../types/loveList";

export const initialLoveListState: LoveListState = {
  items: [],
  lastUpdated: Date.now(),
  isLoading: false,
  error: null,
};

export const loveListReducer = (
  state: LoveListState,
  action: LoveListAction
): LoveListState => {
  switch (action.type) {
    case "ADD_ITEM": {
      // Check if item already exists
      const existingItem = state.items.find(
        (item) => item.productId === action.payload.productId
      );

      if (existingItem) {
        return state; // Item already in love list
      }

      return {
        ...state,
        items: [...state.items, action.payload],
        lastUpdated: Date.now(),
        error: null,
      };
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter(
        (item) => item.productId !== action.payload
      );

      return {
        ...state,
        items: newItems,
        lastUpdated: Date.now(),
        error: null,
      };
    }

    case "LOAD_LOVE_LIST": {
      return {
        ...state,
        items: action.payload,
        isLoading: false,
        error: null,
      };
    }

    case "CLEAR_LOVE_LIST": {
      return {
        ...state,
        items: [],
        lastUpdated: Date.now(),
        error: null,
      };
    }

    case "SET_LOADING": {
      return {
        ...state,
        isLoading: action.payload,
      };
    }

    case "SET_ERROR": {
      return {
        ...state,
        error: action.payload,
      };
    }

    default:
      return state;
  }
};
