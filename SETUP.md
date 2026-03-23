# Billing System Setup Guide

This guide will help you set up the complete Billing System application on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download Node.js](https://nodejs.org/)
- **MySQL Server** - [Download MySQL](https://www.mysql.com/downloads/)
- **Git** (optional) - [Download Git](https://git-scm.com/)

## Step 1: Database Setup

1. **Install MySQL Server** if not already installed
2. **Start MySQL Service**:
   - Windows: Open Services and start "MySQL" service
   - Mac: `brew services start mysql`
   - Linux: `sudo systemctl start mysql`

3. **Create Database** (optional - the app will create it automatically):
   ```sql
   CREATE DATABASE billing_system;
   ```

4. **Update Database Credentials**:
   - Open `.env` file in the project root
   - Update these lines with your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=billing_system
   DB_PORT=3306
   ```

## Step 2: Backend Setup

1. **Navigate to project directory**:
   ```bash
   cd e:\Dharsini\Dhanam\Billing_System
   ```

2. **Install backend dependencies**:
   ```bash
   npm install
   ```

3. **Start the backend server**:
   ```bash
   npm run server
   ```

   The server will:
   - Connect to MySQL database
   - Create all necessary tables
   - Insert sample data
   - Start on port 5000

## Step 3: Frontend Setup

1. **Open a new terminal window**

2. **Navigate to client directory**:
   ```bash
   cd e:\Dharsini\Dhanam\Billing_System\client
   ```

3. **Install frontend dependencies**:
   ```bash
   npm install
   ```

4. **Start the React development server**:
   ```bash
   npm start
   ```

   The frontend will start on port 3000

## Step 4: Access the Application

1. **Open your browser** and go to:
   ```
   http://localhost:3000
   ```

2. **Login with default credentials**:

   **Admin Login:**
   - Username: `admin`
   - Password: `admin123`

   **Staff Login:**
   - Username: `staff`
   - Password: `staff123`

## Step 5: Test the Application

### Admin Features:
- View dashboard with statistics
- Manage inventory (add/edit/delete products)
- View sales reports

### Staff Features:
- Create bills by selecting products
- Apply discounts
- Process payments (Cash, GPay, Paytm)
- Generate PDF bills

## Troubleshooting

### Common Issues:

1. **Database Connection Error**:
   - Make sure MySQL server is running
   - Check your database credentials in `.env` file
   - Ensure MySQL user has necessary permissions

2. **Port Already in Use**:
   - Backend: Change PORT in `.env` file
   - Frontend: React will automatically suggest an alternative port

3. **Module Not Found Error**:
   - Run `npm install` in both root and client directories
   - Delete `node_modules` and `package-lock.json` then reinstall

4. **Permission Denied Error**:
   - Run terminal as Administrator (Windows)
   - Check file/folder permissions

### Database Reset:

If you need to reset the database:
1. Stop the server
2. Delete the `billing_system` database
3. Restart the server (it will recreate everything)

## Development Mode

For development with hot reload:
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm start
```

## Production Deployment

For production deployment:
```bash
# Build frontend
cd client && npm run build

# Start production server
cd .. && npm start
```

## Support

If you encounter any issues:

1. Check the console output for error messages
2. Verify all prerequisites are installed
3. Ensure database credentials are correct
4. Check that required ports are available

## Features Overview

- ✅ User authentication (Admin/Staff roles)
- ✅ Product management with inventory tracking
- ✅ Real-time billing and cart system
- ✅ Multiple payment methods
- ✅ PDF bill generation
- ✅ Responsive design for desktop and tablet
- ✅ Modern UI with smooth interactions
- ✅ Real-time calculations and updates

The application is now ready to use! 🎉
