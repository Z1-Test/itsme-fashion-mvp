import React from 'react';
import styles from './OrdersSection.module.css';

interface Order {
  id: string;
  date: string;
  items: string;
  total: string;
  status: string;
}

interface OrdersSectionProps {
  orders: Order[];
}

const OrdersSection: React.FC<OrdersSectionProps> = ({ orders }) => {
  return (
    <div className={styles.ordersContainer}>
      <h3 className={styles.title}>Your Orders</h3>
      {orders.length === 0 ? (
        <div className={styles.empty}>No orders found.</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.date}</td>
                <td>{order.items}</td>
                <td>{order.total}</td>
                <td>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrdersSection;
