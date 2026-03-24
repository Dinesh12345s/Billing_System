import React from 'react';

class CameraErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    const msg = String(error.message || '').toLowerCase();
    
    // Only suppress camera/QR-related errors
    const cameraKeywords = [
      'videowidth',
      'video',
      'reader',
      'qr',
      'camera',
      'media',
      'play',
      'interrupt',
      'video width',
      'null'
    ];
    
    if (cameraKeywords.some(kw => msg.includes(kw))) {
      // Suppress camera errors silently
      console.warn('Camera error suppressed:', error.message);
      return { hasError: false };
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    const msg = String(error.message || '').toLowerCase();
    const cameraKeywords = [
      'videowidth',
      'video',
      'reader',
      'qr',
      'camera',
      'media',
      'play',
      'interrupt',
      'video width',
      'null'
    ];
    
    // Don't log camera-related errors
    if (!cameraKeywords.some(kw => msg.includes(kw))) {
      console.error('Error caught by CameraErrorBoundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Only show error UI for non-camera errors
      return <div>Something went wrong: {this.state.error.message}</div>;
    }

    return this.props.children;
  }
}

export default CameraErrorBoundary;
