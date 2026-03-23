import React from 'react';
import './DashboardOverview.css';

const DashboardOverview = ({ data, onRefresh }) => {
  if (!data) {
    return (
      <div className="dashboard-overview">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const { stats, revenueData, categoryData } = data;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getGrowthColor = (growth) => {
    const growthValue = parseFloat(growth);
    if (growthValue > 0) return '#10b981';
    if (growthValue < 0) return '#ef4444';
    return '#6b7280';
  };

  const getGrowthIcon = (growth) => {
    const growthValue = parseFloat(growth);
    if (growthValue > 0) return '📈';
    if (growthValue < 0) return '📉';
    return '➡️';
  };

  return (
    <div className="dashboard-overview">
      <div className="overview-header">
        <h2>Business Overview</h2>
        <button onClick={onRefresh} className="btn btn-outline btn-sm">
          🔄 Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon products-icon">📦</div>
          <div className="card-content">
            <h3>Total Products</h3>
            <p className="card-value">{formatNumber(stats.totalProducts)}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon stock-icon">📊</div>
          <div className="card-content">
            <h3>Total Stock</h3>
            <p className="card-value">{formatNumber(stats.totalStock)}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon revenue-icon">💰</div>
          <div className="card-content">
            <h3>Today's Revenue</h3>
            <p className="card-value">{formatCurrency(stats.todayRevenue)}</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon growth-icon">
            {getGrowthIcon(stats.growthPercentage)}
          </div>
          <div className="card-content">
            <h3>Growth</h3>
            <p 
              className="card-value" 
              style={{ color: getGrowthColor(stats.growthPercentage) }}
            >
              {stats.growthPercentage > 0 ? '+' : ''}{stats.growthPercentage}%
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>Revenue Trend (Last 7 Days)</h3>
          <div className="revenue-chart">
            {revenueData && revenueData.length > 0 ? (
              <div className="chart-bars">
                {revenueData.map((item, index) => (
                  <div key={index} className="chart-bar-wrapper">
                    <div 
                      className="chart-bar"
                      style={{ 
                        height: `${Math.max(20, (item.revenue / Math.max(...revenueData.map(d => d.revenue))) * 100)}%` 
                      }}
                    >
                      <span className="bar-value">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                    <span className="bar-label">
                      {item.date ? new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }) : ''}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No revenue data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="chart-container">
          <h3>Category Performance</h3>
          <div className="category-chart">
            {categoryData && categoryData.length > 0 ? (
              <div className="category-list">
                {categoryData.map((category, index) => (
                  <div key={index} className="category-item">
                    <div className="category-info">
                      <span className="category-name">{category.category}</span>
                      <span className="category-revenue">
                        {formatCurrency(category.revenue)}
                      </span>
                    </div>
                    <div className="category-bar">
                      <div 
                        className="category-fill"
                        style={{ 
                          width: `${Math.max(5, (category.revenue / Math.max(...categoryData.map(d => d.revenue))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No category data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="additional-stats">
        <div className="stat-card">
          <h3>Today's Orders</h3>
          <p className="stat-value">{formatNumber(stats.todayOrders)}</p>
        </div>
        <div className="stat-card">
          <h3>Low Stock Products</h3>
          <p className="stat-value warning">{formatNumber(stats.lowStockProducts)}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
