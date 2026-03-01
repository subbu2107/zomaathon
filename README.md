# 🍕 Zomathon - Full Stack Food Delivery Platform

Zomathon is a high-performance, real-time food ordering and delivery platform built with a modern tech stack. It replicates the core features of apps like Zomato, including restaurant discovery, real-time order tracking, and a multi-role dashboard.

## 🚀 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS 4, Framer Motion, Lucide React
- **Backend**: Python Flask, Flask-SQLAlchemy, Flask-SocketIO (WebSockets)
- **Database**: MySQL 8.0
- **Auth**: JWT (JSON Web Tokens) with Role-Based Access Control
- **Real-time**: Socket.io for live order status updates

---

## ✨ Features

### 👤 User Features
- **Smart Auth**: Register/Login with JWT and persistence.
- **Discovery**: Search restaurants by name, cuisine, or rating.
- **Cart Engine**: Persistent cart with multi-restaurant validation.
- **Checkout**: Address management and multiple payment options (COD/Online).
- **Live Tracking**: Real-time order status updates via WebSockets.

### 🏪 Restaurant Owner Panel
- **Store Management**: Create and manage restaurant profiles.
- **Menu Control**: Add/Edit/Delete food items with pricing and images.
- **Live Orders**: Real-time dashboard to accept and process orders.

### 🛡️ Admin Panel
- **Global Overview**: Manage all users and restaurants.
- **Approvals**: Audit and approve new restaurant listings.

---

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- MySQL Server

### 1. Backend Setup
```bash
cd server
python -m venv venv
source venv/bin/activate  # venv\Scripts\activate on Windows
pip install -r requirements.txt
```
- Create a `.env` file based on the template.
- Run migrations or initialize DB using `schema.sql`.
- Start the server: `python run.py`

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```

### 3. Docker Deployment (Recommended)
```bash
docker-compose up --build
```
Access the app at `http://localhost:3000`.

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | User Registration | None |
| POST | `/api/auth/login` | User Login & JWT Issuance | None |
| GET | `/api/restaurants/` | List Restaurants | None |
| GET | `/api/restaurants/:id` | Restaurant Details | None |
| POST | `/api/orders/` | Place a New Order | JWT |
| GET | `/api/orders/history` | User Order History | JWT |
| PUT | `/api/orders/:id/status`| Update Order Status | JWT (Owner/Admin) |

---

## 📂 Project Structure

```text
Zomathon/
├── client/          # React Frontend (Vite)
│   ├── src/
│   │   ├── store/   # Context API States
│   │   ├── pages/   # Premium UI Pages
│   │   └── components/ # Reusable UI
├── server/          # Flask Backend
│   ├── app/
│   │   ├── models/  # SQLAlchemy ORM Models
│   │   ├── routes/  # API Blueprints
│   │   └── middleware/ # Auth & RBAC
├── docker-compose.yml # Container Orchestration
└── schema.sql       # MySQL Database Schema
```

---

## 🛡️ License
MIT License. Created with ❤️ by Antigravity.
