// generate_qr_for_existing_products.js
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

// Import your pool from config
const { pool } = require('./config/database'); // uses your existing pool

async function generateQRs() {
  let connection;
  try {
    // 1️⃣ Create folder for QR codes if it doesn't exist
    const qrFolder = path.join(__dirname, 'static', 'qr');
    if (!fs.existsSync(qrFolder)) {
      fs.mkdirSync(qrFolder, { recursive: true });
    }

    // 2️⃣ Get a connection from the pool
    connection = await pool.getConnection();

    // 3️⃣ Fetch all products
    const [products] = await connection.query('SELECT id, name FROM products');

    // 4️⃣ Generate QR for each product
    for (const product of products) {
      const qrData = product.id.toString(); // encode product ID
      const filePath = path.join(qrFolder, `product_${product.id}.png`);

      // Generate QR code and save as PNG
      await QRCode.toFile(filePath, qrData);

      // Optional: update qr_code column in DB
      await connection.query('UPDATE products SET qr_code = ? WHERE id = ?', [
        `product_${product.id}.png`,
        product.id
      ]);

      console.log(`Generated QR for ${product.id} - ${product.name}`);
    }

    console.log('All QR codes generated successfully!');
    process.exit(0);

  } catch (err) {
    console.error('Error generating QR codes:', err);
    process.exit(1);

  } finally {
    // 5️⃣ Release connection back to pool
    if (connection) connection.release();
  }
}

// Run the script
generateQRs();