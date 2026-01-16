import { useState } from 'react';
import CatalogPage from './catalog/CatalogPage';
import { CartPage } from './cart/CartPage';
import { useCart } from './cart/useCart';

function App() {
  const [currentPage, setCurrentPage] = useState<'catalog' | 'cart'>('catalog');
  const { cart } = useCart();

  return (
    <div className="App">
      {currentPage === 'catalog' ? (
        <CatalogPage onNavigateToCart={() => setCurrentPage('cart')} cartCount={cart.itemCount} />
      ) : (
        <CartPage onNavigateToCatalog={() => setCurrentPage('catalog')} />
      )}
    </div>
  );
}

export default App;
