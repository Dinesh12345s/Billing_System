const express = require('express');
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Create new order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { 
      customer_name, 
      phone, 
      items, 
      subtotal, 
      gst_amount, 
      discount_amount, 
      total_amount, 
      payment_method 
    } = req.body;

    // Validate input
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    if (!payment_method || !['cash', 'gpay', 'paytm'].includes(payment_method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create order
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (
          customer_name, 
          phone, 
          subtotal, 
          gst_amount, 
          discount_amount, 
          total_amount, 
          payment_method, 
          payment_status, 
          created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?)`,
        [customer_name || 'Walk-in Customer', phone, subtotal, gst_amount, discount_amount || 0, total_amount, payment_method, req.user.userId]
      );

      const orderId = orderResult.insertId;

      // Insert order items and update product stock
      for (const item of items) {
        // Insert order item
        await connection.execute(
          `INSERT INTO order_items (
            order_id, 
            product_id, 
            quantity, 
            price, 
            gst, 
            subtotal
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [orderId, item.product_id, item.quantity, item.price, item.gst, item.subtotal]
        );

        // Update product stock
        await connection.execute(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      // Commit transaction
      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        orderId
      });

    } catch (error) {
      // Rollback transaction
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get all orders (Admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { page = 1, limit = 10, date_from, date_to } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT o.*, u.username as created_by_username,
             DATE_FORMAT(o.created_at, '%Y-%m-%d %H:%i:%s') as formatted_date
      FROM orders o
      LEFT JOIN users u ON o.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (date_from) {
      query += ' AND DATE(o.created_at) >= ?';
      params.push(date_from);
    }

    if (date_to) {
      query += ' AND DATE(o.created_at) <= ?';
      params.push(date_to);
    }

    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [orders] = await pool.execute(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE 1=1';
    const countParams = [];

    if (date_from) {
      countQuery += ' AND DATE(created_at) >= ?';
      countParams.push(date_from);
    }

    if (date_to) {
      countQuery += ' AND DATE(created_at) <= ?';
      countParams.push(date_to);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get order by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Get order details
    const [orders] = await pool.execute(
      `SELECT o.*, u.username as created_by_username,
              DATE_FORMAT(o.created_at, '%Y-%m-%d %H:%i:%s') as formatted_date
       FROM orders o
       LEFT JOIN users u ON o.created_by = u.id
       WHERE o.id = ?`,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Get order items
    const [items] = await pool.execute(
      `SELECT oi.*, p.name as product_name, p.category
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );

    res.json({
      success: true,
      order: orders[0],
      items
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get today's orders
router.get('/today/all', authMiddleware, async (req, res) => {
  try {
    const [orders] = await pool.execute(
      `SELECT o.*, u.username as created_by_username
       FROM orders o
       LEFT JOIN users u ON o.created_by = u.id
       WHERE DATE(o.created_at) = CURDATE()
       ORDER BY o.created_at DESC`
    );

    res.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Get today\'s orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get order statistics
router.get('/stats/summary', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Today's revenue
    const [todayRevenue] = await pool.execute(
      'SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE DATE(created_at) = CURDATE()'
    );

    // Total orders today
    const [todayOrders] = await pool.execute(
      'SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURDATE()'
    );

    // This month's revenue
    const [monthRevenue] = await pool.execute(
      'SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())'
    );

    // Total orders this month
    const [monthOrders] = await pool.execute(
      'SELECT COUNT(*) as count FROM orders WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())'
    );

    res.json({
      success: true,
      stats: {
        todayRevenue: todayRevenue[0].revenue,
        todayOrders: todayOrders[0].count,
        monthRevenue: monthRevenue[0].revenue,
        monthOrders: monthOrders[0].count
      }
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
