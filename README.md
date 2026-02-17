# Jokama Auto Services & Spares - POS System

A professional Point of Sale (POS) system built for managing spare parts inventory, processing sales, and generating thermal receipts.

## 🚀 Key Features
* **Real-time Inventory Search:** Quickly find parts by name or OEM number.
* **Dynamic Cart Management:** Add items, adjust quantities, and remove products with ease.
* **Editable Pricing & Auto-Discounts:** Manually adjust unit prices in the cart with real-time "Savings" calculation for the customer.
* **Thermal Receipt Printing:** Automatic generation of professional 72mm tax invoices via a silent background print job.
* **Tax Calculation:** Automatic VAT (16%) and subtotal breakdown.
* **Database Integration:** Powered by MySQL to track sales, parts, and stock levels accurately.

## 🛠️ Tech Stack
* **Frontend:** React.js, Tailwind CSS
* **Backend:** Node.js, Express.js
* **Database:** MySQL (XAMPP/phpMyAdmin)

## 📦 Installation & Setup

### 1. Database Setup
1. Import the provided `njokama_database.sql` into your phpMyAdmin.
2. Ensure your MySQL server is running on the default port.

### 2. Backend Setup
```bash
cd backend
npm install
npm start

**### 3. Frontend Setup**
cd frontend
npm install
npm start
