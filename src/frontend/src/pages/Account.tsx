import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/account.css';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export const Account: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const [originalProfile, setOriginalProfile] = useState(profile);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setProfile(originalProfile);
    }
    setIsEditing(!isEditing);
  };

  const handleProfileChange = (field: keyof UserProfile) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfile((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSaveProfile = () => {
    setOriginalProfile(profile);
    setIsEditing(false);
    console.log('Profile saved:', profile);
    // TODO: Integrate with Firebase to save profile data
  };

  const mockOrders = [
    {
      id: 'ORD-001',
      date: '2026-01-15',
      total: 159.99,
      status: 'Delivered',
      items: 3,
    },
    {
      id: 'ORD-002',
      date: '2026-01-10',
      total: 89.50,
      status: 'In Transit',
      items: 2,
    },
    {
      id: 'ORD-003',
      date: '2026-01-05',
      total: 249.99,
      status: 'Processing',
      items: 5,
    },
  ];

  return (
    <div className="account-container">
      {/* Header */}
      <div className="account-header">
        <div className="account-header-content">
          <h1>My Account</h1>
          <p className="account-email">{user?.email}</p>
        </div>
        <button onClick={handleSignOut} className="btn-sign-out">
          Sign Out
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="account-tabs">
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className="account-content">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="tab-panel">
            <div className="profile-header">
              <h2>Profile Information</h2>
              <button
                className={`btn-edit ${isEditing ? 'editing' : ''}`}
                onClick={handleEditToggle}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <div className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    value={profile.firstName}
                    onChange={handleProfileChange('firstName')}
                    disabled={!isEditing}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    value={profile.lastName}
                    onChange={handleProfileChange('lastName')}
                    disabled={!isEditing}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="disabled-field"
                />
                <small>Email cannot be changed</small>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={handleProfileChange('phone')}
                  disabled={!isEditing}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Street Address</label>
                <input
                  id="address"
                  type="text"
                  value={profile.address}
                  onChange={handleProfileChange('address')}
                  disabled={!isEditing}
                  placeholder="Enter your street address"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    type="text"
                    value={profile.city}
                    onChange={handleProfileChange('city')}
                    disabled={!isEditing}
                    placeholder="Enter your city"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="postalCode">Postal Code</label>
                  <input
                    id="postalCode"
                    type="text"
                    value={profile.postalCode}
                    onChange={handleProfileChange('postalCode')}
                    disabled={!isEditing}
                    placeholder="Enter your postal code"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  id="country"
                  type="text"
                  value={profile.country}
                  onChange={handleProfileChange('country')}
                  disabled={!isEditing}
                  placeholder="Enter your country"
                />
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button className="btn-save" onClick={handleSaveProfile}>
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="tab-panel">
            <h2>Order History</h2>
            <div className="orders-list">
              {mockOrders.length > 0 ? (
                mockOrders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div className="order-id">
                        <h3>{order.id}</h3>
                        <p className="order-date">{order.date}</p>
                      </div>
                      <div className="order-status">
                        <span
                          className={`status-badge status-${order.status.toLowerCase().replace(' ', '-')}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="order-details">
                      <div className="order-info">
                        <span>{order.items} item(s)</span>
                      </div>
                      <div className="order-total">
                        <span className="label">Total:</span>
                        <span className="amount">${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                    <button className="btn-view-order">View Details</button>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No orders yet. Start shopping!</p>
                  <button
                    className="btn-shop"
                    onClick={() => navigate('/shop')}
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="tab-panel">
            <h2>Account Settings</h2>
            <div className="settings-list">
              <div className="settings-section">
                <div className="settings-item">
                  <div className="settings-info">
                    <h3>Password</h3>
                    <p>Change your account password</p>
                  </div>
                  <button className="btn-action">Change Password</button>
                </div>
              </div>

              <div className="settings-section">
                <div className="settings-item">
                  <div className="settings-info">
                    <h3>Email Notifications</h3>
                    <p>Manage your notification preferences</p>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle-checkbox" />
                </div>
              </div>

              <div className="settings-section">
                <div className="settings-item">
                  <div className="settings-info">
                    <h3>Wishlist Notifications</h3>
                    <p>Get notified about items on your wishlist</p>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle-checkbox" />
                </div>
              </div>

              <div className="settings-section danger">
                <div className="settings-item">
                  <div className="settings-info">
                    <h3>Delete Account</h3>
                    <p>Permanently delete your account and all associated data</p>
                  </div>
                  <button className="btn-danger">Delete Account</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
