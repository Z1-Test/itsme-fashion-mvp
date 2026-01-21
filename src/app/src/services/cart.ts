import { Functions, httpsCallable } from "firebase/functions";

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
     * @returns Promise with the operation result
     */
    async addToCart(productId: string): Promise<{ success: boolean; message: string }> {
        try {
            const addToCartFunction = httpsCallable<
                { productId: string },
                { success: boolean; message: string }
            >(this.functions, "addToCart");

            const result = await addToCartFunction({ productId });
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
    async removeFromCart(productId: string): Promise<{ success: boolean; message: string }> {
        try {
            const removeFromCartFunction = httpsCallable<
                { productId: string },
                { success: boolean; message: string }
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
    async clearCart(): Promise<{ success: boolean; message: string }> {
        try {
            const clearCartFunction = httpsCallable<
                Record<string, never>,
                { success: boolean; message: string }
            >(this.functions, "clearCart");

            const result = await clearCartFunction({});
            return result.data;
        } catch (error) {
            console.error("Error clearing cart:", error);
            throw error;
        }
    }
}
