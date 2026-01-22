import { Functions, httpsCallable } from "firebase/functions";
import { NotificationService } from "@itsme/design-system";

interface WishlistItem {
  productId: string;
  addedAt: string;
}

interface WishlistResponse {
  success: boolean;
  message?: string;
  items?: WishlistItem[];
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
  } else {
    // Using existing userId
  }
  
  return userId;
}

/**
 * Wishlist Service - handles wishlist operations via Firebase Cloud Functions
 */
export class WishlistService {
  private functions: Functions;

  constructor(functions: Functions) {
    this.functions = functions;
  }

  /**
   * Add a product to the wishlist in Firestore
   * @param productId - The ID of the product to add
   * @returns Promise with the operation result
   */
  async addToWishlist(productId: string): Promise<{ success: boolean; message: string }> {
    try {
      const addToWishListFn = httpsCallable<
        { productId: string; anonymousUserId?: string },
        WishlistResponse
      >(this.functions, "addToWishList");

      const result = await addToWishListFn({ 
        productId,
        anonymousUserId: getAnonymousUserId()
      });
      
      return {
        success: result.data.success,
        message: result.data.message || "Product added to wishlist",
      };
    } catch (error) {
      NotificationService.error("Failed to add product to wishlist");
      throw error;
    }
  }

  /**
   * Remove a product from the wishlist in Firestore
   * @param productId - The ID of the product to remove
   * @returns Promise with the operation result
   */
  async removeFromWishlist(productId: string): Promise<{ success: boolean; message: string }> {
    try {
      const removeFromWishListFn = httpsCallable<
        { productId: string; anonymousUserId?: string },
        WishlistResponse
      >(this.functions, "removeFromWishList");

      const result = await removeFromWishListFn({ 
        productId,
        anonymousUserId: getAnonymousUserId()
      });
      
      return {
        success: result.data.success,
        message: result.data.message || "Product removed from wishlist",
      };
    } catch (error) {
      NotificationService.error("Failed to remove product from wishlist");
      throw error;
    }
  }

  /**
   * Get the user's wishlist from Firestore
   * @returns Promise with array of product IDs
   */
  async getWishlist(): Promise<string[]> {
    try {
      const getWishListFn = httpsCallable<
        { anonymousUserId?: string },
        WishlistResponse
      >(this.functions, "getWishList");

      const result = await getWishListFn({ 
        anonymousUserId: getAnonymousUserId()
      });
      if (result.data.success && result.data.items) {
        return result.data.items.map((item) => item.productId);
      }
      return [];
    } catch (error) {
      NotificationService.error("Failed to load wishlist");
      return [];
    }
  }

  /**
   * Check if a product is in the wishlist
   * @param productId - The ID of the product to check
   * @returns Promise with boolean indicating if product is in wishlist
   */
  async isInWishlist(productId: string): Promise<boolean> {
    const wishlistIds = await this.getWishlist();
    return wishlistIds.includes(productId);
  }
}
