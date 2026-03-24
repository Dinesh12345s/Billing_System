import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import DashboardOverview from '../components/admin/DashboardOverview';
import InventoryManagement from '../components/admin/InventoryManagement';
import Sidebar from '../components/admin/Sidebar';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'dashboard') fetchDashboardData();
    else if (activeTab === 'inventory') fetchProducts();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsResponse, revenueResponse, categoryResponse] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getRevenueData('week'),
        apiService.getCategoryData()
      ]);

      if (statsResponse.success && revenueResponse.success && categoryResponse.success) {
        setDashboardData({
          stats: statsResponse.stats,
          revenueData: revenueResponse.revenueData,
          categoryData: categoryResponse.categoryData
        });
      } else setError('Failed to load dashboard data');
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getProducts();
      if (response.success) setProducts(response.products);
      else setError('Failed to load products');
    } catch (err) {
      console.error(err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderContent = () => {
    if (loading)
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      );

    if (error)
      return (
        <div className="error-container">
          <div className="alert alert-error">{error}</div>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Retry
          </button>
        </div>
      );

    if (activeTab === 'dashboard')
      return <DashboardOverview data={dashboardData} onRefresh={fetchDashboardData} />;

    if (activeTab === 'inventory')
      return (
        <InventoryManagement
          products={products}
          onProductAdd={async (p) => {
            const res = await apiService.addProduct(p);
            if (res.success) fetchProducts();
            return res;
          }}
          onProductUpdate={async (id, p) => {
            const res = await apiService.updateProduct(id, p);
            if (res.success) fetchProducts();
            return res;
          }}
          onProductDelete={async (id) => {
            const res = await apiService.deleteProduct(id);
            if (res.success) fetchProducts();
            return res;
          }}
          onRefresh={fetchProducts}
        />
      );

    return null;
  };

  return (
    <div className="admin-dashboard">
      {/* Fixed Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout} />

      {/* Main content shifted right */}
      <div className="main-content">
        <header className="dashboard-header">
          <h1>
            {activeTab === 'dashboard'
              ? 'Dashboard'
              : activeTab === 'inventory'
              ? 'Inventory Management'
              : 'Admin Panel'}
          </h1>
          <div className="header-actions">
            <span className="welcome-text">Welcome, {user?.username}</span>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">
              Logout
            </button>
          </div>
        </header>

        <main className="dashboard-content">{renderContent()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;