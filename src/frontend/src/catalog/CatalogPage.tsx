import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './CatalogPage.css';

interface Product {
  id: string;
  productId: string;
  name: string;
  category: string;
  price: number;
  shadeName?: string;
  shadeCode?: string;
  hexCode?: string;
  image: string;
  stock: number;
  productCode?: string;
  sku?: string;
  quantity?: string;
  tagline?: string;
  shortDescription?: string;
  description?: string;
  keyBenefits?: string;
  ingredients?: string;
  howToUse?: string;
  caution?: string;
  shippingAndDelivery?: string;
  productLink?: string;
}


// Icons as basic SVG functional components to avoid dependencies
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const ShoppingCartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const CatalogPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsCollection = collection(db, 'products');
        const productsSnapshot = await getDocs(productsCollection);
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        console.log(`Fetched ${productsData.length} products from Firestore`);
        console.log('Products:', productsData);
        setProducts(productsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
          <p className="text-sm text-gray-500 font-light tracking-wider">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-500 font-light tracking-wider">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white text-black border-b border-gray-200 sticky top-0 z-50">
        {/* Top Header */}
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/" className="text-2xl font-light tracking-widest hover:opacity-70 transition-opacity">
                ITSME.FASHION
              </a>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-12">
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
            <div className="flex items-center space-x-8">
              <a href="#" className="text-sm font-light hover:opacity-70 transition-opacity">Account</a>
              <button className="text-sm font-light hover:opacity-70 transition-opacity">Logout</button>
              <a href="#" className="flex items-center space-x-2 hover:opacity-70 transition-opacity relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span className="text-sm font-light">Cart</span>
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-light rounded-full w-5 h-5 flex items-center justify-center">2</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-white">
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          {/* Breadcrumb */}
          <nav className="mb-8 text-xs uppercase tracking-wider">
            <ol className="flex items-center space-x-3 text-gray-400">
              <li><a href="#" className="hover:text-black transition-colors">Home</a></li>
              <li><span>/</span></li>
              <li><a href="#" className="hover:text-black transition-colors">Shop</a></li>
              <li><span>/</span></li>
              <li className="text-black">All Products</li>
            </ol>
          </nav>

          {/* Header */}
          <div className="mb-12 pb-8 border-b border-gray-200">
            <h1 className="text-4xl font-light tracking-wider mb-3">New Collection</h1>
            <p className="text-sm text-gray-500 font-light">{products.length} Products</p>
          </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group cursor-pointer" onClick={() => setSelectedProduct(product)}>
              {/* Product Image */}
              <div className="aspect-square w-full mb-4 overflow-hidden bg-gray-50 border border-gray-200">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:opacity-75 transition-opacity duration-300"
                />
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">{product.category}</p>
                    <h3 className="text-sm font-light leading-tight mb-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-light">{product.shadeName}</p>
                  </div>
                  <button className="ml-2 p-1 hover:opacity-70 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>
                
                {/* Price */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-light">₹{product.price}</span>
                  <button 
                    className="px-6 py-2 bg-black text-white text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors font-light"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white mt-24">
        <div className="container mx-auto px-6 py-16 max-w-7xl">
          {/* Footer Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16 pb-16 border-b border-gray-800">
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

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-0 md:p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className="bg-white w-full h-full md:h-auto md:max-w-7xl md:max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedProduct(null)}
              className="fixed md:absolute top-4 right-4 z-20 text-gray-400 hover:text-black transition-colors bg-white p-2 rounded-full shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
              {/* Product Image Section - Left Column */}
              <div className="lg:col-span-3 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200">
                <div className="sticky top-0">
                  <div className="aspect-square lg:min-h-[600px] flex items-center justify-center p-8 lg:p-12">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Product Details Section - Right Column */}
              <div className="lg:col-span-2 overflow-y-auto">
                <div className="px-6 py-8 lg:px-8 lg:py-12 space-y-6">
                  {/* Header Info */}
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">{selectedProduct.category}</p>
                    <h1 className="text-2xl lg:text-3xl font-light tracking-wide mb-2 leading-tight pr-8">{selectedProduct.name}</h1>
                    {selectedProduct.shadeName && (
                      <p className="text-base text-gray-500 font-light mb-4">{selectedProduct.shadeName}</p>
                    )}
                    <p className="text-3xl font-light mt-4">₹{selectedProduct.price?.toLocaleString()}</p>
                  </div>

                  {/* Stock Status */}
                  <div className="py-4 border-y border-gray-200">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-light">
                        {selectedProduct.stock > 0 ? (
                          <span className="text-green-600 flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            In Stock
                          </span>
                        ) : (
                          <span className="text-red-600">Out of Stock</span>
                        )}
                      </p>
                      {selectedProduct.stock > 0 && selectedProduct.stock <= 10 && (
                        <p className="text-xs text-orange-600 font-light">Only {selectedProduct.stock} left</p>
                      )}
                    </div>
                    {selectedProduct.quantity && (
                      <p className="text-xs text-gray-500 font-light mt-2">Quantity: {selectedProduct.quantity}</p>
                    )}
                  </div>

                  {/* Add to Cart Section */}
                  <div className="flex space-x-3">
                    <button 
                      className="flex-1 px-6 py-3 bg-black text-white text-xs uppercase tracking-wider hover:bg-gray-800 transition-colors font-light disabled:bg-gray-300 disabled:cursor-not-allowed"
                      disabled={selectedProduct.stock === 0}
                    >
                      {selectedProduct.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <button className="p-3 border border-gray-200 hover:border-black transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>
                  </div>

                  {/* Tagline */}
                  {selectedProduct.tagline && (
                    <div className="bg-gray-50 p-4 border-l-2 border-black">
                      <p className="text-sm font-light italic leading-relaxed">"{selectedProduct.tagline}"</p>
                    </div>
                  )}

                  {/* Short Description */}
                  {selectedProduct.shortDescription && (
                    <div>
                      <p className="text-sm font-light text-gray-700 leading-relaxed">{selectedProduct.shortDescription}</p>
                    </div>
                  )}

                  {/* Product Details Grid */}
                  {(selectedProduct.productCode || selectedProduct.sku || selectedProduct.shadeCode || selectedProduct.hexCode) && (
                    <div className="grid grid-cols-2 gap-4 text-sm border-t border-gray-200 pt-6">
                      {selectedProduct.hexCode && (
                        <div className="col-span-2">
                          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Color</p>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-8 h-8 border border-gray-300 rounded shadow-sm"
                              style={{ backgroundColor: selectedProduct.hexCode }}
                            ></div>
                            <p className="font-light text-xs text-gray-700">{selectedProduct.hexCode}</p>
                          </div>
                        </div>
                      )}
                      {selectedProduct.productCode && (
                        <div>
                          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Product Code</p>
                          <p className="font-light text-gray-700 text-xs">{selectedProduct.productCode}</p>
                        </div>
                      )}
                      {selectedProduct.sku && (
                        <div>
                          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">SKU</p>
                          <p className="font-light text-gray-700 text-xs">{selectedProduct.sku}</p>
                        </div>
                      )}
                      {selectedProduct.shadeCode && (
                        <div className="col-span-2">
                          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Shade Code</p>
                          <p className="font-light text-gray-700 text-xs">{selectedProduct.shadeCode}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Full Description */}
                  {selectedProduct.description && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-xs uppercase tracking-widest mb-3 font-light">Description</h3>
                      <p className="text-sm font-light text-gray-700 leading-relaxed whitespace-pre-line">{selectedProduct.description}</p>
                    </div>
                  )}

                  {/* Key Benefits */}
                  {selectedProduct.keyBenefits && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-xs uppercase tracking-widest mb-3 font-light">Key Benefits</h3>
                      <div className="text-sm font-light text-gray-700 leading-relaxed whitespace-pre-line">
                        {selectedProduct.keyBenefits}
                      </div>
                    </div>
                  )}

                  {/* How to Use */}
                  {selectedProduct.howToUse && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-xs uppercase tracking-widest mb-3 font-light">How to Use</h3>
                      <p className="text-sm font-light text-gray-700 leading-relaxed">{selectedProduct.howToUse}</p>
                    </div>
                  )}

                  {/* Ingredients */}
                  {selectedProduct.ingredients && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-xs uppercase tracking-widest mb-3 font-light">Ingredients</h3>
                      <p className="text-xs font-light text-gray-700 leading-relaxed">{selectedProduct.ingredients}</p>
                    </div>
                  )}

                  {/* Caution */}
                  {selectedProduct.caution && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <h3 className="text-xs uppercase tracking-widest mb-1 font-light text-yellow-800">Caution</h3>
                          <p className="text-xs font-light text-yellow-700 leading-relaxed">{selectedProduct.caution}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shipping Info */}
                  {selectedProduct.shippingAndDelivery && (
                    <div className="border-t border-gray-200 pt-6 pb-8">
                      <h3 className="text-xs uppercase tracking-widest mb-3 font-light">Shipping & Delivery</h3>
                      <p className="text-xs font-light text-gray-700 leading-relaxed">{selectedProduct.shippingAndDelivery}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
