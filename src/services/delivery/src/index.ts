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
