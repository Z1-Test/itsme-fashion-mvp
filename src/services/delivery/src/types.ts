// Re-export types from shared-utils and extend as needed
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

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  product?: {
    productName?: string;
    name?: string;
    imageUrl?: string;
    image?: string;
  };
  shadeIndex?: number;
}

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
  notes?: string;
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
