import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloudOutlined,
  CodeOutlined,
  CopyOutlined,
  LinkOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Button, Descriptions, Modal, message, Steps, Tabs, Tag, Timeline, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const { Text, Paragraph } = Typography;

const BlockchainVerificationModal = ({ open, onClose, record }) => {
  const { t } = useTranslation(['common']);
  const [activeTab, setActiveTab] = useState('verification');

  if (!record) return null;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    message.success(`${label} copied to clipboard`);
  };

  const verificationSteps = [
    {
      title: t('common:blockchain.dataRecorded'),
      description: t('common:blockchain.dataRecordedDesc'),
      icon: <CheckCircleOutlined />,
      status: 'finish',
    },
    {
      title: t('common:blockchain.storedOnBlockchain'),
      description: `Block #${record.blockNumber || 'N/A'}`,
      icon: <SafetyCertificateOutlined />,
      status: 'finish',
    },
    {
      title: t('common:blockchain.fhirUploaded'),
      description: t('common:blockchain.fhirUploadedDesc'),
      icon: <CloudOutlined />,
      status: record.ipfsHash ? 'finish' : 'wait',
    },
    {
      title: t('common:blockchain.verified'),
      description: t('common:blockchain.verifiedDesc'),
      icon: <CheckCircleOutlined />,
      status: 'finish',
    },
  ];

  const items = [
    {
      key: 'verification',
      label: (
        <span>
          <SafetyCertificateOutlined /> {t('common:blockchain.verification')}
        </span>
      ),
      children: (
        <div className="space-y-6">
          {}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <SafetyCertificateOutlined className="text-emerald-600 text-2xl" />
              </div>
              <div>
                <Text className="text-lg font-semibold text-emerald-800">
                  {t('common:blockchain.recordVerified')}
                </Text>
                <div className="text-sm text-emerald-600">
                  {t('common:blockchain.immutableRecord')}
                </div>
              </div>
            </div>
          </div>

          {}
          <div>
            <Text className="font-semibold text-slate-700 mb-3 block">
              {t('common:blockchain.verificationProcess')}
            </Text>
            <Steps
              direction="vertical"
              size="small"
              current={4}
              items={verificationSteps.map((step) => ({
                title: step.title,
                description: step.description,
                status: step.status,
                icon: step.icon,
              }))}
            />
          </div>

          {}
          <Descriptions
            title={t('common:blockchain.blockchainDetails')}
            bordered
            size="small"
            column={1}
          >
            <Descriptions.Item label={t('common:blockchain.recordId')}>
              <div className="flex items-center justify-between">
                <Text className="font-mono text-xs">{record.blockchainRecordId || 'N/A'}</Text>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label={t('common:blockchain.transactionHash')}>
              <div className="flex items-center justify-between gap-2">
                <Text className="font-mono text-xs truncate flex-1">
                  {record.transactionHash || 'N/A'}
                </Text>
                {record.transactionHash && (
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(record.transactionHash, 'Transaction hash')}
                  />
                )}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label={t('common:blockchain.blockNumber')}>
              <Tag color="blue">Block #{record.blockNumber || 'N/A'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('common:blockchain.timestamp')}>
              <div className="flex items-center gap-2">
                <ClockCircleOutlined className="text-slate-400" />
                {record.vaccinationDate
                  ? new Date(record.vaccinationDate).toLocaleString('vi-VN')
                  : 'N/A'}
              </div>
            </Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: 'fhir',
      label: (
        <span>
          <CloudOutlined /> {t('common:blockchain.fhirData')}
        </span>
      ),
      children: (
        <div className="space-y-4">
          {}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <CloudOutlined className="text-purple-600 text-xl" />
              <div>
                <Text className="font-semibold text-purple-800">
                  {t('common:blockchain.storedOnIpfs')}
                </Text>
                <div className="text-xs text-purple-600">
                  {t('common:blockchain.decentralizedStorage')}
                </div>
              </div>
            </div>
            {record.ipfsHash && (
              <div className="bg-white rounded-lg p-3 mt-3">
                <Text className="text-xs text-slate-500 block mb-1">IPFS Hash:</Text>
                <div className="flex items-center gap-2">
                  <Text className="font-mono text-sm flex-1 break-all">{record.ipfsHash}</Text>
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(record.ipfsHash, 'IPFS hash')}
                  />
                  <Button
                    type="primary"
                    size="small"
                    icon={<LinkOutlined />}
                    href={`https://ipfs.io/ipfs/${record.ipfsHash}`}
                    target="_blank"
                  >
                    {t('common:blockchain.viewOnIpfs')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <Text className="font-semibold text-blue-800 block mb-2">
              {t('common:blockchain.whatIsFhir')}
            </Text>
            <Paragraph className="text-sm text-blue-700 mb-0">
              {t('common:blockchain.fhirExplanation')}
            </Paragraph>
          </div>

          {}
          <Timeline
            items={[
              {
                color: 'green',
                children: (
                  <>
                    <Text strong>{t('common:blockchain.step1')}</Text>
                    <br />
                    <Text type="secondary" className="text-xs">
                      {t('common:blockchain.step1Desc')}
                    </Text>
                  </>
                ),
              },
              {
                color: 'blue',
                children: (
                  <>
                    <Text strong>{t('common:blockchain.step2')}</Text>
                    <br />
                    <Text type="secondary" className="text-xs">
                      {t('common:blockchain.step2Desc')}
                    </Text>
                  </>
                ),
              },
              {
                color: 'purple',
                children: (
                  <>
                    <Text strong>{t('common:blockchain.step3')}</Text>
                    <br />
                    <Text type="secondary" className="text-xs">
                      {t('common:blockchain.step3Desc')}
                    </Text>
                  </>
                ),
              },
            ]}
          />
        </div>
      ),
    },
    {
      key: 'technical',
      label: (
        <span>
          <CodeOutlined /> {t('common:blockchain.technicalDetails')}
        </span>
      ),
      children: (
        <div className="space-y-4">
          <Text type="secondary" className="text-xs">
            {t('common:blockchain.forDevelopers')}
          </Text>

          {}
          <div>
            <Text className="font-semibold block mb-2">{t('common:blockchain.recordData')}</Text>
            <div className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96 font-mono text-xs">
              <pre>{JSON.stringify(record, null, 2)}</pre>
            </div>
            <Button
              className="mt-2"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => copyToClipboard(JSON.stringify(record, null, 2), 'Record data')}
            >
              {t('common:blockchain.copyJson')}
            </Button>
          </div>

          {}
          <div>
            <Text className="font-semibold block mb-2">{t('common:blockchain.apiEndpoints')}</Text>
            <div className="space-y-2">
              <div className="bg-slate-50 p-3 rounded-lg">
                <Text className="text-xs text-slate-500 block mb-1">Blockchain Record:</Text>
                <code className="text-xs">GET /api/vaccine-records/{record.id || '{id}'}</code>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg">
                <Text className="text-xs text-slate-500 block mb-1">FHIR Immunization:</Text>
                <code className="text-xs">
                  GET /api/fhir/Immunization?patient={record.patientId || '{patientId}'}
                </code>
              </div>
              {record.ipfsHash && (
                <div className="bg-slate-50 p-3 rounded-lg">
                  <Text className="text-xs text-slate-500 block mb-1">IPFS Gateway:</Text>
                  <code className="text-xs">https://ipfs.io/ipfs/{record.ipfsHash}</code>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <SafetyCertificateOutlined className="text-emerald-600" />
          <span>{t('common:blockchain.blockchainVerification')}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          {t('common:blockchain.close')}
        </Button>,
      ]}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
    </Modal>
  );
};

export default BlockchainVerificationModal;
