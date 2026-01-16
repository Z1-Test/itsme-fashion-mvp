import React, { useState } from 'react';
import OrdersSection from '../components/common/OrdersSection';

const initialProfile = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  phone: '123-456-7890',
  address: '123 Main St, City',
};

const initialOrders = [
  { id: '1001', date: '2026-01-10', items: 'T-shirt, Jeans', total: '$59.99', status: 'Delivered' },
  { id: '1002', date: '2026-01-12', items: 'Sneakers', total: '$89.99', status: 'Shipped' },
];

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState(initialProfile);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(profile);

  const handleEdit = () => setEdit(true);
  const handleCancel = () => { setEdit(false); setForm(profile); };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSave = () => { setProfile(form); setEdit(false); };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'center',marginTop:'2rem'}}>
        <div style={{background:'#fff',border:'1px solid #000',borderRadius:'12px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',padding:'2rem 2.5rem',minWidth:'340px',maxWidth:'400px',width:'100%'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem'}}>
            <div style={{display:'flex',alignItems:'center',gap:'1.2rem'}}>
              <div style={{width:'56px',height:'56px',borderRadius:'50%',background:'#000',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',fontWeight:700}}>
                {form.name.charAt(0).toUpperCase()}
              </div>
              {edit ? (
                <input name="name" value={form.name} onChange={handleChange} style={{fontSize:'1.2rem',fontWeight:600,color:'#000',border:'1px solid #000',borderRadius:'6px',padding:'0.2rem 0.7rem',background:'#fff'}} />
              ) : (
                <span style={{fontSize:'1.2rem',fontWeight:600,color:'#000'}}>{profile.name}</span>
              )}
            </div>
            {!edit && (
              <button onClick={handleEdit} style={{padding:'0.4rem 1.1rem',border:'1px solid #000',borderRadius:'6px',background:'#fff',fontWeight:600,cursor:'pointer'}}>Edit</button>
            )}
          </div>
          <div style={{marginBottom:'1.1rem'}}>
            <div style={{fontSize:'1.05rem',color:'#222',marginBottom:'0.5rem'}}><strong>Email:</strong> {profile.email}</div>
            {edit ? (
              <div style={{marginBottom:'0.5rem'}}>
                <strong>Phone:</strong> <input name="phone" value={form.phone} onChange={handleChange} style={{border:'1px solid #000',borderRadius:'6px',padding:'0.15rem 0.6rem',background:'#fff'}} />
              </div>
            ) : (
              <div style={{fontSize:'1.05rem',color:'#222',marginBottom:'0.5rem'}}><strong>Phone:</strong> {profile.phone}</div>
            )}
            {edit ? (
              <div style={{marginBottom:'0.5rem'}}>
                <strong>Address:</strong> <input name="address" value={form.address} onChange={handleChange} style={{border:'1px solid #000',borderRadius:'6px',padding:'0.15rem 0.6rem',background:'#fff'}} />
              </div>
            ) : (
              <div style={{fontSize:'1.05rem',color:'#222',marginBottom:'0.5rem'}}><strong>Address:</strong> {profile.address}</div>
            )}
          </div>
          {edit && (
            <div style={{marginTop:'1rem',display:'flex',gap:'1rem',justifyContent:'flex-end'}}>
              <button onClick={handleSave} style={{padding:'0.4rem 1.1rem',border:'1px solid #000',borderRadius:'6px',background:'#fff',fontWeight:600,cursor:'pointer'}}>Save</button>
              <button onClick={handleCancel} style={{padding:'0.4rem 1.1rem',border:'1px solid #000',borderRadius:'6px',background:'#fff',fontWeight:600,cursor:'pointer'}}>Cancel</button>
            </div>
          )}
        </div>
      </div>
      <div style={{display:'flex',justifyContent:'center'}}>
        <OrdersSection orders={initialOrders} />
      </div>
    </div>
  );
};

export default ProfilePage;
