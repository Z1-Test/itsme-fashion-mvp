import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Add a product to the user's cart
 * Structure: carts/{userId} with items array
 */
export const addToCart = onCall(async (request) => {
  const { productId, quantity = 1, shade } = request.data;
  const anonymousUserId = request.data.anonymousUserId;

  logger.info("🛒 addToCart called with:", { productId, quantity, shade });

  if (!productId) {
    throw new Error("Product ID is required");
  }

  // Get userId from auth or use anonymous user ID from client
  let userId = request.auth?.uid;
  if (!userId && anonymousUserId) {
    userId = anonymousUserId;
  }
  if (!userId) {
    userId = "guest";
  }
  logger.info("👤 User ID:", userId);

  const db = getFirestore();

  // Fetch product details
  const productSnapshot = await db.collection("products").doc(productId).get();
  logger.info("📦 Product exists:", productSnapshot.exists);

  if (!productSnapshot.exists) {
    throw new Error("Product not found");
  }

  const productData = productSnapshot.data()!;
  logger.info("📋 Product data:", productData.productName);

  // Reference to user's cart document
  const cartRef = db.collection("carts").doc(userId);
  const cartDoc = await cartRef.get();

  const now = new Date().toISOString();
  const itemPrice = shade?.price || productData.shades?.[0]?.price || 0;

  if (!cartDoc.exists) {
    // Create new cart with first item
    await cartRef.set({
      userId,
      total: itemPrice * quantity,
      itemCount: 1,
      updatedAt: now,
      items: [
        {
          productId: productId,
          name: productData.productName,
          brand: productData.brand || null,
          price: itemPrice,
          quantity: quantity,
          imageUrl: productData.imageUrl || productData.url || null,
          shade: shade || null,
          addedAt: now,
        },
      ],
    });

    logger.info("➕ Created new cart with item");
  } else {
    // Update existing cart
    const cartData = cartDoc.data()!;
    const items = cartData.items || [];

    // Check if item with same product AND shade already exists
    const existingItemIndex = items.findIndex((item: any) => {
      const isSameProduct = item.productId === productId;
      const isSameShade = shade 
        ? item.shade?.hexCode === shade.hexCode 
        : !item.shade;
      return isSameProduct && isSameShade;
    });

    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      items[existingItemIndex].quantity += quantity;
      items[existingItemIndex].updatedAt = now;
      logger.info("🔄 Updated quantity to:", items[existingItemIndex].quantity);
    } else {
      // Add new item to array
      items.push({
        productId: productId,
        name: productData.productName,
        brand: productData.brand || null,
        price: itemPrice,
        quantity: quantity,
        imageUrl: productData.imageUrl || productData.url || null,
        shade: shade || null,
        addedAt: now,
      });
      logger.info("➕ Added new item to cart");
    }

    // Calculate new total
    const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    await cartRef.update({
      items: items,
      total: total,
      itemCount: items.length,
      updatedAt: now,
    });

    logger.info("✅ Cart updated. Total:", total);
  }

  const updatedCart = await cartRef.get();
  const updatedData = updatedCart.data()!;

  return {
    success: true,
    message: "Product added to cart",
    total: updatedData.total,
    itemCount: updatedData.itemCount,
  };
});

/**
 * Remove a product from the user's cart
 */
export const removeFromCart = onCall(async (request) => {
  const { productId, shade } = request.data;
  const anonymousUserId = request.data.anonymousUserId;

  if (!productId) {
    throw new Error("Product ID is required");
  }

  // Get userId from auth or use anonymous user ID from client
  let userId = request.auth?.uid;
  if (!userId && anonymousUserId) {
    userId = anonymousUserId;
  }
  if (!userId) {
    userId = "guest";
  }

  const db = getFirestore();
  const cartRef = db.collection("carts").doc(userId);
  const cartDoc = await cartRef.get();

  if (!cartDoc.exists) {
    return { success: false, message: "Cart not found", total: 0, itemCount: 0 };
  }

  const cartData = cartDoc.data()!;
  const items = cartData.items || [];

  // Filter out the item to remove (considering both productId and shade)
  const filteredItems = items.filter((item: any) => {
    const isSameProduct = item.productId === productId;
    const isSameShade = shade 
      ? item.shade?.hexCode === shade.hexCode 
      : !item.shade;
    // Keep items that are NOT the one we want to remove
    return !(isSameProduct && isSameShade);
  });

  if (filteredItems.length === items.length) {
    return { success: false, message: "Product not found in cart" };
  }

  if (filteredItems.length === 0) {
    // Delete cart if no items left
    await cartRef.delete();
    return { success: true, message: "Cart cleared", total: 0, itemCount: 0 };
  }

  // Calculate new total
  const total = filteredItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  await cartRef.update({
    items: filteredItems,
    total: total,
    itemCount: filteredItems.length,
    updatedAt: new Date().toISOString(),
  });

  return {
    success: true,
    message: "Product removed from cart",
    total: total,
    itemCount: filteredItems.length,
  };
});

/**
 * Clear all items from the user's cart
 */
export const clearCart = onCall(async (request) => {
  const anonymousUserId = request.data.anonymousUserId;

  // Get userId from auth or use anonymous user ID from client
  let userId = request.auth?.uid;
  if (!userId && anonymousUserId) {
    userId = anonymousUserId;
  }
  if (!userId) {
    userId = "guest";
  }

  const db = getFirestore();
  const cartRef = db.collection("carts").doc(userId);
  const cartDoc = await cartRef.get();

  if (!cartDoc.exists) {
    return { success: true, message: "Cart is already empty" };
  }

  // Delete cart document
  await cartRef.delete();

  return { success: true, message: "Cart cleared", total: 0, itemCount: 0 };
});

/**
 * Get the user's cart with all items
 */
export const getCart = onCall(async (request) => {
  const anonymousUserId = request.data.anonymousUserId;

  // Get userId from auth or use anonymous user ID from client
  let userId = request.auth?.uid;
  if (!userId && anonymousUserId) {
    userId = anonymousUserId;
  }
  if (!userId) {
    userId = "guest";
  }

  const db = getFirestore();
  const cartRef = db.collection("carts").doc(userId);
  const cartDoc = await cartRef.get();

  if (!cartDoc.exists) {
    return {
      success: true,
      cart: { total: 0, itemCount: 0, items: [] }
    };
  }

  const cartData = cartDoc.data()!;

  return {
    success: true,
    cart: {
      total: cartData.total || 0,
      itemCount: cartData.itemCount || 0,
      updatedAt: cartData.updatedAt,
      items: cartData.items || [],
    },
  };
});

/**
 * Update the quantity of a specific product in the cart
 */
export const updateCartItemQuantity = onCall(async (request) => {
  const { productId, quantity } = request.data;
  const anonymousUserId = request.data.anonymousUserId;

  if (!productId || quantity === undefined) {
    throw new Error("Product ID and quantity are required");
  }

  if (quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  // Get userId from auth or use anonymous user ID from client
  let userId = request.auth?.uid;
  if (!userId && anonymousUserId) {
    userId = anonymousUserId;
  }
  if (!userId) {
    userId = "guest";
  }

  const db = getFirestore();
  const cartRef = db.collection("carts").doc(userId);
  const cartDoc = await cartRef.get();

  if (!cartDoc.exists) {
    return { success: false, message: "Cart not found" };
  }

  const cartData = cartDoc.data()!;
  const items = cartData.items || [];

  // Find the item to update
  const itemIndex = items.findIndex((item: any) => item.productId === productId);

  if (itemIndex === -1) {
    return { success: false, message: "Product not found in cart" };
  }

  // Update the quantity
  items[itemIndex].quantity = quantity;
  items[itemIndex].updatedAt = new Date().toISOString();

  // Calculate new total
  const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  await cartRef.update({
    items: items,
    total: total,
    updatedAt: new Date().toISOString(),
  });

  return {
    success: true,
    message: "Quantity updated",
    total: total,
    itemCount: items.length,
  };
});

