import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import ProductForm from './ProductForm';
import './InventoryManagement.css';

const InventoryManagement = ({ products, onProductAdd, onProductUpdate, onProductDelete, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFilteredProducts(products);
    extractCategories(products);
  }, [products]);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const extractCategories = (productsList) => {
    const uniqueCategories = [...new Set(productsList.map(p => p.category))];
    setCategories(uniqueCategories);
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const handleAddProduct = async (productData) => {
    setLoading(true);
    const result = await onProductAdd(productData);
    setLoading(false);
    
    if (result.success) {
      setShowAddForm(false);
    }
    return result;
  };

  const handleUpdateProduct = async (productData) => {
    setLoading(true);
    const result = await onProductUpdate(editingProduct.id, productData);
    setLoading(false);
    
    if (result.success) {
      setEditingProduct(null);
    }
    return result;
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setLoading(true);
    const result = await onProductDelete(productId);
    setLoading(false);
    
    if (!result.success) {
      alert(result.message || 'Failed to delete product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowAddForm(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { status: 'out', color: '#ef4444', label: 'Out of Stock' };
    if (stock < 10) return { status: 'low', color: '#f59e0b', label: 'Low Stock' };
    return { status: 'good', color: '#10b981', label: 'In Stock' };
  };

  return (
    <div className="inventory-management">
      <div className="inventory-header">
        <h2>Inventory Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary"
        >
          + Add New Product
        </button>
      </div>

      {/* Search and Filter */}
      <div className="inventory-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
          />
        </div>
        
        <div className="filter-box">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <button onClick={onRefresh} className="btn btn-outline">
          🔄 Refresh
        </button>
      </div>

      {/* Product Table */}
      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>GST</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  {searchTerm || selectedCategory !== 'all' 
                    ? 'No products found matching your criteria' 
                    : 'No products available'}
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => {
                const stockStatus = getStockStatus(product.stock);
                return (
                  <tr key={product.id}>
                    <td className="product-name">{product.name}</td>
                    <td className="category">{product.category}</td>
                    <td className="price">{formatCurrency(product.price)}</td>
                    <td className="gst">{product.gst}%</td>
                    <td className="stock">{product.stock}</td>
                    <td className="status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: stockStatus.color }}
                      >
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="btn btn-sm btn-outline"
                        disabled={loading}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="btn btn-sm btn-danger"
                        disabled={loading}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Product Form Modal */}
      {(showAddForm || editingProduct) && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingProduct(null);
                }}
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <ProductForm
              product={editingProduct}
              onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
              onCancel={() => {
                setShowAddForm(false);
                setEditingProduct(null);
              }}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;