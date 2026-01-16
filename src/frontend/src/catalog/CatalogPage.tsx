import React, { useState, useMemo } from 'react';
import { products } from './productData';
import './CatalogPage.css';
import { useCart } from '../cart/useCart';
import { useLoveList } from '../loveList/useLoveList';

interface CatalogPageProps {
  onNavigateToCart: () => void;
  onNavigateToLoveList?: () => void;
  cartHook: ReturnType<typeof useCart>;
  loveListCount?: number;
}

const CatalogPage: React.FC<CatalogPageProps> = ({ onNavigateToCart, onNavigateToLoveList, cartHook, loveListCount = 0 }) => {
  const { addItem, updateQuantity, removeItem, cart } = cartHook;
  const { addItem: addToLoveList, removeItem: removeFromLoveList, isInLoveList, loveList } = useLoveList();
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  // Map of product IDs to their quantities in cart
  const cartQuantities = useMemo(() => {
    const map: Record<string, number> = {};
    cart.items.forEach(item => {
      map[item.productId] = item.quantity;
    });
    return map;
  }, [cart.items]);

  const handleAddToCart = (product: typeof products[0]) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.image,
      quantity: 1,
      inStock: true
    });
    setExpandedProductId(product.id);
  };

  const handleDecrement = (productId: string) => {
    const currentQty = cartQuantities[productId] || 1;
    if (currentQty > 1) {
      updateQuantity(productId, currentQty - 1);
    } else {
      removeItem(productId);
      setExpandedProductId(null);
    }
  };

  const handleIncrement = (productId: string) => {
    const currentQty = cartQuantities[productId] || 1;
    updateQuantity(productId, currentQty + 1);
  };

  const handleToggleLoveList = (product: typeof products[0]) => {
    if (isInLoveList(product.id)) {
      removeFromLoveList(product.id);
    } else {
      addToLoveList({
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.image,
      });
    }
  };

  const computedLoveListCount = loveList.items.length;
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white text-black border-b border-gray-200 sticky top-0 z-50">
        {/* Top Header */}
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/" className="text-lg sm:text-xl md:text-2xl font-light tracking-widest hover:opacity-70 transition-opacity">
                ITSME.FASHION
              </a>
            </div>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-6 lg:mx-12">
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-6 py-2.5 bg-gray-50 text-black border border-gray-200 focus:outline-none focus:border-black text-sm transition-colors"
                  placeholder="Search for products..."
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:opacity-70 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* Right Menu */}
            <div className="flex items-center space-x-3 sm:space-x-6 md:space-x-8">
              <a href="#" className="hidden sm:block text-xs sm:text-sm font-light hover:opacity-70 transition-opacity">Account</a>
              <button className="hidden sm:block text-xs sm:text-sm font-light hover:opacity-70 transition-opacity">Logout</button>
              {onNavigateToLoveList && (
                <button onClick={onNavigateToLoveList} className="hover:opacity-70 transition-opacity relative cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="sm:w-[22px] sm:h-[22px]">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  {loveListCount > 0 && (
                    <span className="absolute top-0 right-0 bg-black text-white text-xs font-light rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center transform translate-x-1 -translate-y-1">
                      {loveListCount}
                    </span>
                  )}
                </button>
              )}
              <button onClick={onNavigateToCart} className="hover:opacity-70 transition-opacity relative cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="sm:w-[22px] sm:h-[22px]">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {cart.itemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-black text-white text-xs font-light rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center transform translate-x-1 -translate-y-1">
                    {cart.itemCount}
                  </span>
                )}
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
            <ol className="flex items-center space-x-2 sm:space-x-3 text-gray-400">
              <li><a href="#" className="hover:text-black transition-colors">Home</a></li>
              <li><span>/</span></li>
              <li><a href="#" className="hover:text-black transition-colors">Shop</a></li>
              <li><span>/</span></li>
              <li className="text-black">All Products</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-8 sm:mb-12 pb-6 sm:pb-8 border-b border-gray-200">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wider mb-2 sm:mb-3">New Collection</h1>
            <p className="text-xs sm:text-sm text-gray-500 font-light">{products.length} Products</p>
          </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {products.map((product) => (
            <div key={product.id} className="group cursor-pointer">
              {/* Product Image */}
              <div className="aspect-square w-full mb-3 sm:mb-4 overflow-hidden bg-gray-50 border border-gray-200">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:opacity-75 transition-opacity duration-300"
                />
              </div>

              {/* Product Info */}
              <div className="space-y-1 sm:space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">{product.category}</p>
                    <h3 className="text-xs sm:text-sm font-light leading-tight mb-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-light">{product.shadeName}</p>
                  </div>
                  <button 
                    onClick={() => handleToggleLoveList(product)}
                    className="ml-2 p-1 hover:opacity-70 transition-opacity"
                  >
                    {isInLoveList(product.id) ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    )}
                  </button>
                </div>
                
                {/* Price */}
                <div className="flex items-center justify-between pt-1 sm:pt-2">
                  <span className="text-xs sm:text-sm font-light">₹{product.price}</span>
                  {expandedProductId === product.id ? (
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <button
                        onClick={() => handleDecrement(product.id)}
                        className="w-7 h-7 sm:w-8 sm:h-8 border border-gray-400 text-black hover:bg-gray-200 transition-colors cursor-pointer font-light text-xs sm:text-sm flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-light">
                        {cartQuantities[product.id] || 1}
                      </span>
                      <button
                        onClick={() => handleIncrement(product.id)}
                        className="w-7 h-7 sm:w-8 sm:h-8 border border-gray-400 text-black hover:bg-gray-200 transition-colors cursor-pointer font-light text-xs sm:text-sm flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="px-4 sm:px-6 py-1.5 sm:py-2 bg-black text-white text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors font-light cursor-pointer">
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white mt-12 sm:mt-24">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16 max-w-7xl">
          {/* Footer Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 mb-8 sm:mb-16 pb-8 sm:pb-16 border-b border-gray-800">
            {/* Shop */}
            <div>
              <h3 className="text-xs uppercase tracking-widest mb-6 font-light">
                Shop
              </h3>
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

export default CatalogPage;
