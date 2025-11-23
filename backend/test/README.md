# 📰 News API Testing

## 🚀 Quick Start

### 1. Start Server
```bash
cd backend
mvn spring-boot:run
```

### 2. Get Access Token
Mở file [news.http](news.http) và gọi request đầu tiên:

```http
### 0. Login to get Access Token
POST http://localhost:8080/auth/login
Content-Type: application/json

{
  "username": "admin@vaxsafe.com",
  "password": "admin123"
}
```

Click **"Send Request"** → Copy `access_token` từ response

### 3. Update Token Variable
Tìm dòng 9 trong file news.http:
```http
@accessToken = YOUR_ACCESS_TOKEN_HERE
```

Thay bằng token vừa copy:
```http
@accessToken = eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Test API
Bây giờ bạn có thể test tất cả 60 requests trong file!

---

## 📋 File Structure

```
backend/test/
├── news.http                  # 60 API test cases (REST Client)
├── README.md                  # File này
└── ../HOW_TO_GET_TOKEN.md    # Hướng dẫn chi tiết về token
```

---

## 🔐 Authentication

### Public Endpoints (Không cần token):
- ✅ GET /news
- ✅ GET /news/featured
- ✅ GET /news/published
- ✅ GET /news/slug/{slug}
- ✅ GET /news/{id}
- ✅ GET /news/category/{category}

### Admin Endpoints (Cần token):
- 🔒 POST /news
- 🔒 PUT /news/{id}
- 🔒 DELETE /news/{id}
- 🔒 PATCH /news/{id}/publish
- 🔒 PATCH /news/{id}/unpublish

---

## 📝 Test Cases Categories

1. **Public Endpoints** (1-11) - Không cần token
2. **Filtering** (12-23) - Không cần token
3. **Sorting** (24-28) - Không cần token
4. **Pagination** (29-30) - Không cần token
5. **Create News** (31-35) - ⚠️ Cần token
6. **Update News** (36-37) - ⚠️ Cần token
7. **Publish/Unpublish** (38-40) - ⚠️ Cần token
8. **Delete** (41-42) - ⚠️ Cần token
9. **Error Testing** (43-46)
10. **View Counter** (47-48)
11. **Use Cases** (49-55)
12. **Analytics** (56-60)

---

## 💡 Quick Examples

### Test Featured News
```http
### 4. Get Featured News
GET http://localhost:8080/news/featured
```
Click "Send Request" → Xem kết quả bên phải

### Test Create News (Cần token)
```http
### 31. Create News - Basic
POST http://localhost:8080/news
Content-Type: application/json
Authorization: Bearer {{accessToken}}

{
  "title": "Vaccine HPV - Bảo vệ sức khỏe phụ nữ",
  ...
}
```
Đảm bảo đã update `@accessToken` trước!

### Test View Counter
```http
### 47. Test View Counter
GET http://localhost:8080/news/slug/loi-ich-cua-vaccine-covid-19
```
Click nhiều lần → Xem `viewCount` tăng dần

---

## ⚠️ Common Issues

### 401 Unauthorized
❌ Token chưa được set hoặc đã hết hạn
✅ Login lại và update `@accessToken`

### 403 Forbidden
❌ Tài khoản không có quyền ADMIN
✅ Dùng tài khoản `admin@vaxsafe.com`

### Connection Refused
❌ Server chưa chạy
✅ Start server: `mvn spring-boot:run`

---

## 📚 Tài liệu thêm

- [HOW_TO_GET_TOKEN.md](../HOW_TO_GET_TOKEN.md) - Hướng dẫn chi tiết về authentication
- [NEWS_API_TESTING_GUIDE.md](../NEWS_API_TESTING_GUIDE.md) - Chi tiết 18 test cases
- [README_NEWS_API.md](../README_NEWS_API.md) - Tổng quan API

---

**Happy Testing! 🚀**
