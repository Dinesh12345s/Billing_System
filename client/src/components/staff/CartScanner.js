// src/components/staff/CartScanner.js
import React from 'react';
import { QrReader } from 'react-qr-reader';

const CartScanner = ({ onScan }) => {
  return (
    <div className="cart-scanner">
      <QrReader
        constraints={{ facingMode: 'environment' }}
        onResult={(result, error) => {
          if (!!result) {
            onScan(result?.text);
          }
          if (!!error) {
            console.error(error);
          }
        }}
        style={{ width: '100%' }}
      />
    </div>
  );
};

export default CartScanner;