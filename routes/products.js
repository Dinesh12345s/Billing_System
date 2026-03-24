const express = require('express');
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const [products] = await pool.execute(
      'SELECT * FROM products ORDER BY category, name'
    );

    res.json({
      success: true,
      products
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      product: products[0]
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add new product (Admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, category, price, gst, stock } = req.body;

    // Validate input
    if (!name || !category || !price || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Insert product without QR code first
    const [result] = await pool.execute(
      'INSERT INTO products (name, category, price, gst, stock) VALUES (?, ?, ?, ?, ?)',
      [name, category, price, gst || 0, stock]
    );

    // <<---- ADD THIS NEXT
    const qrCode = `product_${result.insertId}.png`;
    await pool.execute(
      'UPDATE products SET qr_code = ? WHERE id = ?',
      [qrCode, result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      productId: result.insertId,
      qrCode
    });

  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update product (Admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, gst, stock } = req.body;

    // Validate input
    if (!name || !category || !price || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Update product
    const [result] = await pool.execute(
      'UPDATE products SET name = ?, category = ?, price = ?, gst = ?, stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, category, price, gst || 0, stock, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete product (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Check if product exists in any orders
    const [orderItems] = await pool.execute(
      'SELECT COUNT(*) as count FROM order_items WHERE product_id = ?',
      [id]
    );

    if (orderItems[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete product that is part of orders'
      });
    }

    // Delete product
    const [result] = await pool.execute(
      'DELETE FROM products WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Search products
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;

    const [products] = await pool.execute(
      'SELECT * FROM products WHERE name LIKE ? OR category LIKE ? ORDER BY name',
      [`%${query}%`, `%${query}%`]
    );

    res.json({
      success: true,
      products
    });

  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;

    const [products] = await pool.execute(
      'SELECT * FROM products WHERE category = ? ORDER BY name',
      [category]
    );

    res.json({
      success: true,
      products
    });

  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get all categories
router.get('/categories/all', async (req, res) => {
  try {
    const [categories] = await pool.execute(
      'SELECT DISTINCT category FROM products ORDER BY category'
    );

    res.json({
      success: true,
      categories: categories.map(cat => cat.category)
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});
// routes/products.js

// GET product by QR code
router.get('/qr/:code', async (req, res) => {
  let scannedData = req.params.code.trim();

  try {
    // Try to match by product ID first (QR encodes product ID)
    if (!isNaN(scannedData)) {
      const [rows] = await pool.execute(
        'SELECT * FROM products WHERE id = ?',
        [parseInt(scannedData)]
      );

      if (rows.length > 0) {
        return res.json({ success: true, product: rows[0] });
      }
    }

    // Fallback: try to match by qr_code filename
    let qrCode = scannedData;
    if (!qrCode.toLowerCase().endsWith('.png')) {
      qrCode = `${qrCode}.png`;
    }

    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE LOWER(qr_code) = LOWER(?)',
      [qrCode]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found for scanned QR'
      });
    }

    res.json({ success: true, product: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [products] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    if (products.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product: products[0] });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
module.exports = router;
