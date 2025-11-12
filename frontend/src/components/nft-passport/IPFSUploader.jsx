import React, { useState } from 'react';
import { Card, Button, Upload, Select, message, Alert, Spin, Descriptions, Tag, Space } from 'antd';
import {
  CloudUploadOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  LinkOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import {
  uploadCertificateToIPFS,
  batchUploadToIPFS,
  resolveIPFSUri,
  generateIPFSLinks
} from '../../services/ipfs.service';
import { copyToClipboard } from '../../services/nftPassport.service';

const { Option } = Select;

const IPFSUploader = ({ certificates }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('pinata');

  const handleUploadSingle = async (certificate) => {
    setUploading(true);
    message.loading({ content: `Uploading ${certificate.vaccine} to IPFS...`, key: 'upload' });

    try {
      const result = await uploadCertificateToIPFS(certificate, selectedProvider);

      if (result.success) {
        message.success({
          content: `Successfully uploaded to IPFS!`,
          key: 'upload',
          duration: 3
        });

        setUploadResults(prev => [...prev, {
          ...result,
          certificate: certificate
        }]);
      } else {
        message.error({
          content: `Upload failed: ${result.error}`,
          key: 'upload',
          duration: 5
        });
      }
    } catch (error) {
      message.error({
        content: `Upload error: ${error.message}`,
        key: 'upload'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleBatchUpload = async () => {
    if (!certificates || certificates.length === 0) {
      message.warning('No certificates to upload');
      return;
    }

    setUploading(true);
    message.loading({
      content: `Uploading ${certificates.length} certificates to IPFS...`,
      key: 'batch-upload'
    });

    try {
      const result = await batchUploadToIPFS(certificates, selectedProvider);

      message.success({
        content: `Batch upload completed! ${result.successful}/${result.total} successful`,
        key: 'batch-upload',
        duration: 5
      });

      setUploadResults(result.results);
    } catch (error) {
      message.error({
        content: `Batch upload error: ${error.message}`,
        key: 'batch-upload'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCopyHash = async (cid, label = 'IPFS CID') => {
    const success = await copyToClipboard(cid);
    if (success) {
      message.success(`${label} copied to clipboard!`);
    }
  };

  const handleViewOnIPFS = (cid) => {
    const url = resolveIPFSUri(cid);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card title="IPFS Upload Configuration" bordered={false}>
        <Alert
          message="IPFS Storage for NFT Metadata"
          description="Upload your vaccine certificate metadata to IPFS for permanent, decentralized storage. The data will be accessible via IPFS CID (Content Identifier)."
          type="info"
          showIcon
          className="mb-4"
        />

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Select IPFS Provider:
            </label>
            <Select
              value={selectedProvider}
              onChange={setSelectedProvider}
              style={{ width: '100%' }}
              size="large"
            >
              <Option value="pinata">
                Pinata (Recommended - Reliable & Fast)
              </Option>
              <Option value="nft-storage">
                NFT.Storage (Free for NFTs)
              </Option>
              <Option value="web3-storage">
                Web3.Storage (Free, Filecoin-backed)
              </Option>
            </Select>
          </div>

          <Alert
            message={
              selectedProvider === 'pinata'
                ? 'Pinata: Enterprise-grade IPFS pinning service. Requires API key.'
                : selectedProvider === 'nft-storage'
                ? 'NFT.Storage: Free IPFS storage specifically for NFTs. Backed by Protocol Labs.'
                : 'Web3.Storage: Free decentralized storage. Backed by Filecoin network.'
            }
            type="warning"
            showIcon
          />

          <Space>
            <Button
              type="primary"
              icon={<CloudUploadOutlined />}
              onClick={handleBatchUpload}
              loading={uploading}
              disabled={!certificates || certificates.length === 0}
              size="large"
            >
              Upload All Certificates ({certificates?.length || 0})
            </Button>

            <Button
              type="default"
              onClick={() => setUploadResults([])}
              disabled={uploadResults.length === 0}
            >
              Clear Results
            </Button>
          </Space>
        </div>
      </Card>

      {/* Individual Upload Options */}
      {certificates && certificates.length > 0 && (
        <Card title="Individual Certificate Upload" bordered={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert) => (
              <Card
                key={cert.nftId}
                size="small"
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="space-y-2">
                  <h4 className="font-bold text-sm">{cert.vaccine}</h4>
                  <div className="text-xs text-gray-600">
                    NFT #{cert.tokenId} - {cert.patient}
                  </div>
                  <Button
                    type="primary"
                    size="small"
                    block
                    icon={<CloudUploadOutlined />}
                    onClick={() => handleUploadSingle(cert)}
                    loading={uploading}
                  >
                    Upload to IPFS
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <Card
          title={
            <div className="flex items-center gap-2">
              <CheckCircleOutlined className="text-green-500" />
              <span>Upload Results ({uploadResults.length})</span>
            </div>
          }
          bordered={false}
        >
          <div className="space-y-4">
            {uploadResults.map((result, index) => (
              <Card
                key={index}
                size="small"
                className={`${
                  result.success
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                {result.success ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-green-700">
                        {result.certificate?.vaccine || `NFT #${result.tokenId}`}
                      </div>
                      <Tag color="success">Uploaded</Tag>
                    </div>

                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="IPFS CID">
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-white px-2 py-1 rounded">
                            {result.cid}
                          </code>
                          <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => handleCopyHash(result.cid)}
                          />
                        </div>
                      </Descriptions.Item>

                      <Descriptions.Item label="IPFS URI">
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-white px-2 py-1 rounded">
                            {result.ipfsUri}
                          </code>
                          <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => handleCopyHash(result.ipfsUri, 'IPFS URI')}
                          />
                        </div>
                      </Descriptions.Item>

                      <Descriptions.Item label="Gateway URL">
                        <div className="flex items-center gap-2">
                          <a
                            href={result.ipfsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline truncate"
                          >
                            {result.ipfsUrl}
                          </a>
                          <Button
                            type="text"
                            size="small"
                            icon={<LinkOutlined />}
                            onClick={() => handleViewOnIPFS(result.cid)}
                          >
                            View
                          </Button>
                        </div>
                      </Descriptions.Item>
                    </Descriptions>

                    <div className="flex gap-2">
                      <Button
                        size="small"
                        icon={<FileTextOutlined />}
                        onClick={() => {
                          const formatted = JSON.stringify(result.metadata, null, 2);
                          const blob = new Blob([formatted], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `metadata-${result.cid}.json`;
                          a.click();
                        }}
                      >
                        Download Metadata
                      </Button>
                      <Button
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() =>
                          handleCopyHash(
                            JSON.stringify(result.metadata, null, 2),
                            'Metadata JSON'
                          )
                        }
                      >
                        Copy JSON
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-700">
                    <div className="font-semibold mb-2">Upload Failed</div>
                    <div className="text-sm">{result.error}</div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Setup Instructions */}
      <Card title="Setup Instructions" bordered={false}>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-bold mb-2">1. Get API Keys</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>
                <strong>Pinata:</strong>{' '}
                <a
                  href="https://www.pinata.cloud/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Sign up at pinata.cloud
                </a>{' '}
                and get API Key & Secret
              </li>
              <li>
                <strong>NFT.Storage:</strong>{' '}
                <a
                  href="https://nft.storage/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Get free API key at nft.storage
                </a>
              </li>
              <li>
                <strong>Web3.Storage:</strong>{' '}
                <a
                  href="https://web3.storage/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Register at web3.storage
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-2">2. Configure Environment Variables</h4>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
{`# .env file (Vite uses VITE_ prefix)
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_API_SECRET=your_pinata_secret
VITE_NFT_STORAGE_API_KEY=your_nft_storage_key
VITE_WEB3_STORAGE_API_KEY=your_web3_storage_key`}
            </pre>
          </div>

          <div>
            <h4 className="font-bold mb-2">3. Smart Contract Integration</h4>
            <p className="text-gray-600">
              After uploading to IPFS, use the IPFS URI (<code>ipfs://CID</code>) as the
              <code> tokenURI</code> when minting your NFT. This allows NFT marketplaces to
              automatically display your vaccine certificate metadata.
            </p>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto mt-2">
{`// Solidity example
function mintCertificate(
  address to,
  uint256 tokenId,
  string memory ipfsUri
) public {
  _mint(to, tokenId);
  _setTokenURI(tokenId, ipfsUri); // ipfs://QmXxxx...
}`}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default IPFSUploader;
