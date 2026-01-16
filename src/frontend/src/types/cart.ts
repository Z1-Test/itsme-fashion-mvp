/**
 * Cart Type Definitions
 * Supports both anonymous (localStorage) and authenticated (Firestore) carts
 */

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  shade?: string;
  inStock: boolean;
  maxQuantity?: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  lastUpdated: number; // Unix timestamp
}

export interface CartState extends Cart {
  isLoading: boolean;
  error: string | null;
}

export type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string } // productId
  | {
      type: "UPDATE_QUANTITY";
      payload: { productId: string; quantity: number };
    }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: Cart }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };
