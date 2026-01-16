import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import CatalogPage from './catalog/CatalogPage';
import { CartPage } from './cart/CartPage';
import { LoveListPage } from './loveList/LoveListPage';
import { useCart } from './cart/useCart';
import { useEffect } from 'react';

function AppRoutes() {
  const { user } = useAuth();
  const cartHook = useCart();

  // Sync cart with Firestore on user change or component mount
  useEffect(() => {
    if (user && cartHook.syncCartToFirestore) {
      cartHook.syncCartToFirestore(user.uid);
    }
  }, [user?.uid, cartHook]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><CatalogPage cartHook={cartHook} /></ProtectedRoute>} />
      <Route path="/shop" element={<ProtectedRoute><CatalogPage cartHook={cartHook} /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute><CartPage cartHook={cartHook} /></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><LoveListPage /></ProtectedRoute>} />

      {/* Redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
