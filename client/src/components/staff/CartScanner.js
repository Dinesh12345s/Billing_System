import React, { useRef, useEffect, useState, useCallback } from 'react';
import QrReader from 'react-qr-reader';

const CartScanner = ({ onScan }) => {
  const qrRef = useRef(null);
  const lastScanRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const readerRef = useRef(null);

  const handleError = useCallback((err) => {
    // Suppress camera/play interruption errors - don't log them
    if (!err) return;
    
    const errorMsg = (err.message || err.toString() || '').toLowerCase();
    
    // List of errors to completely ignore without logging
    const ignoredErrors = [
      'play() request was interrupted',
      'interrupted by a new load',
      'NotAllowedError',
      'NotFoundError',
      'played without permission',
      'request was aborted',
      'networkinaccessible',
      'devicenotfound',
      'notreadable',
      'permission denied'
    ];

    const shouldIgnore = ignoredErrors.some(msg => errorMsg.includes(msg.toLowerCase()));
    
    // Only log if it's a real error we should know about
    if (!shouldIgnore && errorMsg.length > 10) {
      console.warn('QR Scanner Error:', err);
    }
  }, []);

  const handleScan = useCallback((result) => {
    if (result && result !== lastScanRef.current) {
      lastScanRef.current = result;
      
      // Call onScan asynchronously to prevent state update interruptions
      Promise.resolve().then(() => {
        onScan(result);
      });
      
      // Reset after scan
      setTimeout(() => {
        lastScanRef.current = null;
      }, 1000);
    }
  }, [onScan]);

  useEffect(() => {
    setIsLoading(false);
    
    return () => {
      lastScanRef.current = null;
    };
  }, []);

  return (
    <div className="cart-scanner" ref={qrRef}>
      {!isLoading && (
        <QrReader
          ref={readerRef}
          delay={1000}
          onError={handleError}
          onScan={handleScan}
          facingMode="environment"
          style={{
            width: '100%',
            height: '100%'
          }}
          containerStyle={{
            width: '100%',
            height: '100%'
          }}
        />
      )}
    </div>
  );
};

export default CartScanner;