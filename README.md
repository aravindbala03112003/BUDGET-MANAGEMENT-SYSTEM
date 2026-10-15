# University Budget Management System

A financial management, budget allocation, and expenditure billing web application developed for **Puducherry Technological University (PTU)**.

Engineered with a **PHP** backend powered by **PostgreSQL** (with PDO and prepared statements) and a responsive frontend built using **HTML5, CSS3, JavaScript, jQuery, and Select2**.

---

## 🏛️ Application Modules & Features

1. **Dashboard (`index.html`):** Overview and quick navigation to all financial modules.
2. **Budget Goal Creation (`newallocation.html`):** Set up annual budget allocation goals with validation.
3. **Budget Allocation Manager (`allocation.html`):**
   - Select financial goal year.
   - Live remaining goal budget calculation.
   - Allocate Main Heads with strict validation against remaining goal funds.
   - Allocate Sub Heads with strict validation against remaining main head funds.
4. **Expenditure Bill Entry (`expenditure.html`):**
   - Record departmental expenditures (Consumable & Non-Consumable).
   - Real-time remaining balance validation (prevents over-expenditure).
   - Automatic bill number generation with daily sequential numbering: `PTU/FINANCE/{DDMMYYYY}/{SERIAL4}`.
5. **Printable Bill Voucher (`bill.html`):** Formatted on-screen invoice with dedicated A4 print preview and authorization signature block.
6. **Financial Reports & Analytics (`reports.html` & `view.html`):**
   - Tabular breakdown of allocations, total expended, remaining funds, and itemized bill history.
   - Multi-format report export: **Excel (`.xlsx`)**, **PDF**, and **CSV**.
   - Department and financial year filters.

---

## 🛠️ Architecture & Tech Stack

- **Backend:** PHP 8.2+ with PDO PostgreSQL extension (`pdo_pgsql`).
- **Database:** PostgreSQL (Compatible with local PostgreSQL 13+ and Neon Serverless PostgreSQL).
- **Deployment Platform:** Vercel (using the community `@vercel/php` serverless runtime).
- **Frontend:** Vanilla HTML5, CSS3 (PTU Theme: Navy `#1e3a8a` & Gold `#facc15`), JavaScript, jQuery, Select2, SheetJS (`xlsx.full.min.js`), HTML2PDF.

---

## 🗄️ Database Setup & Migration

The complete PostgreSQL schema and seed records are located in the `database/` directory.

### Quick Migration Steps:
1. Open your PostgreSQL administration tool (Neon SQL Editor, Supabase SQL Editor, pgAdmin, or `psql`).
2. Run the master migration script:
   ```bash
   psql -h <host> -U <user> -d <dbname> -f database/migrate.sql
   ```
   *(Or copy and paste the contents of `database/migrate.sql` into your cloud database console).*
3. The script will:
   - Create tables: `departments`, `goals`, `main_heads`, `sub_heads`, `expenditures`.
   - Configure foreign key cascades and indexes.
   - Populate existing departments and baseline financial records.
   - Reconcile all identity sequences for auto-incrementing IDs.

---

## 🚀 Deployment to Vercel

### Step 1: Push Project to GitHub
```bash
git add .
git commit -m "Production release: PostgreSQL PDO migration and Vercel configuration"
git push -u origin main
```

### Step 2: Create a Free PostgreSQL Database on Neon
1. Go to [https://neon.tech](https://neon.tech) and sign up for a free account.
2. Create a new project named `budget-management`.
3. In the Neon Console, open the **SQL Editor**, paste the contents of `database/migrate.sql`, and click **Run**.
4. Go to **Dashboard**, copy your connection string (e.g., `postgresql://username:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require`).

### Step 3: Deploy on Vercel
1. Go to [https://vercel.com](https://vercel.com) and log in.
2. Click **Add New... -> Project** and import `aravindbala03112003/BUDGET-MANAGEMENT-SYSTEM`.
3. Under **Environment Variables**, add:
   - **Key:** `POSTGRES_URL`
   - **Value:** *(Paste your Neon connection string)*
4. Click **Deploy**.
5. Once deployment completes, your application is live on a secure public `.vercel.app` URL!

---

## 💻 Local Development Setup

To test the application locally:
1. Ensure PHP 8.2+ with `pdo_pgsql` is installed and PostgreSQL is running.
2. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
   Configure your local PostgreSQL credentials in `.env`.
3. Start the PHP built-in development server:
   ```bash
   php -S 127.0.0.1:8080
   ```
4. Open `http://127.0.0.1:8080` in your web browser.

---

## 🔒 Security Best Practices Implemented

- **Prepared SQL Statements:** 100% of SQL queries use PDO parameter binding, preventing SQL injection.
- **Transactional Integrity:** Row-level locking (`FOR UPDATE`) and database transactions (`BEGIN`/`COMMIT`) ensure concurrent requests cannot exceed allocated funds or create duplicate bill numbers.
- **XSS Protection:** Dynamic table generation sanitizes text using `htmlspecialchars()` with UTF-8 encoding.
- **Environment Isolation:** Zero credentials or sensitive connection strings committed to Git.
