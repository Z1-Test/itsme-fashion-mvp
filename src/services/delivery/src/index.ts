/**
 * Delivery Service - Order Management Cloud Functions
 * 
 * Handles order creation, inventory management, and order lifecycle
 */

import admin from "firebase-admin";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {
  Order,
  CreateOrderRequest,
  PaymentStatus,
  OrderStatus,
} from "./types.js";

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

/**
 * Cloud Function to create a new order
 * Callable function that creates an order and reduces product stock
 */
export const createOrder = onCall(async (request) => {
  try {
    const data = request.data as CreateOrderRequest;

    // Validate required fields
    if (!data.userId || !data.items || data.items.length === 0) {
      throw new Error("Missing required fields: userId and items");
    }

    if (!data.shippingAddress || !data.paymentMethod) {
      throw new Error("Missing required fields: shippingAddress and paymentMethod");
    }

    // Create order ID
    const orderRef = db.collection("orders").doc();
    const orderId = orderRef.id;

    // Prepare order data
    const now = new Date().toISOString();
    const order: Order = {
      id: orderId,
      userId: data.userId,
      items: data.items,
      subtotal: data.subtotal,
      tax: data.tax,
      shipping: data.shipping,
      total: data.total,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      paymentStatus: "pending" as PaymentStatus,
      orderStatus: "pending" as OrderStatus,
      createdAt: now,
      updatedAt: now,
    };

    // Validate and check stock availability
    const batch = db.batch();
    const stockErrors: string[] = [];

    for (const item of data.items) {
      const productRef = db.collection("products").doc(item.productId);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        stockErrors.push(`Product ${item.productId} not found`);
        continue;
      }

      const productData = productDoc.data();
      const shades = productData?.shades || [];
      
      // Determine which shade to check (default to first shade if not specified)
      const shadeIndex = item.shadeIndex !== undefined ? item.shadeIndex : 0;
      
      if (shadeIndex < 0 || shadeIndex >= shades.length) {
        stockErrors.push(`Invalid shade index ${shadeIndex} for product ${item.productId}`);
        continue;
      }
      
      const shade = shades[shadeIndex];
      const currentStock = shade?.stock || 0;

      if (currentStock < item.quantity) {
        stockErrors.push(
          `Insufficient stock for product ${item.productId}. Available: ${currentStock}, Requested: ${item.quantity}`
        );
      }
    }

    // If there are stock errors, return them
    if (stockErrors.length > 0) {
      throw new Error(`Stock validation failed: ${stockErrors.join(", ")}`);
    }

    // Create the order
    batch.set(orderRef, order);

    // Update product stock for each item (decrement from specific shade)
    for (const item of data.items) {
      const productRef = db.collection("products").doc(item.productId);
      const productDoc = await productRef.get();
      const productData = productDoc.data();
      const shades = productData?.shades || [];
      
      // Determine which shade to update
      const shadeIndex = item.shadeIndex !== undefined ? item.shadeIndex : 0;
      const shade = shades[shadeIndex];
      
      // Decrement the shade stock
      shades[shadeIndex] = {
        ...shade,
        stock: shade.stock - item.quantity
      };
      
      // Calculate new total stock
      const totalStock = shades.reduce((sum: number, s: any) => sum + (s.stock || 0), 0);
      
      batch.update(productRef, {
        shades: shades,
        stock: totalStock, // Update total stock as well
        updatedAt: now,
      });
    }

    // Commit the batch
    await batch.commit();

    logger.info("Order created successfully", {orderId, userId: data.userId});

    return {
      success: true,
      orderId: orderId,
      order: order,
    };
  } catch (error: any) {
    logger.error("Error creating order", error);
    throw new Error(error.message || "Failed to create order");
  }
});

/**
 * Firestore Trigger: Automatically runs when a new order is created
 * Performs additional processing and logging
 */
export const onOrderCreated = onDocumentCreated(
  "orders/{orderId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.warn("No data associated with the event");
      return;
    }

    const order = snapshot.data() as Order;
    const orderId = event.params.orderId;

    try {
      logger.info("New order created", {
        orderId,
        userId: order.userId,
        total: order.total,
        itemCount: order.items.length,
      });

      // You can add additional processing here:
      // - Send order confirmation email
      // - Create notification for admin
      // - Update analytics
      // - Trigger payment processing

      // Update order status to confirmed
      await snapshot.ref.update({
        orderStatus: "confirmed" as OrderStatus,
        updatedAt: new Date().toISOString(),
      });

      logger.info("Order confirmed", {orderId});
    } catch (error) {
      logger.error("Error processing order creation", error, {orderId});
    }
  }
);

/**
 * Update order status
 * Callable function to update order status and payment status
 */
export const updateOrderStatus = onCall(async (request) => {
  try {
    const {orderId, orderStatus, paymentStatus} = request.data;

    if (!orderId) {
      throw new Error("Order ID is required");
    }

    const orderRef = db.collection("orders").doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      throw new Error("Order not found");
    }

    const updateData: Partial<Order> = {
      updatedAt: new Date().toISOString(),
    };

    if (orderStatus) {
      updateData.orderStatus = orderStatus as OrderStatus;
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus as PaymentStatus;
    }

    await orderRef.update(updateData);

    logger.info("Order status updated", {orderId, orderStatus, paymentStatus});

    return {
      success: true,
      orderId,
      ...updateData,
    };
  } catch (error: any) {
    logger.error("Error updating order status", error);
    throw new Error(error.message || "Failed to update order status");
  }
});

/**
 * Get user orders
 * Callable function to retrieve all orders for a specific user
 */
export const getUserOrders = onCall(async (request) => {
  try {
    const {userId} = request.data;

    if (!userId) {
      throw new Error("User ID is required");
    }

    const ordersSnapshot = await db
      .collection("orders")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const orders: Order[] = [];
    ordersSnapshot.forEach((doc) => {
      orders.push(doc.data() as Order);
    });

    return {
      success: true,
      orders,
    };
  } catch (error: any) {
    logger.error("Error fetching user orders", error);
    throw new Error(error.message || "Failed to fetch orders");
  }
});

/**
 * Get single order
 * Callable function to retrieve a specific order by ID
 */
export const getOrder = onCall(async (request) => {
  try {
    const {orderId} = request.data;

    if (!orderId) {
      throw new Error("Order ID is required");
    }

    const orderDoc = await db.collection("orders").doc(orderId).get();

    if (!orderDoc.exists) {
      throw new Error("Order not found");
    }

    return {
      success: true,
      order: orderDoc.data() as Order,
    };
  } catch (error: any) {
    logger.error("Error fetching order", error);
    throw new Error(error.message || "Failed to fetch order");
  }
});
