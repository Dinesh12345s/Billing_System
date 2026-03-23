import React from 'react';
import './CustomerInfo.css';

const CustomerInfo = ({ customerInfo, setCustomerInfo }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="customer-info-container">
      <div className="customer-info-header">
        <h2>Customer Information</h2>
        <span className="optional-text">(Optional)</span>
      </div>
      
      <div className="customer-form">
        <div className="form-group">
          <label htmlFor="name">Customer Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={customerInfo.name}
            onChange={handleChange}
            className="input"
            placeholder="Enter customer name"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={customerInfo.phone}
            onChange={handleChange}
            className="input"
            placeholder="Enter phone number"
            pattern="[0-9]{10}"
            maxLength="10"
          />
        </div>
      </div>
      
      <div className="info-note">
        <span className="note-icon">ℹ️</span>
        <p>
          Customer information is optional. If not provided, "Walk-in Customer" will be used.
        </p>
      </div>
    </div>
  );
};

export default CustomerInfo;
