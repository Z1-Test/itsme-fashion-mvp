/**
 * Cart Page Component
 * Displays shopping cart with items, quantities, and subtotal
 * Supports anonymous (localStorage) cart persistence
 * Uses consistent theme from Catalog
 */

import React, { useMemo } from 'react';
import { useCart } from './useCart';
import { CartItem } from '../types/cart';

interface CartPageProps {
  onNavigateToCatalog: () => void;
  cartHook: ReturnType<typeof useCart>;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigateToCatalog, cartHook }) => {
  const { cart, removeItem, updateQuantity, clearCart } = cartHook;

  const handleQuantityChange = (productId: string, newQuantity: number) => {
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cart.error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {cart.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white text-black border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button 
              onClick={onNavigateToCatalog}
              className="text-lg sm:text-xl md:text-2xl font-light tracking-widest hover:opacity-70 transition-opacity">
              ITSME.FASHION
            </button>

            {/* Right Menu */}
            <div className="flex items-center space-x-3 sm:space-x-6 md:space-x-8">
              <a href="#" className="hidden sm:block text-xs sm:text-sm font-light hover:opacity-70 transition-opacity">Account</a>
              <button className="hidden sm:block text-xs sm:text-sm font-light hover:opacity-70 transition-opacity">Logout</button>
              <button 
                onClick={onNavigateToCatalog}
                className="flex items-center space-x-1 sm:space-x-2 hover:opacity-70 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="sm:w-[22px] sm:h-[22px]">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span className="text-xs sm:text-sm font-light">Continue Shopping</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12 max-w-7xl">
          {/* Breadcrumb */}
          <nav className="mb-6 sm:mb-8 text-xs uppercase tracking-wider">
            <ol className="flex items-center space-x-3 text-gray-400">
              <li><button onClick={onNavigateToCatalog} className="hover:text-black transition-colors">Home</button></li>
              <li><span>/</span></li>
              <li className="text-black">Shopping Cart</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-8 sm:mb-12 pb-6 sm:pb-8 border-b border-gray-200">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wider mb-2 sm:mb-3">Shopping Cart</h1>
            <p className="text-xs sm:text-sm text-gray-500 font-light">
              {cart.itemCount === 0
                ? 'Your cart is empty'
                : `${cart.itemCount} ${cart.itemCount === 1 ? 'item' : 'items'} in your cart`}
            </p>
          </div>

          {cart.items.length === 0 ? (
            <EmptyCart onNavigateToCatalog={onNavigateToCatalog} />
          ) : (
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 xl:gap-12">
              {/* Cart Items */}
              <div className="lg:col-span-8">
                <div className="space-y-4 sm:space-y-6 border-b border-gray-200 pb-6 sm:pb-8">
                  {cart.items.map((item) => (
                    <CartItemRow
                      key={item.productId}
                      item={item}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </div>
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6">
                  <button
                    onClick={handleClearCart}
                    className="text-xs sm:text-sm text-red-600 hover:text-red-800 font-light transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-4 mt-8 lg:mt-0">
                <CartSummary subtotal={cart.subtotal} items={cart.items} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white mt-12 sm:mt-24">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16 max-w-7xl">
          {/* Footer Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 mb-8 sm:mb-16 pb-8 sm:pb-16 border-b border-gray-800">
            {/* Shop */}
            <div>
              <h3 className="text-xs uppercase tracking-widest mb-6 font-light">Shop</h3>
              <ul className="space-y-3 text-sm font-light text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">New Arrivals</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Best Sellers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Eyes</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Lips</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Face</a></li>
              </ul>
            </div>

            {/* Help */}
            <div>
              <h4 className="text-xs uppercase tracking-widest mb-6 font-light">Help</h4>
              <ul className="space-y-3 text-sm font-light text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Customer Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Track Order</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* About */}
            <div>
              <h4 className="text-xs uppercase tracking-widest mb-6 font-light">About</h4>
              <ul className="space-y-3 text-sm font-light text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Our Story</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sustainability</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>

            {/* Follow */}
            <div>
              <h4 className="text-xs uppercase tracking-widest mb-6 font-light">Follow</h4>
              <ul className="space-y-3 text-sm font-light text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center text-xs font-light text-gray-400">
            <div className="mb-4 md:mb-0">
              <a href="/" className="text-base tracking-widest text-white hover:opacity-70 transition-opacity">ITSME.FASHION</a>
            </div>
            <div className="flex space-x-8">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <span>© 2026 All rights reserved</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface EmptyCartProps {
  onNavigateToCatalog: () => void;
}

const EmptyCart: React.FC<EmptyCartProps> = ({ onNavigateToCatalog }) => (
  <div className="border border-gray-200 p-8 sm:p-12 text-center">
    <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 mb-4 sm:mb-6">
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
    <h3 className="text-lg sm:text-xl font-light text-gray-900 mb-2">Your cart is empty</h3>
    <p className="text-xs sm:text-sm text-gray-500 font-light mb-4 sm:mb-6">Start adding products to your cart.</p>
    <button
      onClick={onNavigateToCatalog}
      className="inline-block px-6 sm:px-8 py-2 sm:py-3 bg-black text-white text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors font-light"
    >
      Continue Shopping
    </button>
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
    <div className="flex py-4 sm:py-6 border-t border-gray-200">
      {/* Product Image */}
      <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 border border-gray-200 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-300"
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
      <div className="ml-4 sm:ml-6 flex-1 flex flex-col">
        <div className="flex justify-between">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Product</p>
            <h3 className="text-xs sm:text-sm font-light text-gray-900">{item.name}</h3>
            {item.shade && (
              <p className="mt-1 text-xs text-gray-500 font-light">Shade: {item.shade}</p>
            )}
            {!item.inStock && (
              <p className="mt-1 text-xs text-red-600 font-light">⚠️ Out of Stock</p>
            )}
          </div>
          <div className="ml-4 text-right">
            <p className="text-xs sm:text-sm font-light text-gray-900">₹{totalPrice.toFixed(2)}</p>
            <p className="text-xs text-gray-500 font-light">₹{item.price.toFixed(2)} each</p>
          </div>
        </div>

        <div className="flex-1 flex items-end justify-between mt-3 sm:mt-4">
          {/* Quantity Controls */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => onQuantityChange(item.productId, item.quantity - 1)}
              className="w-7 h-7 sm:w-8 sm:h-8 border border-gray-200 flex items-center justify-center hover:border-black transition-colors text-xs sm:text-sm font-light"
              disabled={item.quantity <= 1}
            >
              −
            </button>
            <span className="text-xs sm:text-sm font-light text-gray-900 w-6 sm:w-8 text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
              className="w-7 h-7 sm:w-8 sm:h-8 border border-gray-200 flex items-center justify-center hover:border-black transition-colors text-xs sm:text-sm font-light"
              disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
            >
              +
            </button>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(item.productId)}
            className="text-xs text-gray-400 hover:text-black font-light transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

interface CartSummaryProps {
  subtotal: number;
  items: CartItem[];
}

const CartSummary: React.FC<CartSummaryProps> = ({ subtotal, items }) => {
  const hasOutOfStockItems = useMemo(
    () => items.some(item => !item.inStock),
    [items]
  );
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  return (
    <div className="border border-gray-200 p-6 sm:p-8">
      <h2 className="text-xs sm:text-sm uppercase tracking-widest mb-6 sm:mb-8 font-light">Order Summary</h2>
      
      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-200">
        <div className="flex justify-between text-xs sm:text-sm font-light">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm font-light">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-500">Calculated at checkout</span>
        </div>
        <div className="flex justify-between text-sm font-light">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-500">Calculated at checkout</span>
        </div>
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between">
            <span className="text-sm uppercase tracking-widest font-light">Total</span>
            <span className="text-sm uppercase tracking-widest font-light">
              ₹{total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {hasOutOfStockItems && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200">
          <p className="text-xs text-red-800 font-light">
            Some items in your cart are out of stock. Please remove them to proceed.
          </p>
        </div>
      )}

      <button
        disabled={hasOutOfStockItems}
        className="w-full bg-black text-white py-2.5 sm:py-3 px-4 hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-light text-xs sm:text-sm uppercase tracking-wider"
      >
        Proceed to Checkout
      </button>

      <p className="mt-4 sm:mt-6 text-xs text-gray-500 font-light text-center">
        Your cart is saved locally and will persist for 30 days
      </p>
    </div>
  );
};

export default CartPage;
