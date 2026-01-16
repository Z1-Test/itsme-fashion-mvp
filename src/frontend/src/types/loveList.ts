export interface LoveListItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  addedAt: number;
}

export interface LoveListState {
  items: LoveListItem[];
  lastUpdated: number;
  isLoading: boolean;
  error: null | string;
}

export type LoveListAction =
  | { type: "ADD_ITEM"; payload: LoveListItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "LOAD_LOVE_LIST"; payload: LoveListItem[] }
  | { type: "CLEAR_LOVE_LIST" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };
