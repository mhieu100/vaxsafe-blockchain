import {
  Modal,
  Tabs,
  Descriptions,
  Timeline,
  Tag,
  Badge,
  Button,
  Divider,
  Card,
  Tooltip,
  message,
  QRCode,
} from 'antd';
import {
  SafetyCertificateOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  MedicineBoxOutlined,
  UserOutlined,
  CopyOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  QrcodeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  formatCurrency,
  formatAddress,
  copyToClipboard,
  getVaccineTheme,
} from '../../services/nftPassport.service';

const NFTDetailModal = ({ visible, certificate, onClose }) => {
  if (!certificate) return null;

  const theme = getVaccineTheme(certificate.vaccine);

  const handleCopy = async (text, label) => {
    const success = await copyToClipboard(text);
    if (success) {
      message.success(`${label} đã được copy!`);
    }
  };

  const handleViewOnBlockchain = () => {
    window.open(
      `http://localhost:7545/tx/${certificate.transactionHash}`,
      '_blank'
    );
  };

  // Tab 1: Overview
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* NFT Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{theme.icon}</span>
              <div>
                <h2
                  className="text-2xl font-bold"
                  style={{ color: theme.color }}
                >
                  {certificate.vaccine}
                </h2>
                <Tag color="purple" className="font-mono">
                  NFT Token ID: #{certificate.tokenId}
                </Tag>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Minted on{' '}
              {dayjs(certificate.mintDate).format('DD/MM/YYYY HH:mm:ss')}
            </div>
          </div>
          <div className="text-right">
            <Badge status="success" text="COMPLETED" />
            <div className="mt-2 text-2xl font-bold text-green-600">
              {formatCurrency(certificate.totalAmount)}
            </div>
          </div>
        </div>
      </Card>

      {/* Patient Information */}
      <Card
        title={
          <>
            <UserOutlined /> Thông tin bệnh nhân
          </>
        }
        bordered={false}
      >
        <Descriptions column={2}>
          <Descriptions.Item label="Họ và tên">
            <strong>{certificate.patient}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="CMND/CCCD">
            {certificate.identityNumber}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Vaccine Information */}
      <Card
        title={
          <>
            <MedicineBoxOutlined /> Thông tin vaccine
          </>
        }
        bordered={false}
      >
        <Descriptions column={2}>
          <Descriptions.Item label="Tên vaccine">
            <strong>{certificate.vaccine}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Mã vaccine">
            <Tag color="blue">{certificate.vaccineCode}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Nhà sản xuất">
            {certificate.manufacturer}
          </Descriptions.Item>
          <Descriptions.Item label="Số liều">
            <strong>{certificate.totalDoses} liều</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Badge
              status={
                certificate.status === 'COMPLETED' ? 'success' : 'processing'
              }
              text={certificate.status}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Hoàn thành">
            <strong>{certificate.completionRate}%</strong>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* QR Code for Verification */}
      <Card
        title={
          <>
            <QrcodeOutlined /> Mã QR Xác Thực
          </>
        }
        bordered={false}
      >
        <div className="flex flex-col items-center gap-4">
          <QRCode
            value={`${window.location.origin}/verify/${certificate.transactionHash}`}
            size={200}
            errorLevel="H"
            bordered={true}
          />
          <div className="text-center text-sm text-gray-600">
            Quét mã QR để xác thực chứng nhận vaccine trên blockchain
          </div>
        </div>
      </Card>
    </div>
  );

  // Tab 2: Appointment History
  const AppointmentTab = () => (
    <div className="space-y-4">
      <Timeline
        mode="left"
        items={certificate.appointments.map((apt, index) => ({
          color: apt.status === 'COMPLETED' ? 'green' : 'blue',
          dot:
            apt.status === 'COMPLETED' ? (
              <CheckCircleOutlined />
            ) : (
              <ClockCircleOutlined />
            ),
          label: (
            <div className="text-right">
              <div className="font-semibold">
                {dayjs(apt.scheduledDate).format('DD/MM/YYYY')}
              </div>
              <div className="text-sm text-gray-500">{apt.scheduledTime}</div>
            </div>
          ),
          children: (
            <Card
              size="small"
              className="shadow-sm hover:shadow-md transition-shadow"
              style={{ borderLeft: `4px solid ${theme.color}` }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4
                    className="font-bold text-lg"
                    style={{ color: theme.color }}
                  >
                    Liều {apt.doseNumber}/{certificate.totalDoses}
                  </h4>
                  <Badge
                    status={
                      apt.status === 'COMPLETED' ? 'success' : 'processing'
                    }
                    text={apt.status}
                  />
                </div>

                <Divider className="my-2" />

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <EnvironmentOutlined className="text-red-500 mr-2" />
                    <strong>Trung tâm:</strong>
                    <div className="ml-6 text-gray-600">{apt.center}</div>
                    <div className="ml-6 text-xs text-gray-500">
                      {apt.centerAddress}
                    </div>
                  </div>

                  <div>
                    <SafetyCertificateOutlined className="text-green-500 mr-2" />
                    <strong>Bác sĩ:</strong>
                    <div className="ml-6 text-gray-600">{apt.doctor}</div>
                    <div className="ml-6 text-xs text-gray-500">
                      License: {apt.doctorLicense}
                    </div>
                  </div>

                  <div>
                    <MedicineBoxOutlined className="text-blue-500 mr-2" />
                    <strong>Batch:</strong>
                    <div className="ml-6">
                      <Tag color="blue" className="font-mono text-xs">
                        {apt.batchNumber}
                      </Tag>
                    </div>
                  </div>

                  <div>
                    <MedicineBoxOutlined className="text-purple-500 mr-2" />
                    <strong>Lot:</strong>
                    <div className="ml-6">
                      <Tag color="purple" className="font-mono text-xs">
                        {apt.lotNumber}
                      </Tag>
                    </div>
                  </div>

                  <div>
                    <CalendarOutlined className="text-orange-500 mr-2" />
                    <strong>Hạn sử dụng:</strong>
                    <div className="ml-6 text-gray-600">
                      {dayjs(apt.expiryDate).format('DD/MM/YYYY')}
                    </div>
                  </div>

                  <div>
                    <UserOutlined className="text-indigo-500 mr-2" />
                    <strong>Thu ngân:</strong>
                    <div className="ml-6 text-gray-600">{apt.cashier}</div>
                  </div>
                </div>
              </div>
            </Card>
          ),
        }))}
      />
    </div>
  );

  // Tab 3: Blockchain Info
  const BlockchainTab = () => (
    <div className="space-y-6">
      <Card
        title="Blockchain Verification"
        bordered={false}
        className="bg-gradient-to-br from-purple-50 to-blue-50"
      >
        <Descriptions column={1} bordered>
          <Descriptions.Item label="NFT ID">
            <div className="flex items-center justify-between">
              <Tag color="purple" className="font-mono">
                {certificate.nftId}
              </Tag>
              <Button
                type="link"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => handleCopy(certificate.nftId, 'NFT ID')}
              >
                Copy
              </Button>
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="Token ID">
            <div className="flex items-center justify-between">
              <Tag color="blue" className="font-mono">
                #{certificate.tokenId}
              </Tag>
              <Button
                type="link"
                size="small"
                icon={<CopyOutlined />}
                onClick={() =>
                  handleCopy(certificate.tokenId.toString(), 'Token ID')
                }
              >
                Copy
              </Button>
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="Transaction Hash">
            <div className="flex items-center justify-between">
              <Tooltip title={certificate.transactionHash}>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {certificate.transactionHash}
                </code>
              </Tooltip>
              <div className="flex gap-2">
                <Button
                  type="link"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() =>
                    handleCopy(certificate.transactionHash, 'Transaction Hash')
                  }
                >
                  Copy
                </Button>
                <Button
                  type="link"
                  size="small"
                  icon={<LinkOutlined />}
                  onClick={handleViewOnBlockchain}
                >
                  View
                </Button>
              </div>
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="Block Number">
            <Tag color="green">#{certificate.blockNumber}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Chain ID">
            <Tag color="orange">{certificate.chainId} (Ganache)</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Minted By">
            <div className="flex items-center justify-between">
              <Tooltip title={certificate.mintedBy}>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {formatAddress(certificate.mintedBy)}
                </code>
              </Tooltip>
              <Button
                type="link"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => handleCopy(certificate.mintedBy, 'Address')}
              >
                Copy
              </Button>
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="Mint Date">
            <strong>
              {dayjs(certificate.mintDate).format('DD/MM/YYYY HH:mm:ss')}
            </strong>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Smart Contract Status" bordered={false}>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded">
            <span className="flex items-center gap-2">
              <CheckCircleOutlined className="text-green-500" />
              <strong>NFT Minted</strong>
            </span>
            <Badge status="success" text="Confirmed" />
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded">
            <span className="flex items-center gap-2">
              <CheckCircleOutlined className="text-green-500" />
              <strong>Transaction Verified</strong>
            </span>
            <Badge status="success" text="Confirmed" />
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded">
            <span className="flex items-center gap-2">
              <CheckCircleOutlined className="text-green-500" />
              <strong>Certificate Immutable</strong>
            </span>
            <Badge status="success" text="On-Chain" />
          </div>
        </div>
      </Card>
    </div>
  );

  // Tab 4: FHIR Metadata
  const FHIRTab = () => (
    <div className="space-y-4">
      <Card
        title={
          <div className="flex items-center gap-2">
            <FileTextOutlined />
            <span>FHIR R4 Immunization Resource</span>
            <Tag color="blue">HL7 Standard</Tag>
          </div>
        }
        bordered={false}
      >
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="text-xs overflow-auto max-h-[500px]">
            {JSON.stringify(certificate.fhirMetadata, null, 2)}
          </pre>
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            icon={<CopyOutlined />}
            onClick={() =>
              handleCopy(
                JSON.stringify(certificate.fhirMetadata, null, 2),
                'FHIR Metadata'
              )
            }
          >
            Copy FHIR JSON
          </Button>
          <Button icon={<LinkOutlined />}>Validate FHIR</Button>
        </div>
      </Card>

      <Card title="FHIR Compliance Details" bordered={false}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Resource Type">
            <Tag color="blue">{certificate.fhirMetadata.resourceType}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="FHIR Version">
            <Tag color="green">R4</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Badge status="success" text={certificate.fhirMetadata.status} />
          </Descriptions.Item>
          <Descriptions.Item label="CVX Code">
            <Tag color="purple">
              {certificate.fhirMetadata.vaccineCode.coding[0].code}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Vaccine Display">
            {certificate.fhirMetadata.vaccineCode.coding[0].display}
          </Descriptions.Item>
          <Descriptions.Item label="Route">
            {certificate.fhirMetadata.route.coding[0].display}
          </Descriptions.Item>
          <Descriptions.Item label="Site">
            {certificate.fhirMetadata.site.coding[0].display}
          </Descriptions.Item>
          <Descriptions.Item label="Dose Quantity">
            {certificate.fhirMetadata.doseQuantity.value}{' '}
            {certificate.fhirMetadata.doseQuantity.unit}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );

  const tabItems = [
    {
      key: '1',
      label: (
        <span>
          <SafetyCertificateOutlined /> Tổng Quan
        </span>
      ),
      children: <OverviewTab />,
    },
    {
      key: '2',
      label: (
        <span>
          <CalendarOutlined /> Lịch Sử Tiêm
        </span>
      ),
      children: <AppointmentTab />,
    },
    {
      key: '3',
      label: (
        <span>
          <LinkOutlined /> Blockchain
        </span>
      ),
      children: <BlockchainTab />,
    },
    {
      key: '4',
      label: (
        <span>
          <FileTextOutlined /> FHIR Metadata
        </span>
      ),
      children: <FHIRTab />,
    },
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width={900}
      footer={null}
      title={
        <div className="flex items-center gap-3">
          <span className="text-2xl">{theme.icon}</span>
          <div>
            <h3 className="text-xl font-bold">NFT Vaccine Certificate</h3>
            <div className="text-sm font-normal text-gray-500">
              {certificate.patient} - {certificate.vaccine}
            </div>
          </div>
        </div>
      }
      className="nft-detail-modal"
    >
      <Tabs items={tabItems} defaultActiveKey="1" />
    </Modal>
  );
};

export default NFTDetailModal;
