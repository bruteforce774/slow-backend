# Slow Backend Setup Guide
*(Express + Axios + MySQL/MariaDB, ES Modules)*

This document describes how to recreate a minimal but solid backend foundation:
- Node.js (installed via NVM)
- Express (API server)
- Axios (external API calls)
- MariaDB / MySQL (database)
- `mysql2` (promise-based driver)
- ES Modules (`import` / `export`)
- Environment variables via `.env`

---

## 1. Prerequisites

- Node.js installed via **NVM**
- npm available
- Fedora Linux (instructions assume Fedora defaults)
- Basic familiarity with terminal usage

Verify Node:

```bash
node -v
npm -v
```

---

## 2. Create the Node project

```bash
mkdir slow-backend
cd slow-backend
npm init -y
```

Install dependencies:

```bash
npm i express axios mysql2 dotenv
npm i -D nodemon
```

---

## 3. Enable ES Modules

Edit `package.json` and add:

```json
"type": "module"
```

Example scripts section:

```json
"scripts": {
  "dev": "nodemon server.js"
}
```

Once this is set:
- ✅ `import` / `export`
- ❌ `require`, `module.exports`

---

## 4. Install and start MariaDB (Fedora)

Install:

```bash
sudo dnf install mariadb-server
```

Start and enable:

```bash
sudo systemctl start mariadb
sudo systemctl enable mariadb
```

Verify:

```bash
systemctl status mariadb --no-pager
```

---

## 5. Secure MariaDB

Run:

```bash
sudo mysql_secure_installation
```

Recommended answers:
- Remove anonymous users → **Yes**
- Disallow remote root login → **Yes**
- Remove test database → **Yes**
- Reload privilege tables → **Yes**

> On Fedora, administrative access is always available via:
>
> ```bash
> sudo mysql
> ```

---

## 6. Create database and app user

Log in as root:

```bash
mysql -u root -p
```

Run:

```sql
CREATE DATABASE IF NOT EXISTS slow_backend;

CREATE USER IF NOT EXISTS 'slow_user'@'localhost'
IDENTIFIED BY 'strongpassword';

GRANT ALL PRIVILEGES ON slow_backend.* TO 'slow_user'@'localhost';
FLUSH PRIVILEGES;
```

Verify user access:

```bash
mysql -u slow_user -p slow_backend
```

If you see:

```text
MariaDB [slow_backend]>
```

the database setup is complete.

---

## 7. Environment variables

Create a `.env` file in the project root:

```env
DB_HOST=localhost
DB_USER=slow_user
DB_PASSWORD=strongpassword
DB_NAME=slow_backend
PORT=3000
```

These values are used by the database connection pool and server.

---

## 8. `.gitignore`

Create `.gitignore`:

```gitignore
node_modules/
.env

*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

.DS_Store
.vscode/
.idea/
```

---

## 9. Database connection (`db.js`)

```js
import dotenv from "dotenv";
import mysql from "mysql2/promise";

// Load env vars before creating the pool (important with ES modules)
dotenv.config({ path: new URL("./.env", import.meta.url) });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
```

---

## 10. Express server (`server.js`)

```js
import express from "express";
import axios from "axios";
import dotenv from "dotenv";

import pool from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", async (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get("/posts", async (req, res) => {
  try {
    const response = await axios.get(
      "https://jsonplaceholder.typicode.com/posts"
    );

    const posts = response.data.slice(0, 5).map(p => ({
      id: p.id,
      title: p.title,
    }));

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

app.get("/db-check", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ db: rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

---

## 11. Run and test

Start the server:

```bash
npm run dev
```

Test endpoints:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/posts
curl http://localhost:3000/db-check
```

Expected:
- `/health` → server OK
- `/posts` → external API data
- `/db-check` → `{ "ok": 1 }` from MySQL

---

## 12. Notes and pitfalls

- Always use a **dedicated DB user**, not root, from Node.js
- With ES modules, environment variables must be loaded **before** creating the DB pool
- If MySQL errors mention user `''`, environment variables were not loaded correctly

---

This setup is intentionally minimal and stable, designed as a base for learning and incremental expansion.
