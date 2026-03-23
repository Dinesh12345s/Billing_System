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
    if (activeTab === 'dashboard') {
      fetchDashboardData();
    } else if (activeTab === 'inventory') {
      fetchProducts();
    }
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
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
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
      
      if (response.success) {
        setProducts(response.products);
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProductAdd = async (productData) => {
    try {
      const response = await apiService.addProduct(productData);
      if (response.success) {
        fetchProducts(); // Refresh products list
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: 'Failed to add product' };
    }
  };

  const handleProductUpdate = async (id, productData) => {
    try {
      const response = await apiService.updateProduct(id, productData);
      if (response.success) {
        fetchProducts(); // Refresh products list
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: 'Failed to update product' };
    }
  };

  const handleProductDelete = async (id) => {
    try {
      const response = await apiService.deleteProduct(id);
      if (response.success) {
        fetchProducts(); // Refresh products list
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: 'Failed to delete product' };
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <div className="alert alert-error">
            {error}
          </div>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Retry
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview 
            data={dashboardData}
            onRefresh={fetchDashboardData}
          />
        );
      case 'inventory':
        return (
          <InventoryManagement 
            products={products}
            onProductAdd={handleProductAdd}
            onProductUpdate={handleProductUpdate}
            onProductDelete={handleProductDelete}
            onRefresh={fetchProducts}
          />
        );
      default:
        return <DashboardOverview data={dashboardData} />;
    }
  };

  return (
    <div className="admin-dashboard">
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />
      
      <div className="main-content">
        <header className="dashboard-header">
          <h1>
            {activeTab === 'dashboard' ? 'Dashboard' : 
             activeTab === 'inventory' ? 'Inventory Management' : 
             'Admin Panel'}
          </h1>
          <div className="header-actions">
            <span className="welcome-text">Welcome, {user?.username}</span>
            <button onClick={handleLogout} className="btn btn-outline btn-sm">
              Logout
            </button>
          </div>
        </header>
        
        <main className="dashboard-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
