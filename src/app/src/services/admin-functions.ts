import { httpsCallable } from "firebase/functions";
import { getFunctions } from "firebase/functions";
import { initializeApp, getApps } from "firebase/app";

// Initialize Firebase if not already done
if (!getApps().length) {
  initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  });
}

const functions = getFunctions();

// Admin Cloud Functions
export const getAllOrdersCallable = httpsCallable(functions, "getAllOrders");
export const getOrderDetailsCallable = httpsCallable(functions, "getOrderDetails");
export const updateOrderStatusCallable = httpsCallable(functions, "updateOrderStatus");
export const getUserOrdersCallable = httpsCallable(functions, "getUserOrders");
export const getOrderStatisticsCallable = httpsCallable(functions, "getOrderStatistics");
export const exportOrdersCallable = httpsCallable(functions, "exportOrders");

// Admin Service Functions
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

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  byStatus: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  byPaymentStatus: {
    pending: number;
    completed: number;
    failed: number;
    refunded: number;
  };
}

// Service functions that call the cloud functions
export async function getAllOrders(): Promise<{ success: boolean; data: Order[]; count: number }> {
  try {
    const result = await getAllOrdersCallable();
    return result.data as { success: boolean; data: Order[]; count: number };
  } catch (error) {
    console.error("Error calling getAllOrders:", error);
    throw error;
  }
}

export async function getOrderDetails(orderId: string): Promise<{ success: boolean; data: Order }> {
  try {
    const result = await getOrderDetailsCallable({ orderId });
    return result.data as { success: boolean; data: Order };
  } catch (error) {
    console.error("Error calling getOrderDetails:", error);
    throw error;
  }
}

export async function updateOrderStatus(data: {
  orderId: string;
  orderStatus: string;
  paymentStatus?: string;
  notes?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const result = await updateOrderStatusCallable(data);
    return result.data as { success: boolean; message: string };
  } catch (error) {
    console.error("Error calling updateOrderStatus:", error);
    throw error;
  }
}

export async function getUserOrders(userId: string): Promise<{ success: boolean; data: Order[]; count: number }> {
  try {
    const result = await getUserOrdersCallable({ userId });
    return result.data as { success: boolean; data: Order[]; count: number };
  } catch (error) {
    console.error("Error calling getUserOrders:", error);
    throw error;
  }
}

export async function getOrderStatistics(): Promise<{ success: boolean; data: OrderStats }> {
  try {
    const result = await getOrderStatisticsCallable();
    return result.data as { success: boolean; data: OrderStats };
  } catch (error) {
    console.error("Error calling getOrderStatistics:", error);
    throw error;
  }
}

export async function exportOrders(): Promise<{ success: boolean; data: string; count: number }> {
  try {
    const result = await exportOrdersCallable();
    return result.data as { success: boolean; data: string; count: number };
  } catch (error) {
    console.error("Error calling exportOrders:", error);
    throw error;
  }
}
