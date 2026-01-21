import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { onCall } from "firebase-functions/v2/https";

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

export const addToWishList = onCall(async (request) => {
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
  await db.collection("wishList").add(productData!);

  return { success: true, message: "Product added to wishList" };
});

export const removeFromWishList = onCall(async (request) => {
  const productId = request.data.productId;
  if (!productId) {
    throw new Error("Product ID is required");
  }

  const db = getFirestore();
  const wishListSnapshot = await db.collection("wishList").where("productId", "==", productId).get();

  if (wishListSnapshot.empty) {
    return { success: false, message: "Product not found in wishList" };
  }

  const batch = db.batch();
  wishListSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  return { success: true, message: "Product removed from wishList" };
});
