import { getFunctions, httpsCallable, Functions } from "firebase/functions";

export interface CartItem {
  productId: string;
  product: any;
  quantity: number;
  price: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  label?: string;
}

export type PaymentStatus = 
  | "pending" 
  | "processing" 
  | "completed" 
  | "failed" 
  | "refunded";

export type OrderStatus = 
  | "pending" 
  | "confirmed" 
  | "processing" 
  | "shipped" 
  | "delivered" 
  | "cancelled";

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  userId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: string;
}

/**
 * Order Service
 * Handles order creation and management on the client side
 */
export class OrderService {
  private functions: Functions;

  constructor(functions: Functions) {
    this.functions = functions;
  }

  /**
   * Create a new order
   */
  async createOrder(orderData: CreateOrderRequest): Promise<{
    success: boolean;
    orderId: string;
    order: Order;
  }> {
    try {
      const createOrderFn = httpsCallable(this.functions, "createOrder");
      const result = await createOrderFn(orderData);
      const data = result.data as any;
      
      return {
        success: data.success,
        orderId: data.orderId,
        order: data.order,
      };
    } catch (error: any) {
      throw new Error(error.message || "Failed to create order");
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    orderStatus?: OrderStatus,
    paymentStatus?: PaymentStatus
  ): Promise<{
    success: boolean;
    orderId: string;
  }> {
    try {
      const updateOrderStatusFn = httpsCallable(this.functions, "updateOrderStatus");
      const result = await updateOrderStatusFn({
        orderId,
        orderStatus,
        paymentStatus,
      });
      const data = result.data as any;
      
      return {
        success: data.success,
        orderId: data.orderId,
      };
    } catch (error: any) {
      throw new Error(error.message || "Failed to update order status");
    }
  }

  /**
   * Get all orders for a user
   */
  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const getUserOrdersFn = httpsCallable(this.functions, "getUserOrders");
      const result = await getUserOrdersFn({ userId });
      const data = result.data as any;
      
      return data.data || [];
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch orders");
    }
  }

  /**
   * Get a specific order
   */
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const getOrderFn = httpsCallable(this.functions, "getOrder");
      const result = await getOrderFn({ orderId });
      const data = result.data as any;
      
      return data.order || null;
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch order");
    }
  }
}
