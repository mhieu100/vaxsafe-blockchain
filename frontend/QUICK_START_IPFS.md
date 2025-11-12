# ⚡ Quick Start - IPFS trong 5 Phút

## Bạn đã có Pinata API key? Let's go! 🚀

### Bước 1: Setup (30 giây)

```bash
# Copy file .env.example
cd /home/mhieu/Coding/vaxsafe-blockchain/frontend
cp .env.example .env

# Edit file .env và điền API keys
# Mở .env bằng text editor và paste keys của bạn
```

File `.env` sẽ trông như này:
```bash
VITE_PINATA_API_KEY=e99585ba79a50bc5c6d5
VITE_PINATA_API_SECRET=50a12ff007df2a119b28c2026c971f79e831d40d4328f1c9fd68a46acafa54a1
```

### Bước 2: Restart Server (10 giây)

```bash
npm run dev
```

### Bước 3: Truy cập IPFS Management (1 phút)

1. Mở browser: **http://localhost:5173**
2. Login vào app
3. Navigate to: **http://localhost:5173/ipfs-management**

### Bước 4: Upload Certificate (1 phút)

1. Chọn tab **"Upload to IPFS"**
2. Provider để mặc định: **Pinata**
3. Click **"Upload All Certificates (3)"**
4. Đợi vài giây...
5. ✅ Xong! Bạn sẽ thấy:

```
✅ Uploaded!
IPFS CID: QmX38fGP5gVwKfWdMufqnvHv9R4o3hXCTh8w8R9wNvVFfE
IPFS URI: ipfs://QmX38fGP5gVwKfWdMufqnvHv9R4o3hXCTh8w8R9wNvVFfE
Gateway URL: https://gateway.pinata.cloud/ipfs/QmX38fGP5gVwKfWdMufqnvHv9R4o3hXCTh8w8R9wNvVFfE
```

### Bước 5: Xem Data Trên IPFS (30 giây)

1. Copy CID: `QmX38fGP5gVwKfWdMufqnvHv9R4o3hXCTh8w8R9wNvVFfE`
2. Chuyển sang tab **"View from IPFS"**
3. Paste CID vào ô input
4. Click **"Fetch"**
5. ✅ Xem metadata của NFT!

---

## 🎯 Bạn vừa làm gì?

1. **Upload** vaccine certificate lên IPFS
2. **Nhận** CID (địa chỉ của data trên IPFS)
3. **Xác thực** data có thể fetch được từ IPFS

---

## 🔥 Tiếp theo làm gì?

### Option 1: Mint NFT với IPFS URI

```javascript
// Dùng CID để mint NFT
await contract.mintCertificate(
    patientAddress,
    tokenId,
    "ipfs://QmX38fGP5gVwKfWdMufqnvHv9R4o3hXCTh8w8R9wNvVFfE"
);
```

### Option 2: View trên OpenSea

Sau khi mint NFT, OpenSea sẽ tự động:
1. Fetch metadata từ IPFS
2. Hiển thị vaccine certificate info
3. Show attributes (vaccine, doses, status)

### Option 3: Share với ai đó

```
Gateway URL:
https://gateway.pinata.cloud/ipfs/QmX38fGP5gVwKfWdMufqnvHv9R4o3hXCTh8w8R9wNvVFfE

→ Ai cũng có thể xem metadata bằng URL này!
```

---

## 📱 UI Navigation

```
/ipfs-management
├── Tab 1: Upload to IPFS      ← Upload certificates
├── Tab 2: View from IPFS       ← Fetch & view data
└── Tab 3: Documentation        ← Chi tiết về IPFS
```

---

## 💡 Cheat Sheet

```bash
# What you uploaded
Vaccine Certificate Data (JSON)

# What you got
IPFS CID: QmXxxxxx...
IPFS URI: ipfs://QmXxxxxx...
Gateway URL: https://gateway.pinata.cloud/ipfs/QmXxxxxx...

# How to use
1. Store CID in database
2. Use IPFS URI for NFT tokenURI
3. Share Gateway URL publicly
```

---

## 🆘 Problems?

### "Upload failed"
- Check API keys trong `.env`
- Restart dev server
- Check internet connection

### "Cannot fetch"
- Đợi 1-2 phút (IPFS propagation)
- Thử gateway khác
- Check CID có đúng không

### "Need help"
- Đọc: [IPFS_GUIDE.md](./IPFS_GUIDE.md) (detailed guide)
- Đọc: [IPFS_INTEGRATION_README.md](./IPFS_INTEGRATION_README.md) (technical docs)

---

**That's it! Bạn đã biết cách dùng IPFS! 🎉**

Để hiểu sâu hơn, đọc [IPFS_GUIDE.md](./IPFS_GUIDE.md)
