// src/components/staff/CartScanner.js
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { QrReader } from 'react-qr-reader';

const CartScanner = React.memo(({ onScan }) => {
  const lastScanRef = useRef(null);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const handleScan = useCallback((text) => {
    if (!text) return;

    // Prevent duplicate scans
    if (text === lastScanRef.current) return;
    lastScanRef.current = text;

    if (onScanRef.current) {
      onScanRef.current(text);
    }

    // Reset after 3 sec
    setTimeout(() => {
      lastScanRef.current = null;
    }, 3000);
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '280px',
        background: '#000'
      }}
    >
      <QrReader
        constraints={{
          facingMode: 'environment'
        }}
        onResult={(result, error) => {
          if (!!result) {
            handleScan(result?.text);
          }
        }}
        style={{
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
});

CartScanner.displayName = 'CartScanner';

export default CartScanner;