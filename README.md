# ⚡ VNT Daily Missions Log

> **"Code. Break. Learn. Repeat."**
>
> A structured daily chronicle of full-stack engineering, system design, and software craftsmanship during my **VNT Internship**.

---

## 📊 Repository Badges

![Status](https://img.shields.io/badge/Status-Active%20%2F%20Updating%20Daily-brightgreen?style=for-the-badge&logo=github)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20MySQL-blue?style=for-the-badge&logo=react)
![Internship](https://img.shields.io/badge/Internship-VNT%20Full--Stack-orange?style=for-the-badge&logo=codeforces)

---

## 📌 Mission Overview

This repository serves as a centralized hub for all my daily deliverables, challenges, and core concepts explored during the VNT internship. 

Unlike standard monorepos, **each day's mission is a completely self-contained micro-project**. This allows for:
* 🧪 **Isolated Experimentation:** Trying new packages, lint configurations, or router structures without breaking previous days.
* 📚 **Progressive Learning:** Visually tracking the growth of codebase complexity from simple scripts to full-fledged multi-tier architectures.
* 📝 **Deep-Dive Concept Mapping:** Every directory includes a `doc.md` that captures comparisons, architecture schemas, database diagrams, and key learning takeaways.

---

## 📅 The Mission Log (Daily Index)

| Day | Date | Mission Title | Core Stack | Status | Quick Links |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **Day 1** | `2026-07-02` | **Internal Diagnostics Page** | Express, React, TS, MySQL | ✅ Complete | [📂 Code](./day1_2-7-26/) \| [📄 Docs](./day1_2-7-26/doc.md) |
| **Day 2** | `Coming Soon` | *Upcoming Challenge* | *TBD* | ⏳ Pending | `N/A` |
| **Day 3** | `Coming Soon` | *Upcoming Challenge* | *TBD* | ⏳ Pending | `N/A` |

---


## 🧰 The Technology Matrix

Here are the technologies utilized and mastered across the daily tasks:

### 💻 Frontend
* **React 19 & TypeScript:** Custom hooks, module-based CSS, strict typing.
* **Vite:** High-performance bundler and dev server.
* **React Router Dom (v7):** Declarative routing and layouts.

### ⚙️ Backend & API
* **Node.js & Express:** MVC (Model-View-Controller) architecture, custom routing, global exception handling.
* **Jest & Supertest:** Automated integration tests simulating actual HTTP requests against mock databases.

### 💾 Database & Storage
* **MySQL:** Connection pooling, transactional queries, active database checking.
* **XAMPP / Native MySQL:** Local server instances.

---

## 🚀 Quick Start Guide

Want to run any of the daily projects locally? Follow these steps:

### 1️⃣ Database Preparation
Make sure MySQL is running (e.g., via XAMPP) and create the required database.
```sql
CREATE DATABASE vnt_diagnostics;
```

### 2️⃣ Running the Backend
1. Navigate to the day's backend folder:
   ```bash
   cd day1_2-7-26/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on your database configuration:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=vnt_diagnostics
   NODE_ENV=development
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Run the test suite:
   ```bash
   npm test
   ```

### 3️⃣ Running the Frontend
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd day1_2-7-26/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

> [!NOTE]
> **Environment Variables:** Make sure the frontend's API request URL matches the backend's server port (usually `http://localhost:3000`).

> [!TIP]
> Always verify that your MySQL service is running inside XAMPP control panel before booting the backend, as the diagnostics page tracks live database connection status.