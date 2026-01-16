import { useState } from 'react';
import CatalogPage from './catalog/CatalogPage';
import { CartPage } from './cart/CartPage';
import { LoveListPage } from './loveList/LoveListPage';
import { useCart } from './cart/useCart';
import { useLoveList } from './loveList/useLoveList';

function App() {
  const [currentPage, setCurrentPage] = useState<'catalog' | 'cart' | 'loveList'>('catalog');
  const cartHook = useCart();
  const { loveList } = useLoveList();

  return (
    <div className="App">
      {currentPage === 'catalog' ? (
        <CatalogPage 
          onNavigateToCart={() => setCurrentPage('cart')} 
          onNavigateToLoveList={() => setCurrentPage('loveList')}
          cartHook={cartHook}
        />
      ) : currentPage === 'loveList' ? (
        <LoveListPage
          onNavigateToCatalog={() => setCurrentPage('catalog')}
          onNavigateToCart={() => setCurrentPage('cart')}
        />
      ) : (
        <CartPage onNavigateToCatalog={() => setCurrentPage('catalog')} cartHook={cartHook} />
      )}
    </div>
  );
}

export default App;
