/**
 * Types for the delivery service
 */

export interface CartItem {
  productId: string;
  product: any;
  quantity: number;
  price: number;
  shadeIndex?: number; // Index of the shade in the shades array (optional, defaults to 0)
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
