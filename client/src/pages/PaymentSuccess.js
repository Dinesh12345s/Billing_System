import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const storedOrder = localStorage.getItem('lastOrder');
    
    if (storedOrder) {
      try {
        const parsedOrder = JSON.parse(storedOrder);
        setOrderData(parsedOrder);
      } catch (error) {
        console.error('Error parsing order data:', error);
        navigate('/staff/billing');
      }
    } else {
      navigate('/staff/billing');
    }
    
    setLoading(false);
  }, [navigate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash': return '💵';
      case 'gpay': return '📱';
      case 'paytm': return '💳';
      default: return '💳';
    }
  };

  const getPaymentMethodName = (method) => {
    switch (method) {
      case 'cash': return 'Cash';
      case 'gpay': return 'Google Pay';
      case 'paytm': return 'Paytm';
      default: return method;
    }
  };

  const generatePDF = async () => {
    if (!orderData) return;

    setGeneratingPDF(true);

    try {
      const element = document.getElementById('bill-content');
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 190; // A4 width in mm minus margins
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10; // Top margin

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save(`bill_${orderData.orderId}_${new Date().getTime()}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleNewBilling = () => {
    localStorage.removeItem('lastOrder');
    navigate('/staff/billing');
  };

  if (loading) {
    return (
      <div className="payment-success">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="payment-success">
        <div className="error-container">
          <h2>Order Not Found</h2>
          <button onClick={handleNewBilling} className="btn btn-primary">
            Go Back to Billing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success">
      <div className="success-container">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon">✅</div>
          <h1>Payment Successful!</h1>
          <p>Thank you for your purchase</p>
        </div>

        {/* Bill Content */}
        <div id="bill-content" className="bill-content">
          <div className="bill-header">
            <h2>Billing System</h2>
            <p>Invoice #{orderData.orderId}</p>
          </div>

          <div className="bill-details">
            <div className="customer-details">
              <h3>Customer Information</h3>
              <div className="detail-row">
                <span>Name:</span>
                <span>{orderData.customerName}</span>
              </div>
              {orderData.phone && (
                <div className="detail-row">
                  <span>Phone:</span>
                  <span>{orderData.phone}</span>
                </div>
              )}
              <div className="detail-row">
                <span>Date:</span>
                <span>{formatDate(orderData.date)}</span>
              </div>
              <div className="detail-row">
                <span>Payment Method:</span>
                <span>
                  {getPaymentMethodIcon(orderData.paymentMethod)} {getPaymentMethodName(orderData.paymentMethod)}
                </span>
              </div>
            </div>

            <div className="items-details">
              <h3>Purchased Items</h3>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>GST</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orderData.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{item.gst}%</td>
                      <td>{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="amount-details">
              <div className="amount-row">
                <span>Subtotal:</span>
                <span>{formatCurrency(orderData.totals.subtotal)}</span>
              </div>
              <div className="amount-row">
                <span>GST Amount:</span>
                <span>{formatCurrency(orderData.totals.gstAmount)}</span>
              </div>
              {orderData.totals.discountAmount > 0 && (
                <div className="amount-row discount">
                  <span>Discount:</span>
                  <span>−{formatCurrency(orderData.totals.discountAmount)}</span>
                </div>
              )}
              <div className="amount-row total">
                <span>Total Amount:</span>
                <span>{formatCurrency(orderData.totals.totalAmount)}</span>
              </div>
            </div>

            <div className="bill-footer">
              <p>Thank you for your business!</p>
              <p>Visit us again soon</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            onClick={generatePDF}
            className="btn btn-primary"
            disabled={generatingPDF}
          >
            {generatingPDF ? (
              <>
                <div className="spinner"></div>
                Generating PDF...
              </>
            ) : (
              <>
                📄 Download Bill (PDF)
              </>
            )}
          </button>
          
          <button
            onClick={handleNewBilling}
            className="btn btn-outline"
          >
            🔄 New Billing
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
