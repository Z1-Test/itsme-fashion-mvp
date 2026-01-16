/**
 * Cart Page Component
 * Displays shopping cart with items, quantities, and subtotal
 * Supports anonymous (localStorage) cart persistence
 */

import React from 'react';
import { useCart } from './useCart';
import { CartItem } from '../types/cart';

export const CartPage: React.FC = () => {
  const { cart, removeItem, updateQuantity, clearCart } = useCart();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  if (cart.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cart.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {cart.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="mt-2 text-sm text-gray-600">
            {cart.itemCount === 0
              ? 'Your cart is empty'
              : `${cart.itemCount} ${cart.itemCount === 1 ? 'item' : 'items'} in your cart`}
          </p>
        </div>

        {cart.items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="flow-root">
                    <ul className="divide-y divide-gray-200">
                      {cart.items.map((item) => (
                        <CartItemRow
                          key={item.productId}
                          item={item}
                          onQuantityChange={handleQuantityChange}
                          onRemove={handleRemoveItem}
                        />
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="border-t border-gray-200 px-6 py-4">
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <CartSummary subtotal={cart.subtotal} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyCart: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-12 text-center">
    <div className="mx-auto w-24 h-24 mb-6">
      <svg
        className="w-full h-full text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
    <p className="text-gray-600 mb-6">Start adding products to your cart.</p>
    <a
      href="/"
      className="inline-block bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 transition"
    >
      Continue Shopping
    </a>
  </div>
);

interface CartItemRowProps {
  item: CartItem;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

const CartItemRow: React.FC<CartItemRowProps> = ({ item, onQuantityChange, onRemove }) => {
  const totalPrice = item.price * item.quantity;

  return (
    <li className="py-6">
      <div className="flex">
        {/* Product Image */}
        <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-md overflow-hidden">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="ml-6 flex-1 flex flex-col">
          <div className="flex">
            <div className="flex-1">
              <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
              {item.shade && (
                <p className="mt-1 text-sm text-gray-500">Shade: {item.shade}</p>
              )}
              {!item.inStock && (
                <p className="mt-1 text-sm text-red-600 font-medium">⚠️ Out of Stock</p>
              )}
            </div>
            <div className="ml-4">
              <p className="text-base font-medium text-gray-900">
                ₹{totalPrice.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">₹{item.price.toFixed(2)} each</p>
            </div>
          </div>

          <div className="flex-1 flex items-end justify-between">
            {/* Quantity Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onQuantityChange(item.productId, item.quantity - 1)}
                className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
                disabled={item.quantity <= 1}
              >
                <span className="text-lg font-medium">−</span>
              </button>
              <span className="text-sm font-medium text-gray-900 w-8 text-center">
                {item.quantity}
              </span>
              <button
                onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
                className="w-8 h-8 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
                disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
              >
                <span className="text-lg font-medium">+</span>
              </button>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => onRemove(item.productId)}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </li>
  );
};

interface CartSummaryProps {
  subtotal: number;
}

const CartSummary: React.FC<CartSummaryProps> = ({ subtotal }) => {
  const hasOutOfStockItems = false; // TODO: Check cart for out-of-stock items

  return (
    <div className="bg-white rounded-lg shadow p-6 sticky top-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-500">Calculated at checkout</span>
        </div>
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between">
            <span className="text-base font-semibold text-gray-900">Total</span>
            <span className="text-base font-semibold text-gray-900">
              ₹{subtotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {hasOutOfStockItems && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            Some items in your cart are out of stock. Please remove them to proceed.
          </p>
        </div>
      )}

      <button
        disabled={hasOutOfStockItems}
        className="w-full bg-gray-900 text-white py-3 px-4 rounded-md hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
      >
        Proceed to Checkout
      </button>

      <p className="mt-4 text-xs text-gray-500 text-center">
        Your cart is saved locally and will persist for 30 days
      </p>
    </div>
  );
};

export default CartPage;
