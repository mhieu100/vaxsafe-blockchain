import React, { useState, useEffect } from 'react';
import { Tabs, Card, message } from 'antd';
import {
  CloudUploadOutlined,
  EyeOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import IPFSUploader from '../../components/nft-passport/IPFSUploader';
import IPFSViewer from '../../components/nft-passport/IPFSViewer';
import { fetchNFTPassport } from '../../services/nftPassport.service';

const IPFSManagementPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const response = await fetchNFTPassport();
      if (response.success) {
        setCertificates(response.data);
      } else {
        message.error('Failed to load certificates');
      }
    } catch (error) {
      message.error('Error loading certificates');
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: '1',
      label: (
        <span className="flex items-center gap-2">
          <CloudUploadOutlined />
          Upload to IPFS
        </span>
      ),
      children: <IPFSUploader certificates={certificates} />
    },
    {
      key: '2',
      label: (
        <span className="flex items-center gap-2">
          <EyeOutlined />
          View from IPFS
        </span>
      ),
      children: <IPFSViewer />
    },
    {
      key: '3',
      label: (
        <span className="flex items-center gap-2">
          <DatabaseOutlined />
          Documentation
        </span>
      ),
      children: (
        <Card bordered={false}>
          <div className="prose max-w-none">
            <h2>IPFS Integration Guide</h2>

            <h3>What is IPFS?</h3>
            <p>
              IPFS (InterPlanetary File System) is a distributed file system for storing and
              accessing files, websites, applications, and data in a decentralized way.
            </p>

            <h3>Why Use IPFS for NFT Metadata?</h3>
            <ul>
              <li><strong>Decentralization:</strong> No single point of failure</li>
              <li><strong>Immutability:</strong> Content cannot be changed once uploaded</li>
              <li><strong>Permanence:</strong> Data persists as long as someone pins it</li>
              <li><strong>Efficiency:</strong> Content-addressed storage (same content = same hash)</li>
              <li><strong>Standard:</strong> Widely adopted in Web3 and NFT ecosystems</li>
            </ul>

            <h3>Data Structure</h3>
            <p>
              Your vaccine certificate is transformed into NFT metadata following OpenSea standards:
            </p>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
{`{
  "name": "Vaccine Certificate - STAMARIL",
  "description": "NFT Vaccine Certificate for...",
  "image": "ipfs://QmXxx...",
  "external_url": "https://yourapp.com/nft-passport/NFT-001",
  "attributes": [
    {
      "trait_type": "Vaccine",
      "value": "STAMARIL phòng bệnh sốt vàng"
    },
    ...
  ],
  "properties": {
    "certificate": { ... },
    "patient": { ... },
    "vaccine": { ... },
    "appointments": [ ... ],
    "fhir": { ... }
  },
  "verification": {
    "blockchain": "Ethereum",
    "transactionHash": "0x...",
    "blockNumber": 12345
  }
}`}
            </pre>

            <h3>How It Works</h3>
            <ol>
              <li><strong>Upload:</strong> Certificate data is converted to JSON and uploaded to IPFS</li>
              <li><strong>CID Generated:</strong> IPFS generates a unique Content Identifier (CID)</li>
              <li><strong>Pinning:</strong> Data is "pinned" to ensure it stays available</li>
              <li><strong>NFT Minting:</strong> Use IPFS URI (<code>ipfs://CID</code>) as tokenURI</li>
              <li><strong>Retrieval:</strong> Anyone can fetch the metadata using the CID</li>
            </ol>

            <h3>IPFS Providers Comparison</h3>
            <table className="min-w-full divide-y divide-gray-200 border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Features</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Best For</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold">Pinata</td>
                  <td className="px-6 py-4">Free tier + Paid</td>
                  <td className="px-6 py-4">Fast, reliable, analytics</td>
                  <td className="px-6 py-4">Production apps</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold">NFT.Storage</td>
                  <td className="px-6 py-4">Free</td>
                  <td className="px-6 py-4">Unlimited storage for NFTs</td>
                  <td className="px-6 py-4">NFT projects</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold">Web3.Storage</td>
                  <td className="px-6 py-4">Free</td>
                  <td className="px-6 py-4">Filecoin-backed</td>
                  <td className="px-6 py-4">Long-term storage</td>
                </tr>
              </tbody>
            </table>

            <h3>Smart Contract Integration</h3>
            <p>After uploading to IPFS, use the CID in your smart contract:</p>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
{`// Solidity Example
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract VaccineNFT is ERC721URIStorage {
    constructor() ERC721("VaccineCertificate", "VCERT") {}

    function mintCertificate(
        address to,
        uint256 tokenId,
        string memory ipfsUri
    ) public {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, ipfsUri); // ipfs://QmXxx...
    }
}`}
            </pre>

            <h3>Best Practices</h3>
            <ul>
              <li>Always pin your content to prevent data loss</li>
              <li>Use multiple IPFS gateways for redundancy</li>
              <li>Store sensitive patient data encrypted</li>
              <li>Keep backup of CIDs in your database</li>
              <li>Test retrieval before minting NFTs</li>
              <li>Consider using IPFS + Filecoin for long-term archival</li>
            </ul>

            <h3>Resources</h3>
            <ul>
              <li><a href="https://ipfs.io" target="_blank" rel="noopener noreferrer">IPFS Official Site</a></li>
              <li><a href="https://docs.pinata.cloud" target="_blank" rel="noopener noreferrer">Pinata Documentation</a></li>
              <li><a href="https://nft.storage/docs" target="_blank" rel="noopener noreferrer">NFT.Storage Docs</a></li>
              <li><a href="https://docs.opensea.io/docs/metadata-standards" target="_blank" rel="noopener noreferrer">OpenSea Metadata Standards</a></li>
            </ul>
          </div>
        </Card>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            IPFS Management
          </h1>
          <p className="text-gray-600 mt-2">
            Store and retrieve vaccine certificate metadata on IPFS - the decentralized storage network
          </p>
        </div>

        {/* Tabs */}
        <Card className="shadow-lg">
          <Tabs items={tabItems} defaultActiveKey="1" size="large" />
        </Card>
      </div>
    </div>
  );
};

export default IPFSManagementPage;
