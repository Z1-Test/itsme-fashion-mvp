/**
 * Catalog Service - Product management and retrieval functions
 */

import { onCall } from "firebase-functions/v2/https";
import  admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

// Initialize Firebase Admin

  admin.initializeApp();


const db = admin.firestore();
const PRODUCTS_COLLECTION = "products";

/**
 * Product interface matching the Firestore schema (camelCase fields)
 */
export interface Product {
  id: string;
  url?: string;
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

/**
 * Get all products from Firestore
 */
export const getAllProducts = onCall(async (request) => {
  try {
    logger.info("Fetching all products");
    
    const snapshot = await db.collection(PRODUCTS_COLLECTION).get();
    
    if (snapshot.empty) {
      return {
        success: true,
        data: [],
        message: "No products found",
      };
    }

    const products: Product[] = [];
    snapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      } as Product);
    });

    logger.info(`Found ${products.length} products`);
    
    return {
      success: true,
      data: products,
      count: products.length,
    };
  } catch (error) {
    logger.error("Error fetching all products:", error);
    throw new Error(`Failed to fetch products: ${error}`);
  }
});

/**
 * Get products by category
 */
export const getProductsByCategory = onCall(async (request) => {
  try {
    const { category } = request.data;

    if (!category) {
      throw new Error("Category parameter is required");
    }

    logger.info(`Fetching products for category: ${category}`);
    
    const snapshot = await db
      .collection(PRODUCTS_COLLECTION)
      .where("category", "==", category.toLowerCase())
      .get();

    if (snapshot.empty) {
      return {
        success: true,
        data: [],
        message: `No products found in category: ${category}`,
        category,
      };
    }

    const products: Product[] = [];
    snapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      } as Product);
    });

    logger.info(`Found ${products.length} products in category: ${category}`);
    
    return {
      success: true,
      data: products,
      count: products.length,
      category,
    };
  } catch (error) {
    logger.error("Error fetching products by category:", error);
    throw new Error(`Failed to fetch products by category: ${error}`);
  }
});

/**
 * Get a single product by ID
 */
export const getProductById = onCall(async (request) => {
  try {
    const { productId } = request.data;

    if (!productId) {
      throw new Error("Product ID parameter is required");
    }

    logger.info(`Fetching product with ID: ${productId}`);
    
    const doc = await db.collection(PRODUCTS_COLLECTION).doc(productId).get();

    if (!doc.exists) {
      return {
        success: false,
        data: null,
        message: `Product not found with ID: ${productId}`,
      };
    }

    const product: Product = {
      id: doc.id,
      ...doc.data(),
    } as Product;

    logger.info(`Found product: ${product.productName}`);
    
    return {
      success: true,
      data: product,
    };
  } catch (error) {
    logger.error("Error fetching product by ID:", error);
    throw new Error(`Failed to fetch product: ${error}`);
  }
});

