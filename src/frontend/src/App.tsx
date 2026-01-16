
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaymentPage from './payment/PaymentPage';

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
      </Routes>
    </Router>
  );
}

export default App;