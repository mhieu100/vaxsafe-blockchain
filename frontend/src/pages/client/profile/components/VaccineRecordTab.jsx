import {
  CalendarOutlined,
  CheckCircleFilled,
  ExperimentOutlined,
  MedicineBoxOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Descriptions, Empty, Skeleton, Table, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BlockchainBadge from '@/components/common/BlockchainBadge';
import BlockchainVerificationModal from '@/components/common/BlockchainVerificationModal';
import apiClient from '@/services/apiClient';
import useAccountStore from '@/stores/useAccountStore';

const { Title, Text } = Typography;

const VaccineRecordTab = () => {
  const { t, i18n } = useTranslation(['client']);
  const { user } = useAccountStore();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);

  useEffect(() => {
    const fetchVaccineRecords = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get(`/api/vaccine-records/patient/${user.id}`);

        if (response.data) {
          setRecords(response.data);
        }
      } catch (err) {
        console.error('Error fetching vaccine records:', err);
        setError(t('client:vaccinePassport.errorFetch'));
      } finally {
        setLoading(false);
      }
    };

    fetchVaccineRecords();
  }, [user?.id]);

  const columns = [
    {
      title: t('client:vaccinePassport.vaccine'),
      dataIndex: 'vaccineName',
      key: 'vaccineName',
      width: 200,
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
            <MedicineBoxOutlined className="text-blue-600 text-lg" />
          </div>
          <div>
            <div className="font-medium text-slate-800 line-clamp-2">{text}</div>
            <Text type="secondary" className="text-xs">
              {t('client:vaccinePassport.dose')} #{record.doseNumber}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: t('client:vaccinePassport.date'),
      dataIndex: 'vaccinationDate',
      key: 'vaccinationDate',
      width: 140,
      render: (date) => (
        <div className="flex items-center gap-2 text-slate-600">
          <CalendarOutlined className="text-emerald-500" />
          <span>{new Date(date).toLocaleDateString(i18n.language)}</span>
        </div>
      ),
    },
    {
      title: t('client:vaccinePassport.site'),
      dataIndex: 'site',
      key: 'site',
      width: 120,
      render: (site) => (
        <Tag color="blue" className="rounded-md border-0 bg-blue-50 text-blue-600">
          {site?.replace('_', ' ') || 'N/A'}
        </Tag>
      ),
    },
    {
      title: t('client:vaccinePassport.lotNumber'),
      dataIndex: 'lotNumber',
      key: 'lotNumber',
      width: 130,
      render: (lot) => (
        <div className="flex items-center gap-2">
          <ExperimentOutlined className="text-purple-500" />
          <Text className="font-mono text-sm text-slate-600">{lot || 'N/A'}</Text>
        </div>
      ),
    },
    {
      title: t('client:vaccinePassport.doctor'),
      dataIndex: 'doctorName',
      key: 'doctorName',
      width: 180,
      render: (name) => (
        <div className="flex items-center gap-2 text-slate-600">
          <UserOutlined className="text-slate-400" />
          <span className="line-clamp-1" title={name}>
            {name || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      title: t('client:vaccinePassport.center'),
      dataIndex: 'centerName',
      key: 'centerName',
      width: 200,
      render: (name) => (
        <Text className="text-slate-500 line-clamp-2" title={name}>
          {name || 'N/A'}
        </Text>
      ),
    },
    {
      title: t('client:vaccinePassport.status'),
      key: 'status',
      width: 160,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Tag icon={<CheckCircleFilled />} color="success" className="rounded-full px-3 border-0">
            {t('client:vaccinePassport.completed')}
          </Tag>
          {record.transactionHash && <BlockchainBadge verified={true} compact={true} />}
        </div>
      ),
    },
    {
      title: t('client:vaccinePassport.actions'),
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) =>
        record.transactionHash && (
          <Button
            type="link"
            size="small"
            icon={<SafetyCertificateOutlined />}
            onClick={() => {
              setSelectedRecord(record);
              setVerificationModalOpen(true);
            }}
          >
            {t('client:vaccinePassport.verify')}
          </Button>
        ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-2xl shadow-sm border border-slate-100">
              <Skeleton active paragraph={{ rows: 1 }} title={{ width: 60 }} />
            </Card>
          ))}
        </div>
        <Card className="rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <Skeleton active paragraph={{ rows: 5 }} />
        </Card>
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} showIcon className="mb-4 rounded-xl" />;
  }

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card
          size="small"
          className="rounded-2xl shadow-sm border border-slate-100 bg-gradient-to-br from-blue-50 to-white"
        >
          <div className="flex items-center justify-between p-2">
            <div>
              <Text className="text-slate-500 font-medium uppercase text-xs tracking-wider">
                {t('client:vaccinePassport.totalRecords')}
              </Text>
              <div className="text-3xl font-bold text-blue-600 mt-1">{records.length}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <SafetyCertificateOutlined className="text-2xl text-blue-600" />
            </div>
          </div>
        </Card>

        <Card
          size="small"
          className="rounded-2xl shadow-sm border border-slate-100 bg-gradient-to-br from-emerald-50 to-white"
        >
          <div className="flex items-center justify-between p-2">
            <div>
              <Text className="text-slate-500 font-medium uppercase text-xs tracking-wider">
                {t('client:vaccinePassport.vaccinesTaken')}
              </Text>
              <div className="text-3xl font-bold text-emerald-600 mt-1">
                {new Set(records.map((r) => r.vaccineName)).size}
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <MedicineBoxOutlined className="text-2xl text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card
          size="small"
          className="rounded-2xl shadow-sm border border-slate-100 bg-gradient-to-br from-purple-50 to-white"
        >
          <div className="flex items-center justify-between p-2">
            <div>
              <Text className="text-slate-500 font-medium uppercase text-xs tracking-wider">
                {t('client:vaccinePassport.lastVaccination')}
              </Text>
              <div className="text-lg font-bold text-purple-600 mt-2">
                {records.length > 0
                  ? new Date(
                      Math.max(...records.map((r) => new Date(r.vaccinationDate)))
                    ).toLocaleDateString(i18n.language)
                  : 'N/A'}
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <CalendarOutlined className="text-2xl text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="mb-4 px-2">
          <Title level={4} className="!mb-1 text-slate-800">
            {t('client:vaccinePassport.recordsTitle')}
          </Title>
          <Text className="text-slate-500">{t('client:vaccinePassport.recordsSubtitle')}</Text>
        </div>

        {records.length > 0 ? (
          <Table
            columns={columns}
            dataSource={records.map((record) => ({
              ...record,
              key: record.id,
            }))}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => t('client:vaccinePassport.totalRecordsCount', { count: total }),
            }}
            scroll={{ x: 1200 }}
            expandable={{
              expandedRowRender: (record) => (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 m-2">
                  <Descriptions bordered size="small" column={2} className="bg-white rounded-lg">
                    <Descriptions.Item
                      label={t('client:vaccinePassport.patientIdentityHash')}
                      span={2}
                    >
                      <Text className="font-mono text-xs text-slate-500">
                        {record.patientIdentityHash}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label={t('client:vaccinePassport.appointmentId')}>
                      <span className="font-mono text-slate-700">{record.appointmentId}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label={t('client:vaccinePassport.expiryDate')}>
                      {record.expiryDate
                        ? new Date(record.expiryDate).toLocaleDateString(i18n.language)
                        : 'N/A'}
                    </Descriptions.Item>

                    {}
                    {record.transactionHash && (
                      <>
                        <Descriptions.Item
                          label={t('client:vaccinePassport.blockchainRecord')}
                          span={2}
                        >
                          <div className="flex items-center gap-2">
                            <BlockchainBadge verified={true} />
                            <Button
                              type="link"
                              size="small"
                              onClick={() => {
                                setSelectedRecord(record);
                                setVerificationModalOpen(true);
                              }}
                            >
                              {t('client:vaccinePassport.viewDetails')}
                            </Button>
                          </div>
                        </Descriptions.Item>
                        <Descriptions.Item
                          label={t('client:vaccinePassport.transactionHash')}
                          span={2}
                        >
                          <Text className="font-mono text-xs text-emerald-600 break-all">
                            {record.transactionHash}
                          </Text>
                        </Descriptions.Item>
                      </>
                    )}

                    <Descriptions.Item label={t('client:vaccinePassport.ipfsHash')} span={2}>
                      <div className="flex items-center gap-2">
                        <Text className="font-mono text-xs text-blue-600">
                          {record.ipfsHash || 'N/A'}
                        </Text>
                        {record.ipfsHash && (
                          <Button
                            type="link"
                            size="small"
                            href={`https://ipfs.io/ipfs/${record.ipfsHash}`}
                            target="_blank"
                          >
                            {t('client:vaccinePassport.viewOnIpfs')}
                          </Button>
                        )}
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label={t('client:vaccinePassport.notes')} span={2}>
                      {record.notes || (
                        <span className="text-slate-400 italic">
                          {t('client:vaccinePassport.noNotes')}
                        </span>
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              ),
            }}
            className="custom-table"
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t('client:vaccinePassport.noRecords')}
          />
        )}
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 mt-6 rounded-2xl">
        <Title level={5} className="text-blue-900">
          📋 {t('client:vaccinePassport.aboutTitle')}
        </Title>
        <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc pl-4">
          <li>{t('client:vaccinePassport.aboutPoint1')}</li>
          <li>{t('client:vaccinePassport.aboutPoint2')}</li>
          <li>{t('client:vaccinePassport.aboutPoint3')}</li>
          <li>{t('client:vaccinePassport.aboutPoint4')}</li>
        </ul>
      </Card>

      {}
      <BlockchainVerificationModal
        open={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        record={selectedRecord}
      />
    </div>
  );
};

export default VaccineRecordTab;
