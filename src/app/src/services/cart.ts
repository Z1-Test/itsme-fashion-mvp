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
                { productId: string; quantity: number; shade?: any },
                { success: boolean; message: string; total?: number; itemCount?: number }
            >(this.functions, "addToCart");

            const result = await addToCartFunction({ productId, quantity, shade });
            return result.data;
        } catch (error) {
            console.error("Error adding to cart:", error);
            throw error;
        }
    }

    /**
     * Remove a product from the cart in Firestore
     * @param productId - The ID of the product to remove
     * @returns Promise with the operation result
     */
    async removeFromCart(productId: string): Promise<{ success: boolean; message: string; total?: number; itemCount?: number }> {
        try {
            const removeFromCartFunction = httpsCallable<
                { productId: string },
                { success: boolean; message: string; total?: number; itemCount?: number }
            >(this.functions, "removeFromCart");

            const result = await removeFromCartFunction({ productId });
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
                Record<string, never>,
                { success: boolean; message: string; total?: number; itemCount?: number }
            >(this.functions, "clearCart");

            const result = await clearCartFunction({});
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
                Record<string, never>,
                { success: boolean; cart: Cart }
            >(this.functions, "getCart");

            const result = await getCartFunction({});
            return result.data;
        } catch (error) {
            console.error("Error getting cart:", error);
            throw error;
        }
    }
}
