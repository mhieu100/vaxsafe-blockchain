/**
 * IPFS Service for NFT Vaccine Certificate Storage
 *
 * This service handles:
 * - Uploading vaccine certificate data to IPFS
 * - Retrieving data from IPFS via CID (Content Identifier)
 * - Pinning data to ensure persistence
 * - Generating IPFS URIs for NFT metadata
 *
 * Recommended IPFS Solutions:
 * 1. Pinata (https://pinata.cloud) - Easy to use, reliable
 * 2. NFT.Storage (https://nft.storage) - Free for NFTs
 * 3. Web3.Storage (https://web3.storage) - Free, backed by Filecoin
 * 4. Infura IPFS (https://infura.io) - Enterprise-grade
 */

import axios from 'axios';

// IPFS Configuration
// Note: Vite uses import.meta.env instead of process.env
const IPFS_CONFIG = {
  // Option 1: Pinata (Recommended for production)
  pinata: {
    apiKey: import.meta.env.VITE_PINATA_API_KEY || 'e99585ba79a50bc5c6d5',
    apiSecret:
      import.meta.env.VITE_PINATA_API_SECRET ||
      '50a12ff007df2a119b28c2026c971f79e831d40d4328f1c9fd68a46acafa54a1',
    uploadUrl: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    gateway: 'https://gateway.pinata.cloud/ipfs/',
  },

  // Option 2: NFT.Storage (Free for NFTs)
  nftStorage: {
    apiKey:
      import.meta.env.VITE_NFT_STORAGE_API_KEY || 'YOUR_NFT_STORAGE_API_KEY',
    uploadUrl: 'https://api.nft.storage/upload',
    gateway: 'https://nftstorage.link/ipfs/',
  },

  // Option 3: Web3.Storage (Free, Filecoin-backed)
  web3Storage: {
    apiKey:
      import.meta.env.VITE_WEB3_STORAGE_API_KEY || 'YOUR_WEB3_STORAGE_API_KEY',
    uploadUrl: 'https://api.web3.storage/upload',
    gateway: 'https://w3s.link/ipfs/',
  },

  // Public IPFS Gateways (for reading)
  publicGateways: [
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
    'https://dweb.link/ipfs/',
  ],
};

/**
 * Transform vaccine certificate data to NFT metadata standard (ERC-721/ERC-1155)
 * Following OpenSea metadata standards
 */
export const transformToNFTMetadata = (certificate) => {
  return {
    // Standard NFT Metadata (OpenSea Compatible)
    name: `Vaccine Certificate - ${certificate.vaccine}`,
    description: `NFT Vaccine Certificate for ${certificate.patient}. This certificate proves completion of ${certificate.totalDoses} doses of ${certificate.vaccine}. Verified on blockchain.`,
    image: generateVaccineCertificateImage(certificate), // You can generate an image URL
    external_url: `${window.location.origin}/nft-passport/${certificate.nftId}`,

    // Attributes (displayed on NFT marketplaces)
    attributes: [
      {
        trait_type: 'Patient Name',
        value: certificate.patient,
      },
      {
        trait_type: 'Identity Number',
        value: certificate.identityNumber,
      },
      {
        trait_type: 'Vaccine',
        value: certificate.vaccine,
      },
      {
        trait_type: 'Vaccine Code',
        value: certificate.vaccineCode,
      },
      {
        trait_type: 'Manufacturer',
        value: certificate.manufacturer,
      },
      {
        trait_type: 'Total Doses',
        value: certificate.totalDoses,
        display_type: 'number',
      },
      {
        trait_type: 'Completion Rate',
        value: certificate.completionRate,
        display_type: 'number',
        max_value: 100,
      },
      {
        trait_type: 'Status',
        value: certificate.status,
      },
      {
        trait_type: 'Mint Date',
        value: certificate.mintDate,
        display_type: 'date',
      },
      {
        trait_type: 'Total Cost',
        value: certificate.totalAmount,
        display_type: 'number',
      },
      {
        trait_type: 'Blockchain',
        value: 'Ethereum',
      },
      {
        trait_type: 'Chain ID',
        value: certificate.chainId,
        display_type: 'number',
      },
    ],

    // Custom Properties (Medical Data)
    properties: {
      // Certificate Information
      certificate: {
        nftId: certificate.nftId,
        tokenId: certificate.tokenId,
        transactionHash: certificate.transactionHash,
        blockNumber: certificate.blockNumber,
        mintedBy: certificate.mintedBy,
      },

      // Patient Information (Consider privacy - may want to encrypt)
      patient: {
        name: certificate.patient,
        identityNumber: certificate.identityNumber,
      },

      // Vaccine Details
      vaccine: {
        name: certificate.vaccine,
        code: certificate.vaccineCode,
        manufacturer: certificate.manufacturer,
        totalDoses: certificate.totalDoses,
        completionRate: certificate.completionRate,
      },

      // Appointments History
      appointments: certificate.appointments.map((apt) => ({
        appointmentId: apt.appointmentId,
        doseNumber: apt.doseNumber,
        date: apt.scheduledDate,
        time: apt.scheduledTime,
        center: apt.center,
        centerAddress: apt.centerAddress,
        doctor: apt.doctor,
        doctorLicense: apt.doctorLicense,
        status: apt.status,
        batchNumber: apt.batchNumber,
        lotNumber: apt.lotNumber,
        expiryDate: apt.expiryDate,
      })),

      // FHIR R4 Metadata (Healthcare Standard)
      fhir: certificate.fhirMetadata,
    },

    // Verification Information
    verification: {
      blockchain: 'Ethereum',
      chainId: certificate.chainId,
      transactionHash: certificate.transactionHash,
      blockNumber: certificate.blockNumber,
      verificationUrl: `${window.location.origin}/verify/${certificate.transactionHash}`,
    },

    // Standards Compliance
    standards: {
      nft: 'ERC-721',
      healthcare: 'FHIR R4 (HL7)',
      metadata: 'OpenSea Metadata Standards',
    },
  };
};

/**
 * Generate certificate image URL (placeholder)
 * In production, you would generate an actual certificate image
 */
const generateVaccineCertificateImage = (certificate) => {
  // Option 1: Use a certificate image generator service
  // Option 2: Pre-generated images stored on IPFS
  // Option 3: SVG generated on-the-fly

  // For now, return a placeholder
  return `${window.location.origin}/api/certificate-image/${certificate.nftId}`;
};

/**
 * Upload vaccine certificate to IPFS via Pinata
 */
export const uploadToPinata = async (certificate) => {
  try {
    const metadata = transformToNFTMetadata(certificate);

    const response = await axios.post(
      IPFS_CONFIG.pinata.uploadUrl,
      {
        pinataContent: metadata,
        pinataMetadata: {
          name: `Vaccine-Certificate-${certificate.nftId}.json`,
          keyvalues: {
            type: 'vaccine-certificate',
            nftId: certificate.nftId,
            tokenId: certificate.tokenId.toString(),
            vaccine: certificate.vaccine,
            patient: certificate.patient,
            status: certificate.status,
          },
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: IPFS_CONFIG.pinata.apiKey,
          pinata_secret_api_key: IPFS_CONFIG.pinata.apiSecret,
        },
      }
    );

    const ipfsHash = response.data.IpfsHash;
    const ipfsUrl = `${IPFS_CONFIG.pinata.gateway}${ipfsHash}`;

    return {
      success: true,
      cid: ipfsHash,
      ipfsUrl: ipfsUrl,
      ipfsUri: `ipfs://${ipfsHash}`,
      metadata: metadata,
    };
  } catch (error) {
    console.error('Pinata upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Upload to NFT.Storage (Free alternative)
 */
export const uploadToNFTStorage = async (certificate) => {
  try {
    const metadata = transformToNFTMetadata(certificate);
    const blob = new Blob([JSON.stringify(metadata)], {
      type: 'application/json',
    });

    const formData = new FormData();
    formData.append('file', blob, `vaccine-cert-${certificate.nftId}.json`);

    const response = await axios.post(
      IPFS_CONFIG.nftStorage.uploadUrl,
      formData,
      {
        headers: {
          Authorization: `Bearer ${IPFS_CONFIG.nftStorage.apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const ipfsHash = response.data.value.cid;
    const ipfsUrl = `${IPFS_CONFIG.nftStorage.gateway}${ipfsHash}`;

    return {
      success: true,
      cid: ipfsHash,
      ipfsUrl: ipfsUrl,
      ipfsUri: `ipfs://${ipfsHash}`,
      metadata: metadata,
    };
  } catch (error) {
    console.error('NFT.Storage upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Upload to Web3.Storage (Free, Filecoin-backed)
 */
export const uploadToWeb3Storage = async (certificate) => {
  try {
    const metadata = transformToNFTMetadata(certificate);
    const blob = new Blob([JSON.stringify(metadata)], {
      type: 'application/json',
    });

    const formData = new FormData();
    formData.append('file', blob);

    const response = await axios.post(
      IPFS_CONFIG.web3Storage.uploadUrl,
      formData,
      {
        headers: {
          Authorization: `Bearer ${IPFS_CONFIG.web3Storage.apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const ipfsHash = response.data.cid;
    const ipfsUrl = `${IPFS_CONFIG.web3Storage.gateway}${ipfsHash}`;

    return {
      success: true,
      cid: ipfsHash,
      ipfsUrl: ipfsUrl,
      ipfsUri: `ipfs://${ipfsHash}`,
      metadata: metadata,
    };
  } catch (error) {
    console.error('Web3.Storage upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Main upload function - tries multiple providers
 */
export const uploadCertificateToIPFS = async (
  certificate,
  provider = 'pinata'
) => {
  console.log(
    `Uploading certificate ${certificate.nftId} to IPFS via ${provider}...`
  );

  let result;

  switch (provider) {
    case 'pinata':
      result = await uploadToPinata(certificate);
      break;
    case 'nft-storage':
      result = await uploadToNFTStorage(certificate);
      break;
    case 'web3-storage':
      result = await uploadToWeb3Storage(certificate);
      break;
    default:
      // Try Pinata by default, fallback to NFT.Storage
      result = await uploadToPinata(certificate);
      if (!result.success) {
        console.log('Pinata failed, trying NFT.Storage...');
        result = await uploadToNFTStorage(certificate);
      }
  }

  return result;
};

/**
 * Retrieve metadata from IPFS using CID
 */
export const fetchFromIPFS = async (cid, gatewayUrl = null) => {
  const gateway = gatewayUrl || IPFS_CONFIG.pinata.gateway;
  const url = `${gateway}${cid}`;

  try {
    const response = await axios.get(url, {
      timeout: 10000, // 10 seconds timeout
    });

    return {
      success: true,
      data: response.data,
      cid: cid,
      url: url,
    };
  } catch (error) {
    // Try alternative gateways if primary fails
    for (const alternativeGateway of IPFS_CONFIG.publicGateways) {
      try {
        const alternativeUrl = `${alternativeGateway}${cid}`;
        const response = await axios.get(alternativeUrl, { timeout: 10000 });

        return {
          success: true,
          data: response.data,
          cid: cid,
          url: alternativeUrl,
        };
      } catch (err) {
        continue;
      }
    }

    return {
      success: false,
      error: 'Failed to fetch from IPFS via all gateways',
      cid: cid,
    };
  }
};

/**
 * Resolve IPFS URI to HTTP URL
 */
export const resolveIPFSUri = (ipfsUri, gatewayUrl = null) => {
  if (!ipfsUri) return null;

  // Handle ipfs:// protocol
  if (ipfsUri.startsWith('ipfs://')) {
    const cid = ipfsUri.replace('ipfs://', '');
    const gateway = gatewayUrl || IPFS_CONFIG.pinata.gateway;
    return `${gateway}${cid}`;
  }

  // Handle /ipfs/ format
  if (ipfsUri.startsWith('/ipfs/')) {
    const cid = ipfsUri.replace('/ipfs/', '');
    const gateway = gatewayUrl || IPFS_CONFIG.pinata.gateway;
    return `${gateway}${cid}`;
  }

  // Already an HTTP URL
  if (ipfsUri.startsWith('http')) {
    return ipfsUri;
  }

  // Assume it's just a CID
  const gateway = gatewayUrl || IPFS_CONFIG.pinata.gateway;
  return `${gateway}${ipfsUri}`;
};

/**
 * Batch upload multiple certificates
 */
export const batchUploadToIPFS = async (certificates, provider = 'pinata') => {
  const results = [];

  for (const certificate of certificates) {
    const result = await uploadCertificateToIPFS(certificate, provider);
    results.push({
      nftId: certificate.nftId,
      tokenId: certificate.tokenId,
      ...result,
    });

    // Add delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return {
    success: true,
    total: certificates.length,
    successful: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
    results: results,
  };
};

/**
 * Pin existing IPFS content (keep it available)
 */
export const pinContent = async (cid) => {
  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinByHash',
      {
        hashToPin: cid,
      },
      {
        headers: {
          pinata_api_key: IPFS_CONFIG.pinata.apiKey,
          pinata_secret_api_key: IPFS_CONFIG.pinata.apiSecret,
        },
      }
    );

    return {
      success: true,
      cid: cid,
      pinned: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get pinned items list from Pinata
 */
export const listPinnedContent = async () => {
  try {
    const response = await axios.get('https://api.pinata.cloud/data/pinList', {
      headers: {
        pinata_api_key: IPFS_CONFIG.pinata.apiKey,
        pinata_secret_api_key: IPFS_CONFIG.pinata.apiSecret,
      },
    });

    return {
      success: true,
      pins: response.data.rows,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Generate IPFS link with multiple gateway options
 */
export const generateIPFSLinks = (cid) => {
  return {
    primary: `${IPFS_CONFIG.pinata.gateway}${cid}`,
    ipfsProtocol: `ipfs://${cid}`,
    gateways: IPFS_CONFIG.publicGateways.map((gateway) => `${gateway}${cid}`),
  };
};

export default {
  uploadCertificateToIPFS,
  uploadToPinata,
  uploadToNFTStorage,
  uploadToWeb3Storage,
  fetchFromIPFS,
  resolveIPFSUri,
  batchUploadToIPFS,
  pinContent,
  listPinnedContent,
  generateIPFSLinks,
  transformToNFTMetadata,
};
