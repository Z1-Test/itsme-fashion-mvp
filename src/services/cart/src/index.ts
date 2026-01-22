import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { onCall } from "firebase-functions/v2/https";

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Add a product to the user's cart
 * Structure: carts/{userId}/items/{productId}
 */
export const addToCart = onCall(async (request) => {
  const { productId, quantity = 1, shade } = request.data;

  console.log("🛒 addToCart called with:", { productId, quantity, shade });

  if (!productId) {
    throw new Error("Product ID is required");
  }

  // Get userId from auth or use "guest" for testing
  const userId = request.auth?.uid || "guest";
  console.log("👤 User ID:", userId);

  const db = getFirestore();

  // Fetch product details
  const productSnapshot = await db.collection("products").doc(productId).get();
  console.log("📦 Product exists:", productSnapshot.exists);

  if (!productSnapshot.exists) {
    throw new Error("Product not found");
  }

  const productData = productSnapshot.data()!;
  console.log("📋 Product data:", productData.productName);

  // Reference to user's cart
  const cartRef = db.collection("carts").doc(userId);
  const itemRef = cartRef.collection("items").doc(productId);

  // Check if item already exists
  const itemSnapshot = await itemRef.get();

  if (itemSnapshot.exists) {
    // Update quantity if item exists
    const existingData = itemSnapshot.data()!;
    const newQuantity = existingData.quantity + quantity;

    await itemRef.update({
      quantity: newQuantity,
      updatedAt: new Date().toISOString(),
    });

    console.log("🔄 Updated quantity to:", newQuantity);
  } else {
    // Create new cart item
    // Price is from the shade object, or fallback to first shade if not provided
    const itemPrice = shade?.price || productData.shades?.[0]?.price || 0;
    
    const cartItem = {
      productId: productId,
      name: productData.productName,
      brand: productData.brand || null,
      price: itemPrice,
      quantity: quantity,
      imageUrl: productData.imageUrl || productData.url || null,
      shade: shade || null,
      addedAt: new Date().toISOString(),
    };

    await itemRef.set(cartItem);
    console.log("➕ Added new item to cart with price:", itemPrice);
  }

  // Update cart metadata
  const itemsSnapshot = await cartRef.collection("items").get();
  const total = itemsSnapshot.docs.reduce((sum, doc) => {
    const data = doc.data();
    return sum + (data.price * data.quantity);
  }, 0);

  await cartRef.set({
    total: total,
    updatedAt: new Date().toISOString(),
    itemCount: itemsSnapshot.size,
  }, { merge: true });

  console.log("✅ Cart updated. Total:", total);

  return {
    success: true,
    message: "Product added to cart",
    total: total,
    itemCount: itemsSnapshot.size,
  };
});

/**
 * Remove a product from the user's cart
 */
export const removeFromCart = onCall(async (request) => {
  const { productId } = request.data;

  if (!productId) {
    throw new Error("Product ID is required");
  }

  const userId = request.auth?.uid || "guest";
  const db = getFirestore();

  const cartRef = db.collection("carts").doc(userId);
  const itemRef = cartRef.collection("items").doc(productId);

  // Delete the item
  await itemRef.delete();

  // Update cart metadata
  const itemsSnapshot = await cartRef.collection("items").get();

  if (itemsSnapshot.empty) {
    // Delete cart document if no items left
    await cartRef.delete();
    return { success: true, message: "Cart cleared", total: 0, itemCount: 0 };
  }

  const total = itemsSnapshot.docs.reduce((sum, doc) => {
    const data = doc.data();
    return sum + (data.price * data.quantity);
  }, 0);

  await cartRef.update({
    total: total,
    updatedAt: new Date().toISOString(),
    itemCount: itemsSnapshot.size,
  });

  return {
    success: true,
    message: "Product removed from cart",
    total: total,
    itemCount: itemsSnapshot.size,
  };
});

/**
 * Clear all items from the user's cart
 */
export const clearCart = onCall(async (request) => {
  const userId = request.auth?.uid || "guest";
  const db = getFirestore();

  const cartRef = db.collection("carts").doc(userId);
  const itemsSnapshot = await cartRef.collection("items").get();

  if (itemsSnapshot.empty) {
    return { success: true, message: "Cart is already empty" };
  }

  // Delete all items
  const batch = db.batch();
  itemsSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  batch.delete(cartRef); // Delete cart metadata too

  await batch.commit();

  return { success: true, message: "Cart cleared", total: 0, itemCount: 0 };
});

/**
 * Get the user's cart with all items
 */
export const getCart = onCall(async (request) => {
  const userId = request.auth?.uid || "guest";
  const db = getFirestore();

  const cartRef = db.collection("carts").doc(userId);
  const cartSnapshot = await cartRef.get();

  if (!cartSnapshot.exists) {
    return {
      success: true,
      cart: { total: 0, itemCount: 0, items: [] }
    };
  }

  const cartData = cartSnapshot.data()!;
  const itemsSnapshot = await cartRef.collection("items").get();

  const items = itemsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return {
    success: true,
    cart: {
      total: cartData.total || 0,
      itemCount: cartData.itemCount || 0,
      updatedAt: cartData.updatedAt,
      items: items,
    },
  };
});
