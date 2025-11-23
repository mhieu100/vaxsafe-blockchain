# NFT Vaccine Passport Feature

## Tổng Quan

Tính năng **NFT Vaccine Passport** là một hệ thống hộ chiếu vaccine Web3 hiện đại, nơi mỗi chứng nhận vaccine được mint thành NFT trên Ethereum blockchain. Hệ thống tuân theo chuẩn **FHIR R4** (Fast Healthcare Interoperability Resources) của HL7, đảm bảo tính tương thích quốc tế.

## Kiến Trúc

```
NFT Vaccine Passport
├── Frontend (React + Vite)
│   ├── Services
│   │   └── nftPassport.service.js      # API & utility functions
│   ├── Components
│   │   ├── NFTCertificateCard.jsx      # NFT card component
│   │   └── NFTDetailModal.jsx          # Detail modal with tabs
│   └── Pages
│       └── nft-passport.jsx             # Main passport page
│
├── Blockchain Integration
│   ├── Wagmi (Web3 React Hooks)
│   ├── Ganache (Local Ethereum Network)
│   └── MetaMask (Wallet Provider)
│
└── Data Standards
    └── FHIR R4 Metadata                 # HL7 Healthcare Standard
```

## Tính Năng Chính

### 1. NFT Certificate Gallery
- Hiển thị tất cả NFT vaccine certificates dạng gallery
- Mỗi card hiển thị:
  - NFT Token ID và mint date
  - Thông tin vaccine (tên, mã, nhà sản xuất)
  - Progress bar tiến độ tiêm chủng
  - Blockchain verification (transaction hash, block number)
  - Thông tin lịch hẹn cuối cùng
  - Tổng chi phí

### 2. Blockchain Verification
- Transaction hash với copy & view trên blockchain
- Block number và Chain ID
- Minted by address
- Real-time blockchain verification status

### 3. FHIR R4 Compliance
- Tuân thủ chuẩn y tế quốc tế HL7 FHIR R4
- Metadata bao gồm:
  - Immunization Resource Type
  - CVX vaccine codes
  - Patient reference
  - Practitioner (doctor) information
  - Location và organization
  - Dose quantity và administration route

### 4. Detail Modal với 4 Tabs

#### Tab 1: Tổng Quan
- NFT header với token ID
- Thông tin bệnh nhân
- Thông tin vaccine chi tiết
- QR code để xác thực

#### Tab 2: Lịch Sử Tiêm
- Timeline với tất cả các lần tiêm
- Chi tiết từng liều:
  - Ngày giờ tiêm
  - Trung tâm & địa chỉ
  - Bác sĩ & license
  - Batch number & lot number
  - Hạn sử dụng

#### Tab 3: Blockchain Info
- NFT ID & Token ID
- Transaction hash (có thể copy & view)
- Block number
- Chain ID
- Minted by address
- Smart contract verification status

#### Tab 4: FHIR Metadata
- Full FHIR R4 JSON
- FHIR compliance details
- CVX codes
- Route & site of administration
- Dose quantity

### 5. Search & Filter
- Tìm kiếm theo:
  - Tên vaccine
  - NFT ID
  - Transaction hash

### 6. Statistics Dashboard
- Tổng số NFT certificates
- Số lượng hoàn thành
- Tổng số liều tiêm
- Tổng chi phí

### 7. Export Functionality
- Export toàn bộ NFT passport data dạng JSON
- Có thể sử dụng cho backup hoặc import vào hệ thống khác

## Công Nghệ Sử Dụng

### Frontend
- **React 18.3.1** - UI framework
- **Vite 7.1.6** - Build tool
- **Ant Design 5.24.5** - UI component library
- **Tailwind CSS** - Utility-first CSS
- **Day.js** - Date formatting
- **QRCode.react** - QR code generation

### Web3 & Blockchain
- **Wagmi 2.19.0** - React Hooks for Ethereum
- **Web3.js 4.16.0** - Ethereum JavaScript API
- **Ethers 6.13.5** - Ethereum library
- **Ganache** - Local blockchain (Chain ID: 1337)
- **MetaMask** - Wallet connector

### Data Standards
- **FHIR R4** - Healthcare Interoperability Resources
- **CVX Codes** - Vaccine codes
- **HL7 Standards** - Health Level 7

## Cài Đặt & Sử Dụng

### 1. Prerequisites
```bash
# Đảm bảo đã cài đặt:
- Node.js >= 18
- MetaMask browser extension
- Ganache (running on localhost:7545)
```

### 2. Installation
```bash
# Tất cả dependencies đã được cài đặt sẵn
# Nếu cần, chạy:
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Access NFT Passport
```
URL: http://localhost:5173/nft-passport
Route: /nft-passport (Protected - requires login)
```

## File Structure

```
frontend/
├── src/
│   ├── services/
│   │   └── nftPassport.service.js          # Mock data & utilities
│   │
│   ├── components/
│   │   └── nft-passport/
│   │       ├── NFTCertificateCard.jsx      # NFT card component
│   │       └── NFTDetailModal.jsx          # Detail modal
│   │
│   ├── pages/
│   │   └── auth/
│   │       └── nft-passport.jsx            # Main page
│   │
│   ├── index.css                            # Custom NFT styles
│   └── App.jsx                              # Route configuration
│
└── NFT_PASSPORT_README.md                   # This file
```

## API Reference

### Service Functions

```javascript
// Fetch all NFT certificates
const response = await fetchNFTPassport();

// Fetch by identity number
const response = await fetchNFTPassport(identityNumber);

// Fetch single NFT by ID
const response = await fetchNFTById(nftId);

// Utility functions
formatCurrency(amount)          // Format to VND
formatAddress(address)          // Shorten blockchain address
formatTxHash(hash)             // Shorten transaction hash
copyToClipboard(text)          // Copy to clipboard
getVaccineTheme(vaccineName)   // Get color theme
```

## Mock Data Structure

### NFT Certificate Object
```javascript
{
  // NFT Metadata
  nftId: "NFT-001",
  tokenId: 1001,
  mintDate: "2025-11-27T08:00:00Z",
  mintedBy: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",

  // Patient Information
  patient: "Nguyen Van Hieu",
  identityNumber: "012345673901",

  // Vaccine Information
  vaccine: "STAMARIL phòng bệnh sốt vàng",
  vaccineCode: "J07BL01",
  manufacturer: "Sanofi Pasteur",

  // Blockchain Data
  transactionHash: "0xa9b4d074be99...",
  blockNumber: 12345,
  chainId: 1337,

  // Financial Data
  totalAmount: 8319072,
  totalDoses: 3,
  status: "COMPLETED",
  completionRate: 100,

  // Appointment Details
  appointments: [...],

  // FHIR Metadata
  fhirMetadata: {
    resourceType: "Immunization",
    status: "completed",
    vaccineCode: {...},
    patient: {...},
    // ... more FHIR fields
  }
}
```

## Styling

### Custom CSS Classes

```css
/* NFT Card */
.nft-certificate-card              # Main card styling
.nft-certificate-card:hover        # Hover effects with transform

/* Modal */
.nft-detail-modal                  # Modal styling

/* Utility Classes */
.glass-card                        # Glassmorphism effect
.nft-shimmer                       # Shimmer animation
.web3-gradient-text                # Gradient text animation
.blockchain-verified               # Verification badge
```

### Color Themes

Mỗi vaccine có theme riêng:

- **STAMARIL** (Yellow Fever): Yellow/Orange gradient
- **MenQuadfi**: Blue/Purple gradient
- **Bexsero**: Green/Teal gradient
- **Default**: Gray gradient

## Integration với Backend

### Khi tích hợp với backend thực:

1. **Update Service**
   ```javascript
   // File: src/services/nftPassport.service.js
   export const fetchNFTPassport = async (identityNumber) => {
     const response = await axios.get('/api/nft-passport', {
       params: { identityNumber }
     });
     return response.data;
   };
   ```

2. **Blockchain Integration**
   - Kết nối smart contract để mint NFT
   - Lưu transaction hash vào database
   - Sync blockchain events với backend

3. **FHIR Validation**
   - Validate FHIR metadata trước khi lưu
   - Sử dụng FHIR validators
   - Đảm bảo tuân thủ HL7 standards

## Security Considerations

1. **Blockchain Security**
   - Never expose private keys
   - Validate all transactions before signing
   - Use secure RPC endpoints in production

2. **Data Privacy**
   - Encrypt sensitive patient data
   - Only store essential info on-chain
   - Comply with HIPAA/GDPR

3. **Access Control**
   - Protected routes require authentication
   - Role-based access control (RBAC)
   - Secure API endpoints

## Testing

### Manual Testing Checklist

- [ ] NFT cards hiển thị đúng thông tin
- [ ] Blockchain verification links hoạt động
- [ ] Modal tabs load đúng data
- [ ] Search & filter hoạt động chính xác
- [ ] Copy to clipboard hoạt động
- [ ] Export JSON thành công
- [ ] QR code có thể scan
- [ ] Responsive trên mobile/tablet
- [ ] Web3 wallet connection hoạt động
- [ ] Statistics tính toán đúng

## Future Enhancements

1. **NFT Features**
   - Transfer NFT between wallets
   - Burn/revoke certificates
   - NFT marketplace for trading
   - Multi-chain support (Polygon, BSC)

2. **UI/UX**
   - 3D NFT visualization
   - AR vaccine passport
   - Animated NFT traits
   - Dark mode support

3. **Integration**
   - International vaccine registries
   - Airport verification systems
   - WHO digital health certificate
   - Healthcare provider APIs

4. **Analytics**
   - Vaccination trends dashboard
   - Geographic distribution maps
   - Vaccine effectiveness tracking
   - Adverse reaction reporting

## Troubleshooting

### Common Issues

1. **"Cannot read property 'appointments'"**
   - Check if certificate data is loaded
   - Verify mock data structure

2. **Blockchain links không hoạt động**
   - Đảm bảo Ganache đang chạy trên port 7545
   - Check transaction hash format

3. **QR code không hiển thị**
   - Verify qrcode.react dependency
   - Check transaction hash value

4. **MetaMask không kết nối**
   - Check Wagmi configuration
   - Verify network Chain ID (1337)

## Resources

- **FHIR R4 Documentation**: https://www.hl7.org/fhir/
- **CVX Codes**: https://www2.cdc.gov/vaccines/iis/iisstandards/vaccines.asp
- **Wagmi Documentation**: https://wagmi.sh
- **Ganache**: https://trufflesuite.com/ganache/

## License

This feature is part of the VaxSafe Blockchain project.

## Contact & Support

For questions or issues, please contact the development team.

---

**Developed with ❤️ for Web3 Healthcare**

Last Updated: January 2025
