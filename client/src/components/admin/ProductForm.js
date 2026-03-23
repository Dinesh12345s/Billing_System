import React, { useState, useEffect } from 'react';
import './ProductForm.css';

const ProductForm = ({ product, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    gst: '0',
    stock: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        price: product.price || '',
        gst: product.gst || '0',
        stock: product.stock || ''
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }

    if (formData.gst && (parseFloat(formData.gst) < 0 || parseFloat(formData.gst) > 100)) {
      newErrors.gst = 'GST must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      price: parseFloat(formData.price),
      gst: parseFloat(formData.gst) || 0,
      stock: parseInt(formData.stock)
    };

    const result = await onSubmit(submitData);
    
    if (!result.success) {
      setErrors({ submit: result.message });
    }
  };

  const categories = [
    'Electronics',
    'Accessories',
    'Computer Parts',
    'Networking',
    'Software',
    'Peripherals',
    'Storage',
    'Other'
  ];

  return (
    <form onSubmit={handleSubmit} className="product-form">
      {errors.submit && (
        <div className="alert alert-error">
          {errors.submit}
        </div>
      )}

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="name">Product Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`input ${errors.name ? 'input-error' : ''}`}
            placeholder="Enter product name"
            disabled={loading}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`input ${errors.category ? 'input-error' : ''}`}
            disabled={loading}
          >
            <option value="">Select category</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && <span className="error-text">{errors.category}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="price">Price (₹) *</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className={`input ${errors.price ? 'input-error' : ''}`}
            placeholder="0.00"
            step="0.01"
            min="0"
            disabled={loading}
          />
          {errors.price && <span className="error-text">{errors.price}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="gst">GST (%)</label>
          <input
            type="number"
            id="gst"
            name="gst"
            value={formData.gst}
            onChange={handleChange}
            className={`input ${errors.gst ? 'input-error' : ''}`}
            placeholder="0"
            step="0.01"
            min="0"
            max="100"
            disabled={loading}
          />
          {errors.gst && <span className="error-text">{errors.gst}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="stock">Stock Quantity *</label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            className={`input ${errors.stock ? 'input-error' : ''}`}
            placeholder="0"
            min="0"
            disabled={loading}
          />
          {errors.stock && <span className="error-text">{errors.stock}</span>}
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              {product ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            product ? 'Update Product' : 'Add Product'
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
