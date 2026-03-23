import api from './authService';

export const apiService = {
  // Products
  getProducts: async () => {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch products' };
    }
  },

  getProduct: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch product' };
    }
  },

  addProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to add product' };
    }
  },

  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update product' };
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to delete product' };
    }
  },

  searchProducts: async (query) => {
    try {
      const response = await api.get(`/products/search/${query}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to search products' };
    }
  },

  getProductsByCategory: async (category) => {
    try {
      const response = await api.get(`/products/category/${category}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch products by category' };
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get('/products/categories/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch categories' };
    }
  },

  // Orders
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to create order' };
    }
  },

  getOrders: async (params = {}) => {
    try {
      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch orders' };
    }
  },

  getOrder: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch order' };
    }
  },

  getTodayOrders: async () => {
    try {
      const response = await api.get('/orders/today/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch today\'s orders' };
    }
  },

  getOrderStats: async () => {
    try {
      const response = await api.get('/orders/stats/summary');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch order statistics' };
    }
  },

  // Dashboard
  getDashboardStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch dashboard statistics' };
    }
  },

  getRevenueData: async (period = 'week') => {
    try {
      const response = await api.get('/dashboard/revenue', { params: { period } });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch revenue data' };
    }
  },

  getCategoryData: async () => {
    try {
      const response = await api.get('/dashboard/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch category data' };
    }
  }
};
