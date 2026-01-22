import { Functions, httpsCallable } from "firebase/functions";

export interface CartItem {
    id: string;
    productId: string;
    name: string;
    brand?: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    shade?: any;
    addedAt: string;
}

export interface Cart {
    total: number;
    itemCount: number;
    updatedAt?: string;
    items: CartItem[];
}

/**
 * Get or create a unique user ID for anonymous users
 * This persists across sessions in localStorage
 */
function getAnonymousUserId(): string {
  const STORAGE_KEY = "itsme_anonymous_user_id";
  
  let userId = localStorage.getItem(STORAGE_KEY);
  
  if (!userId) {
    // Generate a unique ID: anonymous_{timestamp}_{random}
    userId = `anonymous_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, userId);
  }
  
  return userId;
}

/**
 * Cart Service - handles cart operations via Firebase Cloud Functions
 */
export class CartService {
    private functions: Functions;

    constructor(functions: Functions) {
        this.functions = functions;
    }

    /**
     * Add a product to the cart in Firestore
     * @param productId - The ID of the product to add
     * @param quantity - The quantity to add
     * @param shade - The selected shade (optional)
     * @returns Promise with the operation result
     */
    async addToCart(productId: string, quantity: number = 1, shade?: any): Promise<{ success: boolean; message: string; total?: number; itemCount?: number }> {
        try {
            const addToCartFunction = httpsCallable<
                { productId: string; quantity: number; shade?: any; anonymousUserId?: string },
                { success: boolean; message: string; total?: number; itemCount?: number }
            >(this.functions, "addToCart");

            const result = await addToCartFunction({ 
                productId, 
                quantity, 
                shade,
                anonymousUserId: getAnonymousUserId()
            });
            return result.data;
        } catch (error) {
            console.error("Error adding to cart:", error);
            throw error;
        }
    }

    /**
     * Remove a product from the cart in Firestore
     * @param productId - The ID of the product to remove
     * @param shade - Optional shade to remove specific shade of product
     * @returns Promise with the operation result
     */
    async removeFromCart(productId: string, shade?: any): Promise<{ success: boolean; message: string; total?: number; itemCount?: number }> {
        try {
            const removeFromCartFunction = httpsCallable<
                { productId: string; shade?: any; anonymousUserId?: string },
                { success: boolean; message: string; total?: number; itemCount?: number }
            >(this.functions, "removeFromCart");

            const result = await removeFromCartFunction({ 
                productId,
                shade,
                anonymousUserId: getAnonymousUserId()
            });
            return result.data;
        } catch (error) {
            console.error("Error removing from cart:", error);
            throw error;
        }
    }

    /**
     * Clear all items from the cart in Firestore
     * @returns Promise with the operation result
     */
    async clearCart(): Promise<{ success: boolean; message: string; total?: number; itemCount?: number }> {
        try {
            const clearCartFunction = httpsCallable<
                { anonymousUserId?: string },
                { success: boolean; message: string; total?: number; itemCount?: number }
            >(this.functions, "clearCart");

            const result = await clearCartFunction({ 
                anonymousUserId: getAnonymousUserId()
            });
            return result.data;
        } catch (error) {
            console.error("Error clearing cart:", error);
            throw error;
        }
    }

    /**
     * Get the user's cart from Firestore
     * @returns Promise with the cart data
     */
    async getCart(): Promise<{ success: boolean; cart: Cart }> {
        try {
            const getCartFunction = httpsCallable<
                { anonymousUserId?: string },
                { success: boolean; cart: Cart }
            >(this.functions, "getCart");

            const result = await getCartFunction({ 
                anonymousUserId: getAnonymousUserId()
            });
            return result.data;
        } catch (error) {
            console.error("Error getting cart:", error);
            throw error;
        }
    }

    /**
     * Update the quantity of a specific product in the cart
     * @param productId - The ID of the product to update
     * @param quantity - The new quantity to set
     * @returns Promise with the operation result
     */
    async updateQuantity(productId: string, quantity: number): Promise<{ success: boolean; message: string; total?: number; itemCount?: number }> {
        try {
            const updateQuantityFunction = httpsCallable<
                { productId: string; quantity: number; anonymousUserId?: string },
                { success: boolean; message: string; total?: number; itemCount?: number }
            >(this.functions, "updateCartItemQuantity");

            const result = await updateQuantityFunction({ 
                productId, 
                quantity,
                anonymousUserId: getAnonymousUserId()
            });
            return result.data;
        } catch (error) {
            console.error("Error updating quantity:", error);
            throw error;
        }
    }
}
