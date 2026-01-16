import React from "react";
import { useLoveList } from "../loveList/useLoveList";

export const LoveListPage: React.FC = () => {
  const { loveList, removeItem } = useLoveList();

  const totalValue = loveList.items.reduce((sum, item) => sum + item.price, 0);

  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white text-black border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <button
                href="/"
                className="text-lg sm:text-xl md:text-2xl font-light tracking-widest hover:opacity-70 transition-opacity"
              >
                ITSME.FASHION
              </button>
            </div>

            {/* Right Menu */}
            <div className="flex items-center space-x-3 sm:space-x-6 md:space-x-8">
              <a href="#" className="hidden sm:block text-xs sm:text-sm font-light hover:opacity-70 transition-opacity">
                Account
              </a>
              <button
                href="/"
                className="text-xs sm:text-sm font-light hover:opacity-70 transition-opacity"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="mb-6 sm:mb-8 text-xs uppercase tracking-wider">
            <ol className="flex items-center space-x-2 sm:space-x-3 text-gray-400">
              <li>
                <button
                  href="/"
                  className="hover:text-black transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <span>/</span>
              </li>
              <li className="text-black">My Love List</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-8 sm:mb-12 pb-6 sm:pb-8 border-b border-gray-200">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wider mb-2 sm:mb-3">
              My Love List
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-light">
              {loveList.items.length} {loveList.items.length === 1 ? "item" : "items"}
            </p>
          </div>

          {loveList.items.length === 0 ? (
            <div className="text-center py-12 sm:py-24">
              <div className="mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="mx-auto text-gray-400"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <p className="text-sm text-gray-500 font-light mb-6">
                Your love list is empty
              </p>
              <button
                href="/"
                className="px-8 py-2.5 bg-black text-white text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors font-light"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Love List Items */}
              <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
                {loveList.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-gray-200 last:border-b-0"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-20 sm:w-24 aspect-square">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover border border-gray-200"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm sm:text-base font-light mb-1">
                          {item.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 font-light">
                          ₹{item.price}
                        </p>
                      </div>

                      <div className="flex gap-2 sm:gap-3">
                        <button
                          onClick={() => handleRemoveItem(item.productId)}
                          className="px-4 py-1.5 text-xs uppercase tracking-wider border border-gray-400 text-gray-700 hover:bg-gray-100 transition-colors font-light"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-gray-50 border border-gray-200 p-6 sm:p-8">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                  <span className="text-sm font-light text-gray-600">
                    Total Value:
                  </span>
                  <span className="text-lg sm:text-xl font-light">
                    ₹{totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-light">
                  Items in your love list are reserved for 30 days
                </p>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white mt-12 sm:mt-24">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
          <p className="text-xs text-gray-400 font-light text-center">
            © 2025 itsme.fashion. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
