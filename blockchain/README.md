# Blockchain Service - Vaccine Booking DApp Microservice

Backend microservice để quản lý đặt lịch tiêm vaccine trên blockchain. Service này tương tác với smart contracts sử dụng Node.js, Express, Truffle và Ganache.

## 🏗️ Kiến trúc

```
┌─────────────────────────┐     ┌─────────────────────┐
│   Spring Boot Backend   │     │  Spring Boot API    │  ← Main backend (monolith)
│   (Main Application)    │     │  (Auth Provider)    │  → Issues JWT tokens
│  - PostgreSQL Database  │     └──────────┬──────────┘
│  - JWT Authentication   │                │ JWT Token
│  - Booking Management   │                ▼
└───────────┬─────────────┘     ┌─────────────────────┐
            │                   │  Blockchain Service │  ← This microservice
            │ 1. User booking   │ (Node.js + Express) │  → Verifies JWT
            │ 2. Sync to chain  │ + Smart Contracts   │  → Manages bookings on-chain
            │ 3. Store on-chain └─────────────────────┘
            ▼
┌─────────────────────────┐
│  Ethereum Blockchain    │
│  (Ganache - Local)      │
│  - BookingContract      │
│  - Immutable Records    │
│  - Appointment Tracking │
└─────────────────────────┘
```

## 🚀 Tính năng

- ✅ **JWT Authentication**: Verify HS512 tokens từ Spring Boot backend (Base64 secret)
- ✅ **Booking Synchronization**: Đồng bộ booking từ Spring PostgreSQL lên blockchain
- ✅ **Appointment Management**: Lưu trữ chi tiết lịch hẹn theo từng mũi tiêm
- ✅ **Status Updates**: Cập nhật trạng thái booking và appointments on-chain
- ✅ **RESTful API**: Endpoints để sync và query blockchain data
- ✅ **Web3.js Integration**: Tương tác với Ethereum smart contracts
- ✅ **Truffle Framework**: Smart contract development & deployment
- ✅ **Ganache**: Local blockchain testing
- ✅ **Dockerized**: Hỗ trợ chạy trên Docker và Docker Compose
- ✅ **Biome**: Linting và formatting code tự động

## 📋 Yêu cầu

- Node.js (v18 trở lên)
- npm hoặc yarn
- Docker & Docker Compose (tùy chọn)
- Ganache (GUI hoặc CLI)

## 🛠️ Cài đặt & Chạy Local

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cập nhật các biến môi trường trong `.env`:

```env
PORT=4000
NODE_ENV=development
BLOCKCHAIN_NETWORK=development
GANACHE_HOST=127.0.0.1
GANACHE_PORT=7545
GANACHE_URL=http://127.0.0.1:7545
JWT_SECRET=your_jwt_secret_here
JWT_SECRET_IS_BASE64=true
```

### 3. Compile và Deploy Smart Contracts

Đảm bảo Ganache đang chạy, sau đó:

```bash
# Compile contracts
npm run compile

# Deploy to Ganache
npm run migrate
```

### 4. Khởi chạy server

```bash
# Development mode (nodemon)
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại: `http://localhost:4000`

### 5. Linting & Formatting

Dự án sử dụng **Biome** để kiểm tra và định dạng code:

```bash
# Kiểm tra lỗi
npm run check

# Tự động sửa lỗi
npm run check:fix

# Format code
npm run format
```

## 🐳 Chạy với Docker

### 1. Build và chạy với Docker Compose

```bash
docker-compose up -d --build
```

### 2. Build Docker Image thủ công

```bash
docker build -t blockchain-service .
```

### 3. Chạy Container

```bash
docker run -p 4000:4000 --env-file .env blockchain-service
```

## 📚 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/ganache/status` | Network status |
| GET | `/api/ganache/accounts` | All Ganache accounts |
| GET | `/api/ganache/accounts/:address` | Get account balance |

### Protected Endpoints (JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/identity/create` | Create digital identity |
| POST | `/api/identity/link-document` | Link document to identity |
| GET | `/api/identity/:identityHash` | Get identity info |
| POST | `/api/vaccine-records/create` | Create vaccine record |
| GET | `/api/vaccine-records/:recordId` | Get vaccine record |
| GET | `/api/vaccine-records/identity/:identityHash` | Get records by identity |

## 🧪 Testing

Sử dụng file `api-tests.http` với VS Code REST Client extension để test các API.

## 📄 License

MIT License
