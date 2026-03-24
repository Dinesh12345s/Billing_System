import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    const msg = (error.message || error.toString() || '').toLowerCase();
    
    // Keywords to completely suppress without showing error
    const cameraKeywords = [
      'play',
      'interrupt',
      'video',
      'load',
      'abort',
      'codec',
      'videowidth',
      'videoheight',
      'qr',
      'camera',
      'reader',
      'media',
      'stream',
      'permission',
      'constraint'
    ];
    
    const isCameraError = cameraKeywords.some(keyword => msg.includes(keyword));
    
    // Return no error state for camera-related issues
    if (isCameraError) {
      return { hasError: false };
    }
    
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const msg = (error.message || error.toString() || '').toLowerCase();
    const cameraKeywords = ['play', 'interrupt', 'video', 'load', 'abort', 'codec', 'videowidth', 'qr', 'camera'];
    const isCameraError = cameraKeywords.some(keyword => msg.includes(keyword));
    
    // Completely suppress logging for camera errors
    if (!isCameraError) {
      console.error('Unexpected application error:', error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#fee',
          color: '#c00',
          borderRadius: '4px',
          margin: '20px'
        }}>
          <p>Something went wrong. Please refresh the page to continue.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
