const express = require('express');
const { pool } = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Total products
    const [productsResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM products'
    );

    // Total stock
    const [stockResult] = await pool.execute(
      'SELECT COALESCE(SUM(stock), 0) as total FROM products'
    );

    // Today's revenue
    const [todayRevenue] = await pool.execute(
      'SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE DATE(created_at) = CURDATE()'
    );

    // Yesterday's revenue for growth calculation
    const [yesterdayRevenue] = await pool.execute(
      'SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)'
    );

    // Calculate growth percentage
    const today = parseFloat(todayRevenue[0].revenue) || 0;
    const yesterday = parseFloat(yesterdayRevenue[0].revenue) || 0;
    let growthPercentage = 0;

    if (yesterday > 0) {
      growthPercentage = ((today - yesterday) / yesterday) * 100;
    } else if (today > 0) {
      growthPercentage = 100; // First day with sales
    }

    // Total orders today
    const [todayOrders] = await pool.execute(
      'SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURDATE()'
    );

    // Low stock products (stock < 10)
    const [lowStockResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM products WHERE stock < 10'
    );

    // Recent orders (last 5)
    const [recentOrders] = await pool.execute(
      `SELECT o.id, o.customer_name, o.total_amount, o.payment_method,
              DATE_FORMAT(o.created_at, '%Y-%m-%d %H:%i:%s') as formatted_date
       FROM orders o
       ORDER BY o.created_at DESC
       LIMIT 5`
    );

    // Top selling products
    const [topProducts] = await pool.execute(
      `SELECT p.name, p.category, SUM(oi.quantity) as total_sold, SUM(oi.subtotal) as revenue
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id
       WHERE MONTH(o.created_at) = MONTH(CURDATE()) AND YEAR(o.created_at) = YEAR(CURDATE())
       GROUP BY p.id, p.name, p.category
       ORDER BY total_sold DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      stats: {
        totalProducts: productsResult[0].total,
        totalStock: stockResult[0].total,
        todayRevenue: today,
        growthPercentage: growthPercentage.toFixed(2),
        todayOrders: todayOrders[0].count,
        lowStockProducts: lowStockResult[0].count
      },
      recentOrders,
      topProducts
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get revenue data for charts
router.get('/revenue', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { period = 'week' } = req.query;

    let query = '';
    let params = [];

    switch (period) {
      case 'week':
        query = `
          SELECT 
            DATE(created_at) as date,
            COALESCE(SUM(total_amount), 0) as revenue,
            COUNT(*) as orders
          FROM orders
          WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `;
        break;
      case 'month':
        query = `
          SELECT 
            DATE(created_at) as date,
            COALESCE(SUM(total_amount), 0) as revenue,
            COUNT(*) as orders
          FROM orders
          WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `;
        break;
      case 'year':
        query = `
          SELECT 
            MONTHNAME(created_at) as month,
            COALESCE(SUM(total_amount), 0) as revenue,
            COUNT(*) as orders
          FROM orders
          WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
          GROUP BY MONTH(created_at), MONTHNAME(created_at)
          ORDER BY MONTH(created_at) ASC
        `;
        break;
      default:
        query = `
          SELECT 
            DATE(created_at) as date,
            COALESCE(SUM(total_amount), 0) as revenue,
            COUNT(*) as orders
          FROM orders
          WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
          GROUP BY DATE(created_at)
          ORDER BY date ASC
        `;
    }

    const [revenueData] = await pool.execute(query, params);

    res.json({
      success: true,
      revenueData,
      period
    });

  } catch (error) {
    console.error('Get revenue data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get category performance
router.get('/categories', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const [categoryData] = await pool.execute(
      `SELECT 
        p.category,
        COUNT(DISTINCT p.id) as product_count,
        COALESCE(SUM(oi.quantity), 0) as total_sold,
        COALESCE(SUM(oi.subtotal), 0) as revenue,
        COALESCE(SUM(p.stock), 0) as current_stock
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id
      GROUP BY p.category
      ORDER BY revenue DESC
      `
    );

    res.json({
      success: true,
      categoryData
    });

  } catch (error) {
    console.error('Get category data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
