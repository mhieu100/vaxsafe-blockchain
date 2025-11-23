# 📖 Hướng Dẫn Sử Dụng IPFS - Chi Tiết Cho Người Mới

## 🎯 IPFS là gì?

**IPFS (InterPlanetary File System)** là một hệ thống lưu trữ file phi tập trung (decentralized). Thay vì lưu file trên một server duy nhất, IPFS lưu file trên nhiều node khác nhau trên toàn thế giới.

### Tại sao dùng IPFS cho NFT?

1. **Không thể thay đổi** - Khi upload lên IPFS, data không thể sửa
2. **Vĩnh viễn** - Data tồn tại mãi mãi (miễn còn ai đó pin nó)
3. **Phi tập trung** - Không phụ thuộc vào 1 server duy nhất
4. **Content-addressed** - File được định danh bằng nội dung (CID), không phải URL

### CID là gì?

**CID (Content Identifier)** là một hash duy nhất đại diện cho file của bạn. Ví dụ:
```
QmX38fGP5gVwKfWdMufqnvHv9R4o3hXCTh8w8R9wNvVFfE
```

Giống như "địa chỉ" của file trên IPFS. Cùng một file sẽ luôn có cùng một CID.

---

## 🚀 Bắt Đầu Với Pinata

Bạn đã có Pinata API key rồi! Giờ làm theo các bước sau:

### Bước 1: Tạo File `.env`

```bash
cd /home/mhieu/Coding/vaxsafe-blockchain/frontend
cp .env.example .env
```

### Bước 2: Điền API Keys vào `.env`

Mở file `.env` và thay thế bằng API keys thật của bạn:

```bash
# .env
VITE_PINATA_API_KEY=e99585ba79a50bc5c6d5
VITE_PINATA_API_SECRET=50a12ff007df2a119b28c2026c971f79e831d40d4328f1c9fd68a46acafa54a1
```

**⚠️ LƯU Ý:**
- File `.env` đã được add vào `.gitignore` - không bị push lên Git
- KHÔNG share API keys với ai
- Keys này chỉ để development, production nên tạo keys mới

### Bước 3: Restart Dev Server

```bash
npm run dev
```

---

## 📱 Sử Dụng IPFS Management Page

### Truy cập IPFS Management

1. Start dev server: `npm run dev`
2. Login vào app
3. Navigate to: **http://localhost:5173/ipfs-management**

### Giao diện có 3 tabs:

#### **Tab 1: Upload to IPFS** 📤

**Chức năng:** Upload vaccine certificates lên IPFS

**Cách dùng:**
1. Chọn IPFS Provider (Pinata/NFT.Storage/Web3.Storage)
2. Click **"Upload All Certificates"** để upload tất cả
3. Hoặc click **"Upload to IPFS"** trên từng certificate riêng lẻ

**Kết quả sẽ có:**
- ✅ IPFS CID: `QmXxxxxx...`
- ✅ IPFS URI: `ipfs://QmXxxxxx...` (dùng cho NFT)
- ✅ Gateway URL: `https://gateway.pinata.cloud/ipfs/QmXxxxx...`

#### **Tab 2: View from IPFS** 🔍

**Chức năng:** Xem dữ liệu đã upload lên IPFS

**Cách dùng:**
1. Nhập IPFS CID (ví dụ: `QmX38fGP5gVwKfWdMufqnvHv9R4o3hXCTh8w8R9wNvVFfE`)
2. Click **"Fetch"**
3. Xem metadata của NFT

**Có thể xem:**
- Overview: Thông tin tổng quan
- Raw JSON: Toàn bộ metadata dạng JSON

#### **Tab 3: Documentation** 📚

Tài liệu hướng dẫn chi tiết về IPFS.

---

## 💡 Ví Dụ Thực Tế

### Ví dụ 1: Upload một certificate

```javascript
// Trong code (hoặc dùng UI)
import { uploadCertificateToIPFS } from './services/ipfs.service';

// Lấy certificate data
const certificate = {
  nftId: "NFT-001",
  patient: "Nguyen Van Hieu",
  vaccine: "STAMARIL",
  // ... data khác
};

// Upload lên IPFS
const result = await uploadCertificateToIPFS(certificate, 'pinata');

console.log('IPFS CID:', result.cid);
// Output: QmX38fGP5gVwKfWdMufqnvHv9R4o3hXCTh8w8R9wNvVFfE

console.log('IPFS URI:', result.ipfsUri);
// Output: ipfs://QmX38fGP5gVwKfWdMufqnvHv9R4o3hXCTh8w8R9wNvVFfE

console.log('Gateway URL:', result.ipfsUrl);
// Output: https://gateway.pinata.cloud/ipfs/QmX38fGP5gVwKfWdMufqnvHv9R4o3hXCTh8w8R9wNvVFfE
```

### Ví dụ 2: Xem data từ IPFS

```javascript
import { fetchFromIPFS } from './services/ipfs.service';

// Lấy data từ CID
const cid = 'QmX38fGP5gVwKfWdMufqnvHv9R4o3hXCTh8w8R9wNvVFfE';
const result = await fetchFromIPFS(cid);

console.log('Metadata:', result.data);
// Output: { name: "Vaccine Certificate - STAMARIL", ... }
```

### Ví dụ 3: Dùng với NFT Smart Contract

Sau khi upload lên IPFS, bạn dùng IPFS URI để mint NFT:

```solidity
// Solidity Smart Contract
function mintVaccineCertificate(
    address to,
    uint256 tokenId,
    string memory ipfsUri  // ipfs://QmXxx...
) public {
    _mint(to, tokenId);
    _setTokenURI(tokenId, ipfsUri);
}
```

```javascript
// Frontend - Gọi smart contract
const ipfsResult = await uploadCertificateToIPFS(certificate);

// Mint NFT với IPFS URI
await contract.mintVaccineCertificate(
    patientAddress,
    tokenId,
    ipfsResult.ipfsUri  // ipfs://QmXxx...
);
```

---

## 🔄 Flow Hoàn Chỉnh

```
1️⃣ Vaccine Certificate Data (từ backend)
    ↓
2️⃣ Transform sang NFT Metadata (OpenSea standard)
    ↓
3️⃣ Upload lên IPFS qua Pinata
    ↓
4️⃣ Nhận được CID: QmXxxxxx
    ↓
5️⃣ Mint NFT với tokenURI = ipfs://QmXxxxxx
    ↓
6️⃣ NFT hiển thị trên OpenSea/Rarible tự động
```

---

## 📊 Data Structure

### Dữ liệu gốc (Vaccine Certificate)

```json
{
  "nftId": "NFT-001",
  "patient": "Nguyen Van Hieu",
  "vaccine": "STAMARIL phòng bệnh sốt vàng",
  "totalDoses": 3,
  "appointments": [
    {
      "doseNumber": 1,
      "date": "2025-11-27",
      "doctor": "Bác sĩ Nguyễn Văn A"
    }
  ],
  "transactionHash": "0xa9b4d074be99...",
  "fhirMetadata": { ... }
}
```

### Sau khi transform thành NFT Metadata

```json
{
  "name": "Vaccine Certificate - STAMARIL",
  "description": "NFT Vaccine Certificate for Nguyen Van Hieu...",
  "image": "https://yourapp.com/certificate-image/NFT-001",
  "external_url": "https://yourapp.com/nft-passport/NFT-001",

  "attributes": [
    {
      "trait_type": "Vaccine",
      "value": "STAMARIL phòng bệnh sốt vàng"
    },
    {
      "trait_type": "Total Doses",
      "value": 3,
      "display_type": "number"
    },
    {
      "trait_type": "Status",
      "value": "COMPLETED"
    }
  ],

  "properties": {
    "certificate": { ... },
    "patient": { ... },
    "vaccine": { ... },
    "appointments": [ ... ],
    "fhir": { ...FHIR R4... }
  },

  "verification": {
    "blockchain": "Ethereum",
    "transactionHash": "0xa9b4d074be99...",
    "blockNumber": 12345
  }
}
```

Cấu trúc này tuân thủ:
- ✅ **OpenSea Metadata Standards**
- ✅ **ERC-721 NFT Standard**
- ✅ **FHIR R4 Healthcare Standard**

---

## 🌐 IPFS Gateways

Sau khi upload lên IPFS, bạn có thể truy cập data qua nhiều gateways:

### Primary Gateway (Pinata)
```
https://gateway.pinata.cloud/ipfs/QmXxxxxx
```

### Public Gateways
```
https://ipfs.io/ipfs/QmXxxxxx
https://cloudflare-ipfs.com/ipfs/QmXxxxxx
https://dweb.link/ipfs/QmXxxxxx
```

### IPFS Protocol
```
ipfs://QmXxxxxx
```
Dùng cho NFT `tokenURI` - NFT marketplaces sẽ tự động resolve.

---

## 🎨 Xem NFT Trên OpenSea

Sau khi mint NFT với IPFS URI:

1. **OpenSea tự động fetch metadata** từ IPFS
2. **Hiển thị:**
   - Name: "Vaccine Certificate - STAMARIL"
   - Description
   - Image (nếu có)
   - Attributes (hiển thị dạng traits)
   - Properties (custom data)

3. **User có thể:**
   - View full vaccine history
   - Verify on blockchain
   - Transfer NFT
   - List for sale (nếu muốn)

---

## 🔐 Best Practices

### 1. **Privacy & Security**

```javascript
// ❌ KHÔNG nên upload dữ liệu nhạy cảm trực tiếp
const metadata = {
  patient: {
    name: "Nguyen Van Hieu",
    ssn: "012345673901",        // ⚠️ Sensitive!
    phone: "0123456789",         // ⚠️ Sensitive!
    address: "123 Main St..."    // ⚠️ Sensitive!
  }
};

// ✅ NÊN hash hoặc encrypt
const metadata = {
  patient: {
    nameHash: sha256("Nguyen Van Hieu"),
    ssnHash: sha256("012345673901"),
    // Hoặc encrypt
    encryptedData: encrypt(sensitiveData, publicKey)
  }
};
```

### 2. **Backup CID**

```javascript
// LUÔN lưu CID vào database
const result = await uploadCertificateToIPFS(certificate);

await db.certificates.update({
  nftId: certificate.nftId,
  ipfsCid: result.cid,
  ipfsUri: result.ipfsUri,
  ipfsUrl: result.ipfsUrl,
  uploadedAt: new Date()
});
```

### 3. **Pin Content**

```javascript
// Pin để đảm bảo data luôn available
import { pinContent } from './services/ipfs.service';

await pinContent(cid);
```

### 4. **Multiple Gateways**

Nếu một gateway down, dùng gateway khác:

```javascript
const gateways = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/'
];

async function fetchWithFallback(cid) {
  for (const gateway of gateways) {
    try {
      const response = await fetch(`${gateway}${cid}`);
      return await response.json();
    } catch (error) {
      continue; // Try next gateway
    }
  }
  throw new Error('All gateways failed');
}
```

---

## 🐛 Troubleshooting

### Lỗi: "Failed to upload to IPFS"

**Nguyên nhân:**
- API key sai
- Hết quota
- Network issue

**Giải pháp:**
1. Check API key trong `.env`
2. Login vào Pinata dashboard xem quota
3. Check internet connection
4. Thử provider khác (NFT.Storage, Web3.Storage)

### Lỗi: "Cannot fetch from IPFS"

**Nguyên nhân:**
- CID sai
- Content chưa propagate (mới upload)
- Gateway down

**Giải pháp:**
1. Kiểm tra CID có đúng format không
2. Đợi vài phút để content propagate
3. Thử gateway khác
4. Check Pinata dashboard xem file có được pin không

### Lỗi: "NFT marketplace không hiển thị metadata"

**Nguyên nhân:**
- tokenURI sai format
- Metadata không đúng chuẩn OpenSea
- Chưa propagate

**Giải pháp:**
1. Đảm bảo tokenURI = `ipfs://CID` (không phải HTTP URL)
2. Validate metadata structure
3. Manually refresh metadata trên OpenSea
4. Đợi vài phút

---

## 💰 Pricing

### Pinata
- **Free Tier:** 1 GB storage, unlimited bandwidth
- **Paid:** Từ $20/month
- **Best for:** Production apps

### NFT.Storage
- **Free:** Unlimited storage cho NFTs
- **Best for:** NFT projects với budget limited

### Web3.Storage
- **Free:** 100 GB upload/month
- **Best for:** Long-term archival

---

## 📞 Support

Nếu gặp vấn đề:

1. **Check documentation:**
   - [IPFS_INTEGRATION_README.md](./IPFS_INTEGRATION_README.md)
   - [Pinata Docs](https://docs.pinata.cloud)
   - [IPFS Docs](https://docs.ipfs.tech)

2. **Check code:**
   - Service: [src/services/ipfs.service.js](src/services/ipfs.service.js)
   - Components: [src/components/nft-passport/](src/components/nft-passport/)

3. **Test trong console:**
   ```javascript
   // Open browser console trên trang IPFS Management
   import { uploadCertificateToIPFS } from './services/ipfs.service';

   // Test upload
   const result = await uploadCertificateToIPFS(mockData);
   console.log(result);
   ```

---

## 🎓 Học Thêm

### Video Tutorials
- **IPFS Introduction:** https://www.youtube.com/watch?v=5Uj6uR3fp-U
- **NFT Metadata:** https://www.youtube.com/watch?v=YPbgjPPC1d0

### Documentation
- **IPFS Official:** https://docs.ipfs.tech
- **Pinata Guide:** https://docs.pinata.cloud/docs
- **OpenSea Metadata:** https://docs.opensea.io/docs/metadata-standards
- **ERC-721:** https://eips.ethereum.org/EIPS/eip-721

### Community
- **IPFS Discord:** https://discord.gg/ipfs
- **Pinata Community:** https://pinata.cloud/community

---

## ✅ Checklist Setup

- [ ] Copy `.env.example` to `.env`
- [ ] Fill in Pinata API keys
- [ ] Restart dev server
- [ ] Navigate to `/ipfs-management`
- [ ] Try upload một certificate
- [ ] Check result có CID
- [ ] Try fetch lại bằng CID
- [ ] View metadata JSON
- [ ] (Optional) Integrate với smart contract

---

**Happy IPFS-ing! 🚀**

Nếu cần help thêm, hãy hỏi!
