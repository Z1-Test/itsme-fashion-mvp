import PaymentPage from './payment/PaymentPage';
import OrderPlaced from './pages/OrderPlaced';
import ProfilePage from './pages/ProfilePage';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import CatalogPage from './catalog/CatalogPage';
import { CartPage } from './cart/CartPage';
import { LoveListPage } from './loveList/LoveListPage';
import { useCart } from './cart/useCart';
import { useLoveList } from './loveList/useLoveList';
import { useState } from 'react';

function App() {
  const [currentPage, setCurrentPage] = useState<'catalog' | 'cart' | 'loveList'>('catalog');
  const cartHook = useCart();
  const { loveList } = useLoveList();

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected Routes */}
          <Route
            path="/catalog"
            element={
              <ProtectedRoute>
                <CatalogPage 
                  onNavigateToCart={() => {}} 
                  onNavigateToLoveList={() => {}}
                  cartHook={useCart()}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage onNavigateToCatalog={() => {}} cartHook={useCart()} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lovelist"
            element={
              <ProtectedRoute>
                <LoveListPage
                  onNavigateToCatalog={() => {}}
                  onNavigateToCart={() => {}}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <CatalogPage 
                  onNavigateToCart={() => {}} 
                  onNavigateToLoveList={() => {}}
                  cartHook={useCart()}
                />
              </ProtectedRoute>
            }
          />

          {/* Redirect any unknown routes to signin */}
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
