import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin if not already done
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

// Types for Order
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all orders for admin panel
 * Delivery Service - Order Management Cloud Functions
 * 
 * Handles order creation, inventory management, and order lifecycle
 */
export const getAllOrders = onCall(
  { cors: ["https://localhost:5173", "http://localhost:5173"] },
  async (request) => {
    try {
      // Check if user is admin (you'll need to implement proper auth check)
      logger.info("Fetching all orders for admin panel");

      const ordersSnapshot = await db.collection("orders").get();
      const orders: Order[] = [];

      ordersSnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });

      logger.info(`Retrieved ${orders.length} orders`);
      return {
        success: true,
        data: orders,
        count: orders.length,
      };
    } catch (error) {
      logger.error("Error fetching orders:", error);
      throw new Error("Failed to fetch orders");
    }
  }
);

/**
 * Get order details by ID
 */
export const getOrderDetails = onCall(
  { cors: ["https://localhost:5173", "http://localhost:5173"] },
  async (request) => {
    try {
      const { orderId } = request.data;

      if (!orderId) {
        throw new Error("Order ID is required");
      }

      logger.info(`Fetching order details for orderId: ${orderId}`);

      const orderDoc = await db.collection("orders").doc(orderId).get();

      if (!orderDoc.exists) {
        throw new Error(`Order not found: ${orderId}`);
      }

      const order = { id: orderDoc.id, ...orderDoc.data() } as Order;

      logger.info(`Order details retrieved for ${orderId}`);
      return {
        success: true,
        data: order,
      };
    } catch (error) {
      logger.error("Error fetching order details:", error);
      throw new Error("Failed to fetch order details");
    }
  }
);

/**
 * Update order status
 */
export const updateOrderStatus = onCall(
  { cors: ["https://localhost:5173", "http://localhost:5173"] },
  async (request) => {
    try {
      const { orderId, orderStatus, paymentStatus, notes } = request.data;

      if (!orderId || !orderStatus) {
        throw new Error("Order ID and status are required");
      }

      logger.info(`Updating order ${orderId} to status: ${orderStatus}`);

      const updateData: Partial<Order> = {
        orderStatus: orderStatus,
        updatedAt: new Date().toISOString(),
      };

      if (paymentStatus) {
        updateData.paymentStatus = paymentStatus;
      }

      if (notes) {
        updateData.notes = notes;
      }

      await db.collection("orders").doc(orderId).update(updateData);

      logger.info(`Order ${orderId} updated successfully`);
      return {
        success: true,
        message: `Order status updated to ${orderStatus}`,
      };
    } catch (error) {
      logger.error("Error updating order status:", error);
      throw new Error("Failed to update order status");
    }
  }
);

/**
 * Get orders by user ID for admin
 */
export const getUserOrders = onCall(
  { cors: ["https://localhost:5173", "http://localhost:5173"] },
  async (request) => {
    try {
      const { userId } = request.data;

      if (!userId) {
        throw new Error("User ID is required");
      }

      logger.info(`Fetching orders for user: ${userId}`);

      const ordersSnapshot = await db
        .collection("orders")
        .where("userId", "==", userId)
        .get();

      const orders: Order[] = [];
      ordersSnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });

      logger.info(`Retrieved ${orders.length} orders for user ${userId}`);
      return {
        success: true,
        data: orders,
        count: orders.length,
      };
    } catch (error) {
      logger.error("Error fetching user orders:", error);
      throw new Error("Failed to fetch user orders");
    }
  }
);

/**
 * Get order statistics for dashboard
 */
export const getOrderStatistics = onCall(
  { cors: ["https://localhost:5173", "http://localhost:5173"] },
  async (request) => {
    try {
      logger.info("Fetching order statistics");

      const ordersSnapshot = await db.collection("orders").get();
      const orders: Order[] = [];

      ordersSnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });

      // Calculate statistics
      const stats = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
        averageOrderValue:
          orders.length > 0
            ? orders.reduce((sum, order) => sum + order.total, 0) /
              orders.length
            : 0,
        byStatus: {
          pending: orders.filter((o) => o.orderStatus === "pending").length,
          processing: orders.filter((o) => o.orderStatus === "processing")
            .length,
          shipped: orders.filter((o) => o.orderStatus === "shipped").length,
          delivered: orders.filter((o) => o.orderStatus === "delivered")
            .length,
          cancelled: orders.filter((o) => o.orderStatus === "cancelled")
            .length,
        },
        byPaymentStatus: {
          pending: orders.filter((o) => o.paymentStatus === "pending").length,
          completed: orders.filter((o) => o.paymentStatus === "completed")
            .length,
          failed: orders.filter((o) => o.paymentStatus === "failed").length,
          refunded: orders.filter((o) => o.paymentStatus === "refunded").length,
        },
      };

      logger.info("Order statistics calculated");
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      logger.error("Error calculating order statistics:", error);
      throw new Error("Failed to calculate order statistics");
    }
  }
);

/**
 * Export orders as CSV data
 */
export const exportOrders = onCall(
  { cors: ["https://localhost:5173", "http://localhost:5173"] },
  async (request) => {
    try {
      logger.info("Exporting orders");

      const ordersSnapshot = await db.collection("orders").get();
      const orders: Order[] = [];

      ordersSnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });

      // Format as CSV
      const csv = [
        "Order ID,User ID,Total,Status,Payment Status,Created At",
        ...orders.map(
          (o) =>
            `${o.id},${o.userId},${o.total},${o.orderStatus},${o.paymentStatus},${o.createdAt}`
        ),
      ].join("\n");

      logger.info(`Exported ${orders.length} orders`);
      return {
        success: true,
        data: csv,
        count: orders.length,
      };
    } catch (error) {
      logger.error("Error exporting orders:", error);
      throw new Error("Failed to export orders");
    }
  }
);
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
