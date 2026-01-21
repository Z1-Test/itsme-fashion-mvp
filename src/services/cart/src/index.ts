import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { onCall } from "firebase-functions/v2/https";

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

export const addToCart = onCall(async (request) => {
  const productId = request.data.productId;
  if (!productId) {
    throw new Error("Product ID is required");
  }

  const db = getFirestore();
  const productSnapshot = await db.collection("products").doc(productId).get();
  if (!productSnapshot.exists) {
    throw new Error("Product not found");
  }

  const productData = productSnapshot.data();
  await db.collection("cart").add(productData!);

  return { success: true, message: "Product added to cart" };
});

export const removeFromCart = onCall(async (request) => {
  const productId = request.data.productId;
  if (!productId) {
    throw new Error("Product ID is required");
  }

  const db = getFirestore();
  const cartSnapshot = await db.collection("cart").where("productId", "==", productId).get();

  if (cartSnapshot.empty) {
    return { success: false, message: "Product not found in cart" };
  }

  const batch = db.batch();
  cartSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  return { success: true, message: "Product removed from cart" };
});


export const clearCart = onCall(async (request) => {
  const db = getFirestore();
  const cartSnapshot = await db.collection("cart").get();

  if (cartSnapshot.empty) {
    return { success: true, message: "Cart is already empty" };
  }

  const batch = db.batch();
  cartSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  return { success: true, message: "Cart cleared" };
});
