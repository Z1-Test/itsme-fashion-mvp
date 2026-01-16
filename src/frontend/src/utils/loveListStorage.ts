/**
 * Love List Storage Utilities
 * Provides localStorage persistence for love list
 */

import { LoveListItem } from "../types/loveList";

const LOVE_LIST_STORAGE_KEY = "itsme_love_list";

export const saveLoveListToStorage = (items: LoveListItem[]): void => {
  try {
    localStorage.setItem(
      LOVE_LIST_STORAGE_KEY,
      JSON.stringify({
        items,
        lastUpdated: Date.now(),
      })
    );
  } catch (error) {
    console.error("Failed to save love list to storage:", error);
  }
};

export const loadLoveListFromStorage = (): LoveListItem[] | null => {
  try {
    const stored = localStorage.getItem(LOVE_LIST_STORAGE_KEY);
    if (stored) {
      const { items } = JSON.parse(stored);
      return items || [];
    }
    return null;
  } catch (error) {
    console.error("Failed to load love list from storage:", error);
    return null;
  }
};

export const clearLoveListStorage = (): void => {
  try {
    localStorage.removeItem(LOVE_LIST_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear love list storage:", error);
  }
};
