import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [role, setRole] = useState('');
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setError('');
  };

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(credentials.username, credentials.password, role);
    
    if (result.success) {
      // Navigate to appropriate dashboard
      const redirectPath = role === 'admin' ? '/admin/dashboard' : '/staff/billing';
      navigate(redirectPath, { replace: true });
    } else {
      setError(result.message || 'Login failed');
    }
    
    setLoading(false);
  };

  const handleBackToRoleSelection = () => {
    setRole('');
    setCredentials({ username: '', password: '' });
    setError('');
  };

  if (!role) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>Billing System</h1>
            <p>Select your role to continue</p>
          </div>
          
          <div className="role-selection">
            <button
              className="role-btn admin-btn"
              onClick={() => handleRoleSelect('admin')}
            >
              <div className="role-icon">👨‍💼</div>
              <h3>Admin Login</h3>
              <p>Manage inventory and view reports</p>
            </button>
            
            <button
              className="role-btn staff-btn"
              onClick={() => handleRoleSelect('staff')}
            >
              <div className="role-icon">🧑‍💼</div>
              <h3>Staff Login</h3>
              <p>Create bills and manage sales</p>
            </button>
          </div>
          
          <div className="login-footer">
            <p>Default Credentials:</p>
            <p>Admin: admin / admin123</p>
            <p>Staff: staff / staff123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <button className="back-btn" onClick={handleBackToRoleSelection}>
            ← Back
          </button>
          <h1>{role === 'admin' ? 'Admin' : 'Staff'} Login</h1>
          <p>Enter your credentials to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              className="input"
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              className="input"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <p>
            {role === 'admin' ? 'Admin' : 'Staff'} Portal - Billing System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
