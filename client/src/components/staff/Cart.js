// src/components/staff/Cart.js
import React, { useCallback } from 'react';
import CartScanner from './CartScanner';
import ErrorBoundary from '../ErrorBoundary';
import './Cart.css';

const Cart = ({ cart, addItemToCart, onUpdateQuantity, onRemoveItem, onClearCart, totals }) => {

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  // Handle QR scan - stable reference to prevent CartScanner remounts
  const handleScan = useCallback(async (scannedData) => {
  if (!scannedData) return;

  console.log("SCANNED:", scannedData); // DEBUG

  try {
    const res = await fetch(`/api/products/qr/${encodeURIComponent(scannedData)}`);

    if (!res.ok) {
      alert("Product not found for scanned QR");
      return;
    }

    const data = await res.json();

    const productExists = cart.some(item => item.id === data.product.id);

    if (productExists) {
      alert(`${data.product.name} already in cart`);
      return;
    }

    addItemToCart(data.product, 1);

  } catch (err) {
    console.error("Scan error:", err);
  }
}, [cart, addItemToCart]);
  const handleQuantityChange = (productId, newQty) => {
    if (newQty === '' || newQty < 1) return;
    onUpdateQuantity(productId, parseInt(newQty));
  };

  const handleRemoveItem = (productId) => {
    if (window.confirm('Remove this item from cart?')) {
      onRemoveItem(productId);
    }
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('Clear all items from cart?')) {
      onClearCart();
    }
  };

  return (
    <div className="cart-container">
      {/* QR Scanner */}
      <div className="qr-scanner">
        <h3>Scan Product QR</h3>
        <ErrorBoundary>
          <CartScanner onScan={handleScan} />
        </ErrorBoundary>
      </div>

      {/* Cart Header */}
      <div className="cart-header">
        <h2>Shopping Cart</h2>
        {cart.length > 0 && (
          <button onClick={handleClearCart} className="btn btn-outline btn-sm">
            Clear All
          </button>
        )}
      </div>

      {/* Cart Items */}
      <div className="cart-items">
        {cart.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h3>Cart is empty</h3>
            <p>Add products to start billing</p>
          </div>
        ) : (
          <>
            <div className="cart-list">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-info">
                    <h4 className="item-name">{item.name}</h4>
                    <p className="item-category">{item.category}</p>
                    <p className="item-price">{formatCurrency(item.price)}</p>
                  </div>

                  <div className="item-controls">
                    <div className="quantity-controls">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="quantity-btn"
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        className="quantity-input"
                        min="1"
                        max={item.stock}
                      />
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="quantity-btn"
                        disabled={item.quantity >= item.stock}
                      >
                        +
                      </button>
                    </div>

                    <div className="item-total">
                      <span className="total-label">Total:</span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="remove-btn"
                      title="Remove item"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>GST Amount:</span>
                <span>{formatCurrency(totals.gstAmount)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="summary-row discount">
                  <span>Discount:</span>
                  <span>−{formatCurrency(totals.discountAmount)}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total Amount:</span>
                <span>{formatCurrency(totals.totalAmount)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;