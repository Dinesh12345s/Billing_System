# Billing System

A complete web-based billing system with React frontend, Node.js backend, and MySQL database.

## Features

- **Authentication**: Admin and Staff login with role-based access
- **Admin Dashboard**: Overview with statistics and charts
- **Inventory Management**: Add, edit, and delete products
- **Billing Interface**: Product selection and cart management
- **Payment Processing**: Multiple payment methods (Cash, GPay, Paytm)
- **PDF Generation**: Download bills as PDF
- **Responsive Design**: Works on desktop and tablet

## Tech Stack

- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT
- **PDF Generation**: jsPDF

## Installation

### Prerequisites

- Node.js (v16 or higher)
- MySQL Server
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd billing-system
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Setup MySQL Database**
   - Create a database named `billing_system`
   - Update `.env` file with your database credentials

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=billing_system
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

5. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

6. **Start the application**
   
   For development (run both backend and frontend):
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run client
   ```
   
   For production:
   ```bash
   npm run build
   npm start
   ```

## Default Credentials

### Admin Login
- **Username**: admin
- **Password**: admin123

### Staff Login
- **Username**: staff
- **Password**: staff123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Add new product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)
- `GET /api/products/search/:query` - Search products
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/categories/all` - Get all categories

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders (Admin only)
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/today/all` - Get today's orders
- `GET /api/orders/stats/summary` - Get order statistics (Admin only)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (Admin only)
- `GET /api/dashboard/revenue` - Get revenue data for charts (Admin only)
- `GET /api/dashboard/categories` - Get category performance (Admin only)

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `password` - Hashed password
- `role` - 'admin' or 'staff'
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Products Table
- `id` - Primary key
- `name` - Product name
- `category` - Product category
- `price` - Product price
- `gst` - GST percentage
- `stock` - Stock quantity
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Orders Table
- `id` - Primary key
- `customer_name` - Customer name
- `phone` - Customer phone
- `subtotal` - Order subtotal
- `gst_amount` - GST amount
- `discount_amount` - Discount amount
- `total_amount` - Total amount
- `payment_method` - Payment method
- `payment_status` - Payment status
- `created_by` - User who created the order
- `created_at` - Timestamp

### Order_Items Table
- `id` - Primary key
- `order_id` - Foreign key to orders
- `product_id` - Foreign key to products
- `quantity` - Item quantity
- `price` - Item price
- `gst` - GST percentage
- `subtotal` - Item subtotal
- `created_at` - Timestamp

## Project Structure

```
billing-system/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── App.js
│   └── package.json
├── config/
│   └── database.js         # Database configuration
├── middleware/
│   └── auth.js           # Authentication middleware
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── products.js       # Product routes
│   ├── orders.js         # Order routes
│   └── dashboard.js      # Dashboard routes
├── server.js             # Main server file
├── package.json
└── README.md
```

## Usage

1. **Admin Dashboard**
   - View statistics and charts
   - Manage inventory (add/edit/delete products)
   - View order history
   - Monitor sales performance

2. **Staff Billing**
   - Select products from grid
   - Add to cart with quantity controls
   - Apply discounts
   - Process payments
   - Generate PDF bills

3. **Payment Flow**
   - Select payment method (Cash, GPay, Paytm)
   - Process payment
   - View success page
   - Download PDF bill

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For any issues or questions, please contact the development team.
