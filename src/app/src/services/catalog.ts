/**
 * Catalog Service Client
 * Helper functions to interact with the catalog Firebase functions
 */

import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";

export interface Product {
  id: string;
  url?: string;
  imageUrl?: string;
  productId: string;
  category: string;
  productName: string;
  productCode: string;
  tagline: string;
  shortDescription: string;
  description: string;
  keyBenefits: string;
  ingredients: string;
  howToUse: string;
  caution: string;
  shippingAndDelivery: string;
  productLink?: string;
  shades?: Array<{
    no: number;
    sku: string;
    shadeName: string;
    shadeCode: string;
    hexCode: string;
    price: number;
    stock: number;
    quantity: string;
  }>;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
  category?: string;
}

/**
 * Fetch all products from the catalog
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const getAllProductsFn = httpsCallable<void, ApiResponse<Product[]>>(
      functions,
      "getAllProducts"
    );
    
    const result = await getAllProductsFn();
    
    if (result.data.success) {
      return result.data.data;
    }
    
    throw new Error(result.data.message || "Failed to fetch products");
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch products by category
 * @param category - The category to filter by (e.g., 'eyes', 'lips', 'face')
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const getProductsByCategoryFn = httpsCallable<
      { category: string },
      ApiResponse<Product[]>
    >(functions, "getProductsByCategory");
    
    const result = await getProductsByCategoryFn({ category });
    
    if (result.data.success) {
      return result.data.data;
    }
    
    throw new Error(result.data.message || "Failed to fetch products");
  } catch (error) {
    throw error;
  }
}

/**
 * Fetch a single product by its ID
 * @param productId - The Firestore document ID of the product
 */
export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const getProductByIdFn = httpsCallable<
      { productId: string },
      ApiResponse<Product | null>
    >(functions, "getProductById");
    
    const result = await getProductByIdFn({ productId });
    
    if (result.data.success) {
      return result.data.data;
    }
    
    return null;
  } catch (error) {
    throw error;
  }
}

/**
 * Search products by name (client-side filtering)
 * @param searchTerm - The term to search for in product names
 */
export async function searchProducts(searchTerm: string): Promise<Product[]> {
  try {
    const allProducts = await getAllProducts();
    
    if (!searchTerm || searchTerm.trim() === "") {
      return allProducts;
    }
    
    const term = searchTerm.toLowerCase();
    return allProducts.filter((product) =>
      product.productName.toLowerCase().includes(term)
    );
  } catch (error) {
    throw error;
  }
}

// Export types for use in other modules
export type { ApiResponse };
