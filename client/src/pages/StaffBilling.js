import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import ProductGrid from '../components/staff/ProductGrid';
import Cart from '../components/staff/Cart';
import CustomerInfo from '../components/staff/CustomerInfo';
import PaymentSection from '../components/staff/PaymentSection';
import './StaffBilling.css';

const StaffBilling = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: ''
  });
  const [discount, setDiscount] = useState({
    type: 'none', // 'none', 'percentage', 'flat'
    value: 0
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState('');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.getProducts();
      
      if (response.success) {
        // Only show products with stock > 0
        const availableProducts = response.products.filter(p => p.stock > 0);
        setProducts(availableProducts);
      } else {
        setError('Failed to load products');
      }
    } catch (error) {
      console.error('Products fetch error:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prevCart, {
        ...product,
        quantity: 1,
        subtotal: product.price
      }];
    });
  };

  const updateCartItemQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity, subtotal: item.price * quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const gstAmount = cart.reduce((sum, item) => {
      const itemSubtotal = item.price * item.quantity;
      return sum + (itemSubtotal * item.gst / 100);
    }, 0);
    
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = (subtotal + gstAmount) * (discount.value / 100);
    } else if (discount.type === 'flat') {
      discountAmount = discount.value;
    }
    
    const totalAmount = (subtotal + gstAmount) - discountAmount;
    
    return {
      subtotal,
      gstAmount,
      discountAmount,
      totalAmount
    };
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }

    const totals = calculateTotals();
    
    setProcessingPayment(true);
    setError('');

    try {
      const orderData = {
        customer_name: customerInfo.name || 'Walk-in Customer',
        phone: customerInfo.phone || '',
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          gst: item.gst,
          subtotal: item.price * item.quantity
        })),
        subtotal: totals.subtotal,
        gst_amount: totals.gstAmount,
        discount_amount: totals.discountAmount,
        total_amount: totals.totalAmount,
        payment_method: paymentMethod
      };

      const response = await apiService.createOrder(orderData);
      
      if (response.success) {
        // Store order data for success page
        const orderDataForSuccess = {
          orderId: response.orderId,
          customerName: customerInfo.name || 'Walk-in Customer',
          phone: customerInfo.phone || '',
          items: cart,
          totals,
          paymentMethod,
          date: new Date().toISOString()
        };
        
        localStorage.setItem('lastOrder', JSON.stringify(orderDataForSuccess));
        navigate('/payment-success');
      } else {
        setError(response.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="staff-billing">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-billing">
      <header className="billing-header">
        <div className="header-left">
          <h1>Staff Billing</h1>
          <span className="user-info">Welcome, {user?.username}</span>
        </div>
        <button onClick={handleLogout} className="btn btn-outline btn-sm">
          Logout
        </button>
      </header>

      {error && (
        <div className="error-banner">
          <div className="alert alert-error">
            {error}
          </div>
        </div>
      )}

      <div className="billing-container">
        <div className="billing-main">
          <CustomerInfo
            customerInfo={customerInfo}
            setCustomerInfo={setCustomerInfo}
          />
          
          <ProductGrid
            products={products}
            onAddToCart={addToCart}
            cart={cart}
          />
        </div>

        <div className="billing-sidebar">
          <Cart
            cart={cart}
            onUpdateQuantity={updateCartItemQuantity}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
            totals={totals}
          />
          
          <PaymentSection
            discount={discount}
            setDiscount={setDiscount}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            totals={totals}
            onPayment={handlePayment}
            processingPayment={processingPayment}
            disabled={cart.length === 0}
          />
        </div>
      </div>
    </div>
  );
};

export default StaffBilling;
