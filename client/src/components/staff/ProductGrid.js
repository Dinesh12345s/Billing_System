import React, { useState, useMemo } from 'react';
import './ProductGrid.css';

const ProductGrid = ({ products, onAddToCart, cart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return uniqueCategories;
  }, [products]);

  const filteredProducts = useMemo(() => {
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

    return filtered;
  }, [products, searchTerm, selectedCategory]);

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

  const getCartItemQuantity = (productId) => {
    const cartItem = cart.find(item => item.id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAddToCart = (product) => {
    if (product.stock === 0) return;
    onAddToCart(product);
  };

  return (
    <div className="product-grid-container">
      <div className="product-grid-header">
        <h2>Products</h2>
        <div className="product-controls">
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
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <div className="no-products-icon">📦</div>
            <h3>No products found</h3>
            <p>
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'No products available in inventory'}
            </p>
          </div>
        ) : (
          filteredProducts.map(product => {
            const stockStatus = getStockStatus(product.stock);
            const cartQuantity = getCartItemQuantity(product.id);
            
            return (
              <div key={product.id} className="product-card">
                <div className="product-header">
                  <h3 className="product-name">{product.name}</h3>
                  <span 
                    className="stock-badge"
                    style={{ backgroundColor: stockStatus.color }}
                  >
                    {stockStatus.label}
                  </span>
                </div>
                
                <div className="product-details">
                  <div className="product-category">{product.category}</div>
                  <div className="product-price">{formatCurrency(product.price)}</div>
                  <div className="product-gst">GST: {product.gst}%</div>
                  <div className="product-stock">Stock: {product.stock}</div>
                </div>
                
                <div className="product-actions">
                  {cartQuantity > 0 && (
                    <div className="cart-indicator">
                      <span className="cart-count">{cartQuantity}</span>
                      <span>in cart</span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleAddToCart(product)}
                    className={`btn ${product.stock === 0 ? 'btn-disabled' : 'btn-primary'}`}
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProductGrid;
