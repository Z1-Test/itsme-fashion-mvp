import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { onCall } from "firebase-functions/v2/https";

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

export const addToWishList = onCall(async (request) => {
  const productId = request.data.productId;
  const anonymousUserId = request.data.anonymousUserId;
  
  if (!productId) {
    throw new Error("Product ID is required");
  }

  // Get authenticated user ID, or use anonymous user ID from client
  let userId = request.auth?.uid;
  if (!userId && anonymousUserId) {
    userId = anonymousUserId;
  }
  if (!userId) {
    return { success: false, message: "User ID is required" };
  }

  const db = getFirestore();
  
  // Verify product exists
  const productSnapshot = await db.collection("products").doc(productId).get();
  if (!productSnapshot.exists) {
    throw new Error("Product not found");
  }

  // Get or create wishlist document at wishlists/{userId}
  const wishlistRef = db.collection("wishlists").doc(userId);
  const wishlistDoc = await wishlistRef.get();
  
  const now = new Date().toISOString();

  if (!wishlistDoc.exists) {
    // Create new wishlist with first item
    await wishlistRef.set({
      userId,
      createdAt: now,
      updatedAt: now,
      items: [
        {
          productId,
          addedAt: now,
        },
      ],
    });
  } else {
    // Update existing wishlist
    const wishlistData = wishlistDoc.data();
    const items = wishlistData?.items || [];
    
    // Check if product already in wishlist
    const existingIndex = items.findIndex((item: any) => item.productId === productId);
    if (existingIndex >= 0) {
      return { success: false, message: "Product already in wishlist" };
    }

    // Add new item
    items.push({
      productId,
      addedAt: now,
    });

    await wishlistRef.update({
      items,
      updatedAt: now,
    });
  }

  return { success: true, message: "Product added to wishlist" };
});

export const removeFromWishList = onCall(async (request) => {
  const productId = request.data.productId;
  const anonymousUserId = request.data.anonymousUserId;
  
  if (!productId) {
    throw new Error("Product ID is required");
  }

  // Get authenticated user ID, or use anonymous user ID from client
  let userId = request.auth?.uid;
  if (!userId && anonymousUserId) {
    userId = anonymousUserId;
  }
  if (!userId) {
    return { success: false, message: "User ID is required" };
  }

  const db = getFirestore();
  
  // Get wishlist document at wishlists/{userId}
  const wishlistRef = db.collection("wishlists").doc(userId);
  const wishlistDoc = await wishlistRef.get();

  if (!wishlistDoc.exists) {
    return { success: false, message: "Wishlist not found" };
  }

  const wishlistData = wishlistDoc.data();
  const items = wishlistData?.items || [];

  // Find and remove the item
  const filteredItems = items.filter((item: any) => item.productId !== productId);

  if (filteredItems.length === items.length) {
    return { success: false, message: "Product not found in wishlist" };
  }

  // Update wishlist with filtered items
  await wishlistRef.update({
    items: filteredItems,
    updatedAt: new Date().toISOString(),
  });

  return { success: true, message: "Product removed from wishlist" };
});

export const getWishList = onCall(async (request) => {
  const anonymousUserId = request.data.anonymousUserId;
  
  // Get authenticated user ID, or use anonymous user ID from client
  let userId = request.auth?.uid;
  if (!userId && anonymousUserId) {
    userId = anonymousUserId;
  }
  if (!userId) {
    return {
      success: true,
      items: [],
      wishlist: null,
    };
  }

  const db = getFirestore();
  
  // Get wishlist document at wishlists/{userId}
  const wishlistRef = db.collection("wishlists").doc(userId);
  const wishlistDoc = await wishlistRef.get();

  if (!wishlistDoc.exists) {
    return {
      success: true,
      items: [],
      wishlist: null,
    };
  }

  const wishlistData = wishlistDoc.data();

  return {
    success: true,
    items: wishlistData?.items || [],
    wishlist: {
      userId: wishlistData?.userId,
      createdAt: wishlistData?.createdAt,
      updatedAt: wishlistData?.updatedAt,
    },
  };
});
