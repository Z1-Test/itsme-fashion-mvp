// Cart Service
export { cart } from "./src/services/cart/src/index";

// Catalog Service
export { getAllProducts, getProductsByCategory, getProductById } from "./src/services/catalog/src/index";

// Delivery Service
export { getAllOrders, getOrderDetails, updateOrderStatus, getUserOrders, getOrderStatistics, exportOrders } from "./src/services/delivery/src/index";
// Delivery Service - Order Management
export { createOrder, onOrderCreated, updateOrderStatus, getUserOrders, getOrder } from "./src/services/delivery/src/index";

// Identity Service
export { registerUser, saveAddress, getAddresses } from "./src/services/identity/src/index";

// Payments Service
export { payments } from "./src/services/payments/src/index";

// WishList Service
export { wishList } from "./src/services/wishList/src/index";