import {
  BlockOutlined,
  CheckCircleFilled,
  DownloadOutlined,
  LinkOutlined,
  LockOutlined,
  QrcodeOutlined,
  SafetyCertificateOutlined,
  ShareAltOutlined,
  VerifiedOutlined,
} from '@ant-design/icons';
import { Button, Card, Divider, QRCode, Space, Tag, Timeline, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccountStore } from '@/stores/useAccountStore';

const { Title, Text, Paragraph } = Typography;

const VaccinePassportTab = () => {
  const { t } = useTranslation(['client']);
  const { user } = useAccountStore();
  const [showQR, setShowQR] = useState(false);

  const vaccineRecords = [
    {
      id: '1',
      vaccine: 'COVID-19 (Pfizer-BioNTech)',
      date: '2024-03-15',
      dose: 2,
      batch: 'PF2024-001-VN',
      provider: 'SafeVax Medical Center',
      verificationHash: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
      blockNumber: '#2847563',
    },
    {
      id: '2',
      vaccine: 'Hepatitis B',
      date: '2024-01-20',
      dose: 3,
      batch: 'HB2024-003-VN',
      provider: 'National Vaccination Center',
      verificationHash: '0x3b9aca00c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91234',
      blockNumber: '#2745891',
    },
    {
      id: '3',
      vaccine: 'Influenza (2024 Season)',
      date: '2023-12-10',
      dose: 1,
      batch: 'FLU2023-012-VN',
      provider: 'City General Hospital',
      verificationHash: '0x9f2fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a45678',
      blockNumber: '#2698234',
    },
  ];

  const passportData = {
    qrValue: `VACCINE_PASSPORT:${user?.accountId || 'VX123456789'}:${Date.now()}`,
    issuedDate: '2024-10-04',
    expiryDate: '2025-10-04',
    blockchainNetwork: 'SafeVax Blockchain Network',
    consensusProtocol: 'Proof of Health',
  };

  const handleDownload = () => {};

  const handleShare = () => {};

  return (
    <div className="vaccine-passport-container">
      {}
      <Card
        className="mb-6 border-0 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
        }}
      >
        <div className="text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                <SafetyCertificateOutlined className="text-3xl text-white" />
              </div>
              <div>
                <Title level={3} className="!text-white !mb-0">
                  {t('client:vaccinePassport.digitalPassport')}
                </Title>
                <Text className="text-white/80">
                  <LockOutlined className="mr-2" />
                  {t('client:vaccinePassport.securedByBlockchain')}
                </Text>
              </div>
            </div>
            <Tag icon={<CheckCircleFilled />} color="success" className="px-4 py-1 text-base">
              {t('client:vaccinePassport.verified')}
            </Tag>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <BlockOutlined className="text-xl mb-2" />
              <div className="text-xs text-white/70">{t('client:vaccinePassport.network')}</div>
              <div className="font-semibold">{passportData.blockchainNetwork}</div>
            </div>
            <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <LinkOutlined className="text-xl mb-2" />
              <div className="text-xs text-white/70">{t('client:vaccinePassport.protocol')}</div>
              <div className="font-semibold">{passportData.consensusProtocol}</div>
            </div>
            <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <VerifiedOutlined className="text-xl mb-2" />
              <div className="text-xs text-white/70">{t('client:vaccinePassport.status')}</div>
              <div className="font-semibold">{t('client:vaccinePassport.activeVerified')}</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="lg:col-span-2">
          <Card className="shadow-sm rounded-xl border-2 border-purple-100">
            <div className="flex items-center justify-between mb-6">
              <Title level={4}>
                <SafetyCertificateOutlined className="mr-2 text-purple-600" />
                {t('client:vaccinePassport.passportInfo')}
              </Title>
              <Space>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleDownload}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {t('client:vaccinePassport.download')}
                </Button>
                <Button icon={<ShareAltOutlined />} onClick={handleShare}>
                  {t('client:vaccinePassport.share')}
                </Button>
              </Space>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <Text type="secondary" className="block mb-1">
                  {t('client:vaccinePassport.fullName')}
                </Text>
                <Text strong className="text-base">
                  {user?.fullName || 'N/A'}
                </Text>
              </div>
              <div>
                <Text type="secondary" className="block mb-1">
                  {t('client:vaccinePassport.passportId')}
                </Text>
                <Text strong className="text-base font-mono">
                  {user?.accountId || 'N/A'}
                </Text>
              </div>
              <div>
                <Text type="secondary" className="block mb-1">
                  {t('client:vaccinePassport.issuedDate')}
                </Text>
                <Text strong>{passportData.issuedDate}</Text>
              </div>
              <div>
                <Text type="secondary" className="block mb-1">
                  {t('client:vaccinePassport.validUntil')}
                </Text>
                <Text strong className="text-green-600">
                  {passportData.expiryDate}
                </Text>
              </div>
            </div>

            <Divider />

            {}
            <div className="mb-6">
              <Title level={5} className="mb-4">
                <BlockOutlined className="mr-2 text-purple-600" />
                {t('client:vaccinePassport.blockchainVerification')}
              </Title>
              <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                    <Text type="secondary">{t('client:vaccinePassport.networkType')}:</Text>
                    <Tag color="purple" className="m-0">
                      {t('client:vaccinePassport.permissionedBlockchain')}
                    </Tag>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                    <Text type="secondary">{t('client:vaccinePassport.consensus')}:</Text>
                    <Tag color="blue" className="m-0">
                      {t('client:vaccinePassport.proofOfAuthority')}
                    </Tag>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                    <Text type="secondary">{t('client:vaccinePassport.totalRecords')}:</Text>
                    <Tag color="green" className="m-0">
                      {vaccineRecords.length} {t('client:vaccinePassport.verified')}
                    </Tag>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                    <Text type="secondary">{t('client:vaccinePassport.lastUpdated')}:</Text>
                    <Text className="font-mono text-xs">{vaccineRecords[0]?.date}</Text>
                  </div>
                </div>
              </Card>
            </div>

            {}
            <Title level={5} className="mb-4">
              <LinkOutlined className="mr-2 text-purple-600" />
              {t('client:vaccinePassport.verifiedRecords')}
            </Title>
            <Timeline
              items={vaccineRecords.map((record) => ({
                color: 'purple',
                dot: (
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full border-2 border-purple-600">
                    <CheckCircleFilled className="text-purple-600" />
                  </div>
                ),
                children: (
                  <Card
                    key={record.id}
                    className="mb-3 border-l-4 border-l-purple-600 hover:shadow-md transition-shadow"
                    size="small"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Text strong className="text-base">
                          {record.vaccine}
                        </Text>
                        <br />
                        <Text type="secondary" className="text-sm">
                          {t('client:vaccinePassport.dose')} {record.dose} • {record.date}
                        </Text>
                      </div>
                      <Tag color="success" icon={<VerifiedOutlined />}>
                        {t('client:vaccinePassport.verified')}
                      </Tag>
                    </div>

                    <Divider className="my-2" />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <Text type="secondary">{t('client:vaccinePassport.provider')}:</Text>
                        <Text className="font-medium">{record.provider}</Text>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <Text type="secondary">{t('client:vaccinePassport.batch')}:</Text>
                        <Text className="font-mono">{record.batch}</Text>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <Text type="secondary">{t('client:vaccinePassport.block')}:</Text>
                        <Tag color="purple" className="font-mono text-xs">
                          {record.blockNumber}
                        </Tag>
                      </div>
                      <div className="bg-gray-50 p-2 rounded mt-2">
                        <Text type="secondary" className="text-xs block mb-1">
                          {t('client:vaccinePassport.transactionHash')}:
                        </Text>
                        <Text className="font-mono text-xs break-all text-purple-600" copyable>
                          {record.verificationHash}
                        </Text>
                      </div>
                    </div>
                  </Card>
                ),
              }))}
            />
          </Card>
        </div>

        {}
        <div className="lg:col-span-1">
          <Card className="shadow-sm rounded-xl border-2 border-purple-100 mb-6">
            <Title level={5} className="text-center mb-4">
              <QrcodeOutlined className="mr-2 text-purple-600" />
              {t('client:vaccinePassport.digitalVerification')}
            </Title>
            <div className="flex flex-col items-center">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 mb-4">
                <QRCode value={passportData.qrValue} size={200} />
              </div>
              <Text type="secondary" className="text-center text-xs mb-4">
                {t('client:vaccinePassport.scanToVerify')}
              </Text>
              <Button
                block
                type={showQR ? 'default' : 'primary'}
                icon={<QrcodeOutlined />}
                onClick={() => setShowQR(!showQR)}
                className={!showQR ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                {showQR
                  ? t('client:vaccinePassport.hideQR')
                  : t('client:vaccinePassport.showFullQR')}
              </Button>
            </div>
          </Card>

          {}
          <Card className="shadow-sm rounded-xl border-2 border-purple-100">
            <Title level={5} className="mb-4">
              <BlockOutlined className="mr-2 text-purple-600" />
              {t('client:vaccinePassport.blockchainStats')}
            </Title>
            <div className="space-y-4">
              <Card
                size="small"
                className="bg-gradient-to-r from-green-50 to-green-100 border-green-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Text type="secondary" className="text-xs block mb-1">
                      {t('client:vaccinePassport.verifiedRecords')}
                    </Text>
                    <div className="text-2xl font-bold text-green-600">{vaccineRecords.length}</div>
                  </div>
                  <div className="p-2 bg-green-200 rounded-full">
                    <CheckCircleFilled className="text-2xl text-green-600" />
                  </div>
                </div>
              </Card>

              <Card
                size="small"
                className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Text type="secondary" className="text-xs block mb-1">
                      {t('client:vaccinePassport.chainConfirmations')}
                    </Text>
                    <div className="text-2xl font-bold text-purple-600">1,247</div>
                  </div>
                  <div className="p-2 bg-purple-200 rounded-full">
                    <LinkOutlined className="text-2xl text-purple-600" />
                  </div>
                </div>
              </Card>

              <Card
                size="small"
                className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Text type="secondary" className="text-xs block mb-1">
                      {t('client:vaccinePassport.trustScore')}
                    </Text>
                    <div className="text-2xl font-bold text-blue-600">99.8%</div>
                  </div>
                  <div className="p-2 bg-blue-200 rounded-full">
                    <SafetyCertificateOutlined className="text-2xl text-blue-600" />
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        </div>
      </div>

      {}
      <Card className="!mt-6 shadow-sm rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <Title level={5} className="mb-2">
              <LinkOutlined className="mr-2 text-purple-600" />
              {t('client:vaccinePassport.exploreOnBlockchain')}
            </Title>
            <Paragraph className="mb-0 text-sm">
              {t('client:vaccinePassport.viewHistoryExplorer')}
            </Paragraph>
          </div>
          <Button
            type="primary"
            icon={<BlockOutlined />}
            size="large"
            className="bg-purple-600 hover:bg-purple-700"
            href="#"
          >
            {t('client:vaccinePassport.openExplorer')}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default VaccinePassportTab;
