import React, { useEffect } from 'react';
import styles from './OrderPlaced.module.css';

const OrderPlaced: React.FC = () => {
  useEffect(() => {
    // Optionally, play sound or trigger animation here
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.firecrackerLeft} />
      <div className={styles.firecrackerRight} />
      <div className={styles.content}>
        <h1 className={styles.title}>Order Placed!</h1>
        <p className={styles.subtitle}>Your order has been successfully placed. Thank you!</p>
      </div>
    </div>
  );
};

export default OrderPlaced;
