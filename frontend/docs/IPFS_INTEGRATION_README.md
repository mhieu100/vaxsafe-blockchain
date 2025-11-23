# IPFS Integration for NFT Vaccine Certificates

## Tổng Quan

Hệ thống lưu trữ metadata của NFT vaccine certificates trên **IPFS** (InterPlanetary File System) - một mạng lưu trữ phi tập trung. Điều này đảm bảo dữ liệu vaccine certificate của bạn:

- ✅ **Không thể thay đổi** (Immutable)
- ✅ **Phi tập trung** (Decentralized)
- ✅ **Vĩnh viễn** (Permanent)
- ✅ **Có thể xác thực** (Verifiable)
- ✅ **Tuân thủ chuẩn NFT** (ERC-721/OpenSea compatible)

## Kiến Trúc

```
┌─────────────────┐
│ Vaccine Data    │
│ + FHIR Metadata │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Transform to    │
│ NFT Metadata    │  (OpenSea Standard)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Upload to IPFS  │
│ (Pinata/NFT.    │
│  Storage/Web3)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Get IPFS CID    │  (Content Identifier)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Mint NFT with   │
│ ipfs://CID      │  (Smart Contract)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ NFT Marketplaces│
│ Display Metadata│  (OpenSea, Rarible)
└─────────────────┘
```

## Files Created

### 1. Core Service
- **[src/services/ipfs.service.js](src/services/ipfs.service.js)** - IPFS integration service
  - Upload to Pinata/NFT.Storage/Web3.Storage
  - Fetch from IPFS via CID
  - Transform vaccine data to NFT metadata
  - Pin/unpin content
  - Generate gateway URLs

### 2. Components
- **[src/components/nft-passport/IPFSUploader.jsx](src/components/nft-passport/IPFSUploader.jsx)** - Upload certificates to IPFS
- **[src/components/nft-passport/IPFSViewer.jsx](src/components/nft-passport/IPFSViewer.jsx)** - View/fetch data from IPFS

### 3. Pages
- **[src/pages/auth/ipfs-management.jsx](src/pages/auth/ipfs-management.jsx)** - Full IPFS management interface

### 4. Routing
- Route added: `/ipfs-management` (protected)

## NFT Metadata Structure

Vaccine certificate được transform thành NFT metadata tuân theo chuẩn **OpenSea**:

```json
{
  "name": "Vaccine Certificate - STAMARIL phòng bệnh sốt vàng",
  "description": "NFT Vaccine Certificate for Nguyen Van Hieu...",
  "image": "https://yourapp.com/api/certificate-image/NFT-001",
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
    },
    {
      "trait_type": "Mint Date",
      "value": "2025-11-27T08:00:00Z",
      "display_type": "date"
    }
  ],

  "properties": {
    "certificate": {
      "nftId": "NFT-001",
      "tokenId": 1001,
      "transactionHash": "0xa9b4d074be99...",
      "blockNumber": 12345
    },
    "patient": {
      "name": "Nguyen Van Hieu",
      "identityNumber": "012345673901"
    },
    "vaccine": {
      "name": "STAMARIL phòng bệnh sốt vàng",
      "code": "J07BL01",
      "manufacturer": "Sanofi Pasteur"
    },
    "appointments": [
      {
        "doseNumber": 1,
        "date": "2025-11-27",
        "center": "VNVC Hoàng Văn Thụ",
        "doctor": "Bác sĩ Nguyễn Văn A",
        "batchNumber": "VAX-2025-001"
      }
    ],
    "fhir": {
      "resourceType": "Immunization",
      "status": "completed",
      "vaccineCode": { ... }
    }
  },

  "verification": {
    "blockchain": "Ethereum",
    "chainId": 1337,
    "transactionHash": "0xa9b4d074be99...",
    "blockNumber": 12345,
    "verificationUrl": "https://yourapp.com/verify/0xa9b4d074be99..."
  },

  "standards": {
    "nft": "ERC-721",
    "healthcare": "FHIR R4 (HL7)",
    "metadata": "OpenSea Metadata Standards"
  }
}
```

## Setup & Configuration

### 1. Environment Variables

Tạo file `.env` trong thư mục `frontend/`:

```bash
# Pinata (Recommended for production)
VITE_PINATA_API_KEY=your_pinata_api_key_here
VITE_PINATA_API_SECRET=your_pinata_secret_here

# NFT.Storage (Free alternative)
VITE_NFT_STORAGE_API_KEY=your_nft_storage_api_key_here

# Web3.Storage (Free, Filecoin-backed)
VITE_WEB3_STORAGE_API_KEY=your_web3_storage_api_key_here
```

**Note:** Vite sử dụng `VITE_` prefix thay vì `REACT_APP_` cho environment variables.

### 2. Get API Keys

#### Option 1: Pinata (Recommended)
1. Đăng ký tại: https://www.pinata.cloud/
2. Vào Dashboard → API Keys
3. Tạo new API key với quyền:
   - `pinFileToIPFS`
   - `pinJSONToIPFS`
   - `pinByHash`
4. Copy API Key và API Secret vào `.env`

**Free Tier:**
- 1 GB storage
- Unlimited bandwidth
- Perfect for development

**Paid Plans:** From $20/month

#### Option 2: NFT.Storage (Free)
1. Đăng ký tại: https://nft.storage/
2. Vào Account → API Keys
3. Create new API key
4. Copy vào `.env`

**Features:**
- ✅ Unlimited storage for NFTs
- ✅ Free forever
- ✅ Backed by Protocol Labs & Filecoin

#### Option 3: Web3.Storage (Free)
1. Đăng ký tại: https://web3.storage/
2. Create API token
3. Copy vào `.env`

**Features:**
- ✅ Free with generous limits
- ✅ Backed by Filecoin
- ✅ Good for archival storage

## Usage

### 1. Access IPFS Management Page

```
URL: http://localhost:5173/ipfs-management
```

Trang này cung cấp 3 tabs:
1. **Upload to IPFS** - Upload certificates
2. **View from IPFS** - Fetch và xem data từ CID
3. **Documentation** - Hướng dẫn chi tiết

### 2. Upload Certificate to IPFS

#### Via UI:
```javascript
// Automatically handled by IPFSUploader component
// Just click "Upload All Certificates" or upload individual ones
```

#### Programmatically:
```javascript
import { uploadCertificateToIPFS } from './services/ipfs.service';

// Upload single certificate
const result = await uploadCertificateToIPFS(certificate, 'pinata');

if (result.success) {
  console.log('IPFS CID:', result.cid);
  console.log('IPFS URI:', result.ipfsUri); // ipfs://QmXxx...
  console.log('Gateway URL:', result.ipfsUrl);

  // Use result.ipfsUri when minting NFT
  await mintNFT(tokenId, result.ipfsUri);
}
```

#### Batch Upload:
```javascript
import { batchUploadToIPFS } from './services/ipfs.service';

const result = await batchUploadToIPFS(certificates, 'pinata');

console.log(`Uploaded ${result.successful}/${result.total} certificates`);
result.results.forEach(r => {
  if (r.success) {
    console.log(`NFT #${r.tokenId}: ${r.ipfsUri}`);
  }
});
```

### 3. Fetch from IPFS

```javascript
import { fetchFromIPFS } from './services/ipfs.service';

// Fetch by CID
const result = await fetchFromIPFS('QmXxxxxxxxxxxx');

if (result.success) {
  console.log('Metadata:', result.data);
  console.log('Name:', result.data.name);
  console.log('Attributes:', result.data.attributes);
}
```

### 4. Resolve IPFS URI

```javascript
import { resolveIPFSUri } from './services/ipfs.service';

// Convert ipfs:// to HTTP
const httpUrl = resolveIPFSUri('ipfs://QmXxxx...');
// Returns: https://gateway.pinata.cloud/ipfs/QmXxxx...

// Use in img tags
<img src={resolveIPFSUri(nft.image)} alt="Certificate" />
```

## Smart Contract Integration

### Solidity Example

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VaccineCertificateNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    // Mapping from patient identity to token IDs
    mapping(string => uint256[]) private _patientCertificates;

    constructor() ERC721("VaccineCertificate", "VCERT") {}

    /**
     * Mint a new vaccine certificate NFT
     * @param to Patient's wallet address
     * @param identityNumber Patient's identity number
     * @param ipfsUri IPFS URI from ipfs.service.js (ipfs://QmXxx...)
     */
    function mintCertificate(
        address to,
        string memory identityNumber,
        string memory ipfsUri
    ) public onlyOwner returns (uint256) {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, ipfsUri);

        // Track patient's certificates
        _patientCertificates[identityNumber].push(newTokenId);

        emit CertificateMinted(to, newTokenId, identityNumber, ipfsUri);

        return newTokenId;
    }

    /**
     * Get all certificate token IDs for a patient
     */
    function getCertificatesByPatient(string memory identityNumber)
        public
        view
        returns (uint256[] memory)
    {
        return _patientCertificates[identityNumber];
    }

    /**
     * Get certificate metadata URI
     */
    function getCertificateURI(uint256 tokenId)
        public
        view
        returns (string memory)
    {
        return tokenURI(tokenId);
    }

    event CertificateMinted(
        address indexed to,
        uint256 indexed tokenId,
        string identityNumber,
        string ipfsUri
    );
}
```

### Integration với Frontend

```javascript
// 1. Upload certificate to IPFS
const ipfsResult = await uploadCertificateToIPFS(certificate, 'pinata');

if (!ipfsResult.success) {
  throw new Error('Failed to upload to IPFS');
}

// 2. Mint NFT with IPFS URI
const contract = new ethers.Contract(
  contractAddress,
  contractABI,
  signer
);

const tx = await contract.mintCertificate(
  patientAddress,
  certificate.identityNumber,
  ipfsResult.ipfsUri  // ipfs://QmXxx...
);

await tx.wait();

console.log('NFT minted with IPFS metadata!');
console.log('Transaction:', tx.hash);
console.log('IPFS CID:', ipfsResult.cid);
```

## IPFS Gateways

Dữ liệu IPFS có thể truy cập qua nhiều gateways:

### Public Gateways
```
https://ipfs.io/ipfs/{CID}
https://cloudflare-ipfs.com/ipfs/{CID}
https://gateway.pinata.cloud/ipfs/{CID}
https://dweb.link/ipfs/{CID}
https://nftstorage.link/ipfs/{CID}
https://w3s.link/ipfs/{CID}
```

### Private/Custom Gateway
Nếu bạn chạy IPFS node riêng:
```
http://localhost:8080/ipfs/{CID}
```

## API Reference

### `uploadCertificateToIPFS(certificate, provider)`
Upload một certificate lên IPFS.

**Parameters:**
- `certificate` (Object) - Vaccine certificate object
- `provider` (String) - 'pinata' | 'nft-storage' | 'web3-storage'

**Returns:**
```javascript
{
  success: true,
  cid: "QmXxxxxxxxxxx",
  ipfsUrl: "https://gateway.pinata.cloud/ipfs/QmXxx...",
  ipfsUri: "ipfs://QmXxx...",
  metadata: { ... }  // Transformed NFT metadata
}
```

### `batchUploadToIPFS(certificates, provider)`
Upload nhiều certificates cùng lúc.

**Parameters:**
- `certificates` (Array) - Array of certificate objects
- `provider` (String) - IPFS provider

**Returns:**
```javascript
{
  success: true,
  total: 3,
  successful: 3,
  failed: 0,
  results: [
    { nftId: "NFT-001", success: true, cid: "QmXxx...", ... },
    { nftId: "NFT-002", success: true, cid: "QmYyy...", ... },
    { nftId: "NFT-003", success: true, cid: "QmZzz...", ... }
  ]
}
```

### `fetchFromIPFS(cid, gatewayUrl?)`
Lấy dữ liệu từ IPFS qua CID.

**Parameters:**
- `cid` (String) - IPFS Content Identifier
- `gatewayUrl` (String, optional) - Custom gateway URL

**Returns:**
```javascript
{
  success: true,
  data: { ... },  // NFT metadata
  cid: "QmXxx...",
  url: "https://gateway.pinata.cloud/ipfs/QmXxx..."
}
```

### `resolveIPFSUri(ipfsUri, gatewayUrl?)`
Convert IPFS URI sang HTTP URL.

**Parameters:**
- `ipfsUri` (String) - IPFS URI (ipfs://..., /ipfs/..., or CID)
- `gatewayUrl` (String, optional) - Custom gateway

**Returns:** `string` - HTTP URL

### `transformToNFTMetadata(certificate)`
Transform vaccine certificate thành NFT metadata standard.

**Returns:** Object - OpenSea-compatible metadata

### `pinContent(cid)`
Pin một CID để giữ nó available trên IPFS.

### `listPinnedContent()`
List tất cả content đã pin (Pinata only).

## Best Practices

### 1. Data Privacy
```javascript
// ❌ DON'T: Upload raw sensitive data
const metadata = {
  patient: {
    name: "Nguyen Van Hieu",
    ssn: "012345673901",  // Sensitive!
    phone: "0123456789"    // Sensitive!
  }
};

// ✅ DO: Hash or encrypt sensitive fields
const metadata = {
  patient: {
    nameHash: sha256("Nguyen Van Hieu"),
    identityHash: sha256("012345673901"),
    // Or use encryption
    encryptedData: encrypt(sensitiveData, publicKey)
  }
};
```

### 2. Backup CIDs
```javascript
// Always save CID to database after upload
const ipfsResult = await uploadCertificateToIPFS(certificate);

await db.certificates.update({
  nftId: certificate.nftId,
  ipfsCid: ipfsResult.cid,
  ipfsUri: ipfsResult.ipfsUri,
  uploadedAt: new Date()
});
```

### 3. Multiple Gateways
```javascript
// Use multiple gateways for redundancy
const gateways = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/'
];

async function fetchWithFallback(cid) {
  for (const gateway of gateways) {
    try {
      const response = await axios.get(`${gateway}${cid}`);
      return response.data;
    } catch (error) {
      continue;  // Try next gateway
    }
  }
  throw new Error('All gateways failed');
}
```

### 4. Pin Important Data
```javascript
// Pin certificates to ensure they stay available
await pinContent(ipfsResult.cid);

// Check pinned status periodically
const pins = await listPinnedContent();
console.log(`Currently pinning ${pins.length} files`);
```

### 5. Validate Before Upload
```javascript
// Validate certificate data before uploading
function validateCertificate(cert) {
  if (!cert.patient || !cert.vaccine) {
    throw new Error('Missing required fields');
  }
  if (cert.appointments.length === 0) {
    throw new Error('No appointments found');
  }
  // FHIR validation
  if (!cert.fhirMetadata || !cert.fhirMetadata.resourceType) {
    throw new Error('Invalid FHIR metadata');
  }
  return true;
}

validateCertificate(certificate);
const result = await uploadCertificateToIPFS(certificate);
```

## Troubleshooting

### Issue: "Failed to upload to IPFS"
**Solutions:**
- Check API keys in `.env`
- Verify network connection
- Check Pinata/NFT.Storage dashboard for account status
- Try alternative provider

### Issue: "Cannot fetch from IPFS"
**Solutions:**
- CID might be invalid
- Content not pinned (may take time to propagate)
- Try different gateway
- Check if content was actually uploaded

### Issue: "Upload slow or timeout"
**Solutions:**
- Reduce data size (don't upload large images to JSON)
- Use batch upload with delays between requests
- Upgrade to paid Pinata plan for faster uploads

### Issue: "NFT marketplaces not showing metadata"
**Solutions:**
- Ensure tokenURI is set correctly (ipfs://CID)
- Metadata must follow OpenSea standards
- Wait for IPFS propagation (can take minutes)
- Manually refresh metadata on OpenSea

## Cost Analysis

| Provider | Free Tier | Paid Plans | Best For |
|----------|-----------|------------|----------|
| **Pinata** | 1 GB, 100K requests/month | From $20/month | Production apps, needs reliability |
| **NFT.Storage** | Unlimited for NFTs | Free forever | NFT projects, cost-sensitive |
| **Web3.Storage** | 100 GB upload/month | Free | Long-term archival |
| **Self-hosted IPFS** | Server costs only | ~$5-20/month | Full control, privacy |

## Resources

- **IPFS Official**: https://ipfs.io
- **Pinata Docs**: https://docs.pinata.cloud
- **NFT.Storage**: https://nft.storage/docs
- **Web3.Storage**: https://docs.web3.storage
- **OpenSea Metadata**: https://docs.opensea.io/docs/metadata-standards
- **ERC-721 Standard**: https://eips.ethereum.org/EIPS/eip-721

## Support & Contributing

For issues or questions:
1. Check this documentation first
2. Search existing GitHub issues
3. Create new issue with:
   - Provider used (Pinata/NFT.Storage/Web3.Storage)
   - Error message
   - Sample code
   - Expected vs actual behavior

---

**Last Updated:** January 2025
**Version:** 1.0.0
