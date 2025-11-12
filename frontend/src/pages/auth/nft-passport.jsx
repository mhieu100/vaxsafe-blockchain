import React, { useState, useEffect } from 'react';
import { Row, Col, Spin, Empty, Statistic, Card, Button, Input, message } from 'antd';
import {
  WalletOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useAccount } from 'wagmi';
import NFTCertificateCard from '../../components/nft-passport/NFTCertificateCard';
import NFTDetailModal from '../../components/nft-passport/NFTDetailModal';
import { fetchNFTPassport, formatCurrency } from '../../services/nftPassport.service';

const NFTPassportPage = () => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Fetch NFT certificates
  const loadCertificates = async () => {
    setLoading(true);
    try {
      const response = await fetchNFTPassport();
      if (response.success) {
        setCertificates(response.data);
      } else {
        message.error('Không thể tải dữ liệu NFT Passport');
      }
    } catch (error) {
      console.error('Error fetching NFT certificates:', error);
      message.error('Đã xảy ra lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  // Calculate statistics
  const totalCertificates = certificates.length;
  const completedCertificates = certificates.filter(cert => cert.status === 'COMPLETED').length;
  const totalSpent = certificates.reduce((sum, cert) => sum + cert.totalAmount, 0);
  const totalDoses = certificates.reduce((sum, cert) => sum + cert.totalDoses, 0);

  // Filter certificates
  const filteredCertificates = certificates.filter(cert =>
    cert.vaccine.toLowerCase().includes(searchText.toLowerCase()) ||
    cert.nftId.toLowerCase().includes(searchText.toLowerCase()) ||
    cert.transactionHash.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleViewDetail = (certificate) => {
    setSelectedCertificate(certificate);
    setModalVisible(true);
  };

  const handleExportAll = () => {
    const dataStr = JSON.stringify(certificates, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nft-vaccine-passport-${Date.now()}.json`;
    link.click();
    message.success('Đã export NFT Passport data');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                NFT Vaccine Passport
              </h1>
              <p className="text-gray-600 mt-2">
                Hộ chiếu vaccine Web3 với chứng nhận NFT trên Blockchain
              </p>
            </div>
            {isConnected && (
              <Card className="shadow-md">
                <div className="flex items-center gap-3">
                  <WalletOutlined className="text-2xl text-purple-600" />
                  <div>
                    <div className="text-xs text-gray-500">Wallet Connected</div>
                    <div className="font-mono text-sm font-semibold">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Statistics */}
          <Row gutter={16} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Tổng NFT Certificates"
                  value={totalCertificates}
                  prefix={<SafetyCertificateOutlined />}
                  valueStyle={{ color: '#8b5cf6' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Hoàn thành"
                  value={completedCertificates}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#10b981' }}
                  suffix={`/ ${totalCertificates}`}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Tổng liều tiêm"
                  value={totalDoses}
                  prefix={<SafetyCertificateOutlined />}
                  valueStyle={{ color: '#3b82f6' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <Statistic
                  title="Tổng chi phí"
                  value={totalSpent}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#f59e0b' }}
                  formatter={(value) => formatCurrency(value)}
                />
              </Card>
            </Col>
          </Row>

          {/* Search and Actions */}
          <Card className="shadow-md mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <Input
                placeholder="Tìm kiếm theo tên vaccine, NFT ID, hoặc transaction hash..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="flex-1 min-w-[300px]"
                size="large"
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={loadCertificates}
                loading={loading}
                size="large"
              >
                Làm mới
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExportAll}
                type="primary"
                size="large"
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                Export JSON
              </Button>
            </div>
          </Card>
        </div>

        {/* NFT Gallery */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="Đang tải NFT Certificates..." />
          </div>
        ) : filteredCertificates.length === 0 ? (
          <Card className="shadow-md">
            <Empty
              description={
                searchText
                  ? 'Không tìm thấy NFT Certificate phù hợp'
                  : 'Chưa có NFT Certificate nào'
              }
            />
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {filteredCertificates.map((cert) => (
              <Col xs={24} md={12} lg={8} key={cert.nftId}>
                <NFTCertificateCard
                  certificate={cert}
                  onViewDetail={() => handleViewDetail(cert)}
                />
              </Col>
            ))}
          </Row>
        )}

        {/* Detail Modal */}
        <NFTDetailModal
          visible={modalVisible}
          certificate={selectedCertificate}
          onClose={() => {
            setModalVisible(false);
            setSelectedCertificate(null);
          }}
        />

        {/* Footer Info */}
        <Card className="mt-8 shadow-md bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
          <div className="text-center">
            <h3 className="text-lg font-bold text-purple-700 mb-2">
              Về NFT Vaccine Passport
            </h3>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Mỗi chứng nhận vaccine được mint thành NFT trên Ethereum blockchain (Ganache).
              Tất cả dữ liệu tuân theo chuẩn FHIR R4 (Fast Healthcare Interoperability Resources)
              của HL7, đảm bảo tính tương thích quốc tế và có thể xác thực hoàn toàn trên blockchain.
            </p>
            <div className="mt-4 flex justify-center gap-4 flex-wrap">
              <a
                href="https://www.hl7.org/fhir/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Tìm hiểu về FHIR R4
              </a>
              <span className="text-gray-400">|</span>
              <a
                href="http://localhost:7545"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline"
              >
                Ganache Blockchain Explorer
              </a>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">
                Chain ID: 1337 (Local Development)
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NFTPassportPage;
