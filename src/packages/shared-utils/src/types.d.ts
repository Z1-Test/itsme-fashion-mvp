export interface Product {
    id: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    description: string;
    ingredients?: string;
    usage?: string;
    imageUrl?: string;
    shades?: ProductShade[];
    stock: number;
    ethical?: EthicalMarkers;
    ethicalMarkers?: string[];
    createdAt?: string;
    updatedAt?: string;
    tagline?: string;
    longDescription?: string;
    benefits?: string;
    caution?: string;
    shippingInfo?: string;
    quantity?: string;
}
export interface ProductShade {
    name: string;
    hexCode: string;
    stock: number;
    sku?: string;
    code?: string;
}
export interface EthicalMarkers {
    vegan: boolean;
    crueltyFree: boolean;
    organic: boolean;
    sustainable: boolean;
}
export interface User {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    createdAt: string;
    updatedAt: string;
}
export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    phone?: string;
    addresses: Address[];
    defaultAddressId?: string;
    createdAt: string;
    updatedAt: string;
}
export interface Address {
    id: string;
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
}
export interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    shade?: string;
    imageUrl?: string;
}
export interface Cart {
    userId?: string;
    items: CartItem[];
    total: number;
    updatedAt: string;
}
export interface WishlistItem {
    productId: string;
    addedAt: string;
}
export interface Wishlist {
    userId: string;
    items: WishlistItem[];
    updatedAt: string;
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
}
export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded";
export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
export interface Payment {
    id: string;
    orderId: string;
    userId: string;
    amount: number;
    currency: string;
    method: string;
    status: PaymentStatus;
    transactionId?: string;
    createdAt: string;
    updatedAt: string;
}
export interface Shipment {
    id: string;
    orderId: string;
    userId: string;
    trackingId: string;
    carrier: string;
    status: ShipmentStatus;
    estimatedDelivery?: string;
    actualDelivery?: string;
    events: ShipmentEvent[];
    createdAt: string;
    updatedAt: string;
}
export type ShipmentStatus = "pending" | "picked_up" | "in_transit" | "out_for_delivery" | "delivered" | "failed";
export interface ShipmentEvent {
    status: ShipmentStatus;
    location: string;
    timestamp: string;
    description: string;
}
export type Result<T, E = Error> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
export declare function Ok<T>(value: T): Result<T, never>;
export declare function Err<E>(error: E): Result<never, E>;
//# sourceMappingURL=types.d.ts.map