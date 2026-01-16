

import React, { useState } from 'react';
import styles from './PaymentPage.module.css';
import { useNavigate } from 'react-router-dom';

const PaymentPage: React.FC = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
      navigate('/order-placed');
    }, 500);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.title}>Payment</div>
        <form onSubmit={handleSubmit} className={styles.form} style={{alignItems:'center',width:'100%'}}>
          <div style={{marginBottom:'1.5rem',background:'#fff',border:'1px solid #000',borderRadius:'12px',padding:'1rem 1.5rem',color:'#000',width:'100%',boxSizing:'border-box',display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem',width:'100%'}}>
              <span style={{fontWeight:700,letterSpacing:'0.15em',fontSize:'1.1rem'}}>VISA</span>
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="8" cy="12" r="4" fill="#000" fillOpacity=".7"/><circle cx="16" cy="12" r="4" fill="#000" fillOpacity=".7"/></svg>
            </div>
            <div style={{fontSize:'1.2rem',letterSpacing:'0.1em',marginBottom:'0.5rem',width:'100%',textAlign:'center'}}>
              {cardNumber ? cardNumber.replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.95rem',width:'100%'}}>
              <span>{name || 'CARDHOLDER'}</span>
              <span>{expiry || 'MM/YY'}</span>
            </div>
          </div>
          <input
            type="text"
            className={styles.input}
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="Name on Card"
            style={{width:'100%'}}
          />
          <input
            type="text"
            className={styles.input}
            value={cardNumber}
            onChange={e => setCardNumber(e.target.value.replace(/[^0-9]/g, ''))}
            maxLength={16}
            required
            placeholder="Card Number"
            inputMode="numeric"
            style={{width:'100%'}}
          />
          <div style={{display:'flex',gap:'1rem',width:'100%',justifyContent:'center'}}>
            <input
              type="text"
              className={styles.input}
              placeholder="MM/YY"
              value={expiry}
              onChange={e => setExpiry(e.target.value.replace(/[^0-9/]/g, ''))}
              required
              inputMode="text"
              maxLength={5}
              style={{width:'50%'}}
            />
            <input
              type="password"
              className={styles.input}
              value={cvv}
              onChange={e => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
              maxLength={4}
              required
              placeholder="CVV"
              inputMode="numeric"
              style={{width:'50%'}}
            />
          </div>
          <button
            type="submit"
            className={styles.button}
            style={{width:'100%',marginTop:'1.2rem'}}
          >
            Pay Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
