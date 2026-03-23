import React from 'react';
import './PaymentSection.css';

const PaymentSection = ({ 
  discount, 
  setDiscount, 
  paymentMethod, 
  setPaymentMethod, 
  totals, 
  onPayment, 
  processingPayment,
  disabled 
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handleDiscountChange = (type, value) => {
    setDiscount({ type, value: parseFloat(value) || 0 });
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleQuickDiscount = (type, value) => {
    handleDiscountChange(type, value);
  };

  return (
    <div className="payment-section">
      <div className="payment-header">
        <h2>Payment</h2>
      </div>

      <div className="payment-content">
        {/* Discount Section */}
        <div className="discount-section">
          <h3>Discount Options</h3>
          
          <div className="discount-types">
            <label className="discount-option">
              <input
                type="radio"
                name="discount-type"
                checked={discount.type === 'none'}
                onChange={() => handleDiscountChange('none', 0)}
              />
              <span>No Discount</span>
            </label>
            
            <label className="discount-option">
              <input
                type="radio"
                name="discount-type"
                checked={discount.type === 'percentage'}
                onChange={() => handleDiscountChange('percentage', 5)}
              />
              <span>Percentage (%)</span>
            </label>
            
            <label className="discount-option">
              <input
                type="radio"
                name="discount-type"
                checked={discount.type === 'flat'}
                onChange={() => handleDiscountChange('flat', 100)}
              />
              <span>Flat Amount (₹)</span>
            </label>
          </div>

          {discount.type !== 'none' && (
            <div className="discount-input-group">
              <label>
                {discount.type === 'percentage' ? 'Discount %' : 'Discount Amount (₹)'}
              </label>
              <input
                type="number"
                value={discount.value}
                onChange={(e) => handleDiscountChange(discount.type, e.target.value)}
                min={discount.type === 'percentage' ? 0 : 0}
                max={discount.type === 'percentage' ? 100 : totals.totalAmount}
                step={discount.type === 'percentage' ? 1 : 10}
                className="input discount-input"
              />
            </div>
          )}

          <div className="quick-discounts">
            <span className="quick-label">Quick:</span>
            <button
              onClick={() => handleQuickDiscount('percentage', 5)}
              className="quick-discount-btn"
              disabled={disabled}
            >
              5%
            </button>
            <button
              onClick={() => handleQuickDiscount('percentage', 10)}
              className="quick-discount-btn"
              disabled={disabled}
            >
              10%
            </button>
            <button
              onClick={() => handleQuickDiscount('flat', 100)}
              className="quick-discount-btn"
              disabled={disabled}
            >
              ₹100
            </button>
            <button
              onClick={() => handleQuickDiscount('flat', 500)}
              className="quick-discount-btn"
              disabled={disabled}
            >
              ₹500
            </button>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="payment-methods-section">
          <h3>Payment Method</h3>
          
          <div className="payment-methods">
            <label className="payment-method-option">
              <input
                type="radio"
                name="payment-method"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={() => handlePaymentMethodChange('cash')}
              />
              <div className="payment-method-card">
                <div className="payment-icon">💵</div>
                <div className="payment-details">
                  <span className="payment-name">Cash</span>
                  <span className="payment-desc">Pay with cash</span>
                </div>
              </div>
            </label>

            <label className="payment-method-option">
              <input
                type="radio"
                name="payment-method"
                value="gpay"
                checked={paymentMethod === 'gpay'}
                onChange={() => handlePaymentMethodChange('gpay')}
              />
              <div className="payment-method-card">
                <div className="payment-icon">📱</div>
                <div className="payment-details">
                  <span className="payment-name">GPay</span>
                  <span className="payment-desc">Google Pay UPI</span>
                </div>
              </div>
            </label>

            <label className="payment-method-option">
              <input
                type="radio"
                name="payment-method"
                value="paytm"
                checked={paymentMethod === 'paytm'}
                onChange={() => handlePaymentMethodChange('paytm')}
              />
              <div className="payment-method-card">
                <div className="payment-icon">💳</div>
                <div className="payment-details">
                  <span className="payment-name">Paytm</span>
                  <span className="payment-desc">Paytm UPI/Wallet</span>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Final Amount */}
        <div className="final-amount-section">
          <div className="final-amount">
            <span className="final-label">Total Payable:</span>
            <span className="final-value">{formatCurrency(totals.totalAmount)}</span>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={onPayment}
          className="pay-button"
          disabled={disabled || !paymentMethod || processingPayment}
        >
          {processingPayment ? (
            <>
              <div className="spinner"></div>
              Processing...
            </>
          ) : (
            <>
              <span className="pay-icon">💳</span>
              Pay Now
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentSection;
