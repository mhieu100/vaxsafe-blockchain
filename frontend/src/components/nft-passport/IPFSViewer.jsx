import React, { useState } from 'react';
import { Card, Input, Button, Spin, Alert, Descriptions, Tag, Space, Tabs } from 'antd';
import {
  SearchOutlined,
  LinkOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { fetchFromIPFS, resolveIPFSUri, generateIPFSLinks } from '../../services/ipfs.service';
import { copyToClipboard } from '../../services/nftPassport.service';
import { message } from 'antd';

const { TextArea } = Input;

const IPFSViewer = () => {
  const [cid, setCid] = useState('');
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);

  const handleFetch = async () => {
    if (!cid.trim()) {
      message.warning('Please enter an IPFS CID');
      return;
    }

    setLoading(true);
    setError(null);
    setMetadata(null);

    try {
      const result = await fetchFromIPFS(cid.trim());

      if (result.success) {
        setMetadata(result.data);
        message.success('Successfully fetched from IPFS!');
      } else {
        setError(result.error);
        message.error('Failed to fetch from IPFS');
      }
    } catch (err) {
      setError(err.message);
      message.error('Error fetching from IPFS');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text, label) => {
    const success = await copyToClipboard(text);
    if (success) {
      message.success(`${label} copied!`);
    }
  };

  const links = cid ? generateIPFSLinks(cid) : null;

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card title="IPFS Data Viewer" bordered={false}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Enter IPFS CID (Content Identifier):
            </label>
            <Space.Compact style={{ width: '100%' }} size="large">
              <Input
                placeholder="QmXxxx... or ipfs://QmXxxx..."
                value={cid}
                onChange={(e) => setCid(e.target.value)}
                onPressEnter={handleFetch}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleFetch}
                loading={loading}
              >
                Fetch
              </Button>
            </Space.Compact>
          </div>

          <Alert
            message="What is IPFS CID?"
            description="Content Identifier (CID) is a unique hash that points to your data on IPFS. It looks like: QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            type="info"
            showIcon
          />
        </div>
      </Card>

      {/* Loading */}
      {loading && (
        <Card>
          <div className="flex flex-col items-center justify-center py-8">
            <Spin size="large" />
            <p className="mt-4 text-gray-600">Fetching from IPFS...</p>
          </div>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card>
          <Alert
            message="Failed to Fetch"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={handleFetch}>
                Retry
              </Button>
            }
          />
        </Card>
      )}

      {/* Gateway Links */}
      {links && !loading && (
        <Card title="IPFS Gateway Links" bordered={false}>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-gray-700">Primary Gateway:</label>
              <div className="flex items-center gap-2 mt-1">
                <a
                  href={links.primary}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm flex-1 truncate"
                >
                  {links.primary}
                </a>
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => handleCopy(links.primary, 'Gateway URL')}
                />
                <Button
                  type="text"
                  size="small"
                  icon={<LinkOutlined />}
                  onClick={() => window.open(links.primary, '_blank')}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">IPFS Protocol:</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                  {links.ipfsProtocol}
                </code>
                <Button
                  type="text"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => handleCopy(links.ipfsProtocol, 'IPFS URI')}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Alternative Gateways:</label>
              <div className="mt-2 space-y-2">
                {links.gateways.map((gateway, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <a
                      href={gateway}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs flex-1 truncate"
                    >
                      {gateway}
                    </a>
                    <Button
                      type="text"
                      size="small"
                      icon={<LinkOutlined />}
                      onClick={() => window.open(gateway, '_blank')}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Metadata Display */}
      {metadata && (
        <Card
          title={
            <div className="flex items-center gap-2">
              <CheckCircleOutlined className="text-green-500" />
              <span>NFT Metadata from IPFS</span>
            </div>
          }
          bordered={false}
        >
          <Tabs
            items={[
              {
                key: '1',
                label: (
                  <span>
                    <SafetyCertificateOutlined /> Overview
                  </span>
                ),
                children: (
                  <div className="space-y-4">
                    {/* Basic Info */}
                    <Descriptions column={2} bordered>
                      <Descriptions.Item label="Name" span={2}>
                        <strong>{metadata.name}</strong>
                      </Descriptions.Item>
                      <Descriptions.Item label="Description" span={2}>
                        {metadata.description}
                      </Descriptions.Item>
                      {metadata.external_url && (
                        <Descriptions.Item label="External URL" span={2}>
                          <a
                            href={metadata.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {metadata.external_url}
                          </a>
                        </Descriptions.Item>
                      )}
                    </Descriptions>

                    {/* Attributes */}
                    {metadata.attributes && metadata.attributes.length > 0 && (
                      <div>
                        <h4 className="font-bold mb-3">Attributes:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {metadata.attributes.map((attr, index) => (
                            <Card key={index} size="small" className="text-center">
                              <div className="text-xs text-gray-500 mb-1">
                                {attr.trait_type}
                              </div>
                              <div className="font-bold">{attr.value}</div>
                              {attr.display_type && (
                                <Tag size="small" className="mt-1">
                                  {attr.display_type}
                                </Tag>
                              )}
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Verification */}
                    {metadata.verification && (
                      <Card size="small" className="bg-green-50 border-green-200">
                        <h4 className="font-bold mb-2">Blockchain Verification:</h4>
                        <Descriptions column={2} size="small">
                          <Descriptions.Item label="Blockchain">
                            {metadata.verification.blockchain}
                          </Descriptions.Item>
                          <Descriptions.Item label="Chain ID">
                            {metadata.verification.chainId}
                          </Descriptions.Item>
                          <Descriptions.Item label="TX Hash" span={2}>
                            <code className="text-xs bg-white px-2 py-1 rounded">
                              {metadata.verification.transactionHash}
                            </code>
                          </Descriptions.Item>
                          <Descriptions.Item label="Block Number">
                            #{metadata.verification.blockNumber}
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>
                    )}
                  </div>
                )
              },
              {
                key: '2',
                label: (
                  <span>
                    <FileTextOutlined /> Raw JSON
                  </span>
                ),
                children: (
                  <div className="space-y-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        icon={<CopyOutlined />}
                        onClick={() =>
                          handleCopy(JSON.stringify(metadata, null, 2), 'JSON')
                        }
                      >
                        Copy JSON
                      </Button>
                      <Button
                        icon={<FileTextOutlined />}
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(metadata, null, 2)], {
                            type: 'application/json'
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `ipfs-${cid}.json`;
                          a.click();
                        }}
                      >
                        Download
                      </Button>
                    </div>
                    <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto max-h-[500px] border">
                      {JSON.stringify(metadata, null, 2)}
                    </pre>
                  </div>
                )
              }
            ]}
          />
        </Card>
      )}

      {/* Examples */}
      <Card title="Example CIDs to Try" bordered={false}>
        <div className="text-sm text-gray-600">
          <p className="mb-3">Try fetching these example IPFS CIDs:</p>
          <ul className="space-y-2">
            <li>
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq
              </code>
              <span className="ml-2 text-gray-500">(Example NFT metadata)</span>
            </li>
            <li className="text-gray-500">
              Note: After uploading your certificates, you can use the CIDs generated to view them
              here.
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default IPFSViewer;
