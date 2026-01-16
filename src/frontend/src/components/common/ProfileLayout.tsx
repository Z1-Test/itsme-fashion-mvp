import React from 'react';
import styles from './ProfileLayout.module.css';

interface ProfileLayoutProps {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ name, email, phone, address }) => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.avatar}>
          <span>{name.charAt(0).toUpperCase()}</span>
        </div>
        <div className={styles.info}>
          <h2 className={styles.name}>{name}</h2>
          <div className={styles.detail}><strong>Email:</strong> {email}</div>
          {phone && <div className={styles.detail}><strong>Phone:</strong> {phone}</div>}
          {address && <div className={styles.detail}><strong>Address:</strong> {address}</div>}
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
