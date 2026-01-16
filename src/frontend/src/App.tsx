import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaymentPage from './payment/PaymentPage';
import OrderPlaced from './pages/OrderPlaced';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div>
            <h1>Welcome to ItsMe Fashion</h1>
            <p>E-commerce MVP Frontend</p>
          </div>
        } />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/order-placed" element={<OrderPlaced />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;