// pages/StaffBilling.js
import React, { useState } from 'react';
import Cart from './Cart';
import PaymentSection from './PaymentSection';
import ProductGrid from './ProductGrid';

const StaffBilling = () => {
  const [cart, setCart] = useState([]);

  // Add item to cart or increment quantity if exists
  const addItemToCart = (product, quantity = 1) => {
    setCart(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.map(p =>
          p.id === product.id ? { ...p, quantity: p.quantity + quantity } : p
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const updateQuantity = (productId, newQty) => {
    setCart(prev =>
      prev.map(p => (p.id === productId ? { ...p, quantity: newQty } : p))
    );
  };

  const removeItem = (productId) => {
    setCart(prev => prev.filter(p => p.id !== productId));
  };

  const clearCart = () => setCart([]);

  // Calculate totals
  const totals = cart.reduce(
    (acc, item) => {
      const itemTotal = item.price * item.quantity;
      const gstAmount = (itemTotal * (item.gst || 0)) / 100;
      acc.subtotal += itemTotal;
      acc.gstAmount += gstAmount;
      return acc;
    },
    { subtotal: 0, gstAmount: 0, discountAmount: 0, totalAmount: 0 }
  );
  totals.totalAmount = totals.subtotal + totals.gstAmount - totals.discountAmount;

  return (
    <div>
      <h1>Staff Billing</h1>
      <Cart
        cart={cart}
        addItemToCart={addItemToCart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
        totals={totals}
      />
    </div>
  );
};

export default StaffBilling;