# VaxSafe Blockchain 💉⛓️

Hệ thống quản lý tiêm chủng phi tập trung, tích hợp Blockchain và chuẩn dữ liệu y tế FHIR.

## 🌟 Tính năng nổi bật
*   **Minh bạch & Bất biến:** Lưu trữ lịch sử tiêm chủng trên Blockchain (Ethereum/Ganache).
*   **Chuẩn hóa dữ liệu:** Hỗ trợ chuẩn HL7 FHIR cho khả năng tương tác dữ liệu y tế.
*   **Lưu trữ phi tập trung:** Dữ liệu chi tiết được lưu trữ trên IPFS.
*   **AI Health Advisor:** Tư vấn sức khỏe thông minh tích hợp RAG.

## 🛠️ Công nghệ sử dụng
*   **Frontend:** React, Vite, Ant Design, TailwindCSS.
*   **Backend:** Java Spring Boot, PostgreSQL, Spring AI.
*   **Blockchain Service:** Node.js, Express, Web3.js, Truffle, Ganache.
*   **Infrastructure:** Docker, AWS EC2, IPFS (Pinata).

## 🚀 Cài đặt & Chạy dự án

### 1. Yêu cầu
*   Node.js >= 18
*   Java JDK 17
*   Docker & Docker Compose

### 2. Khởi chạy Blockchain (Ganache)
```bash
# Chạy Ganache CLI qua Docker
docker run -d -p 8545:8545 trufflesuite/ganache:latest --host 0.0.0.0
```

### 3. Blockchain Service (Node.js)
```bash
cd blockchain
npm install
# Cấu hình .env (tham khảo .env.example)
npm run dev
```

### 4. Backend (Spring Boot)
```bash
cd backend
# Cấu hình application.properties (Database, API Keys)
./mvnw spring-boot:run
```

### 5. Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
*   `/blockchain`: Service giao tiếp với Smart Contract & IPFS.

## 📜 License
MIT License
