import {
  CalendarOutlined,
  CheckCircleFilled,
  ExperimentOutlined,
  MedicineBoxOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, Card, Descriptions, Empty, Skeleton, Table, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import apiClient from '@/services/apiClient';
import useAccountStore from '@/stores/useAccountStore';

const { Title, Text } = Typography;

const VaccineRecordTab = () => {
  const { user } = useAccountStore();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVaccineRecords = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch vaccine records from backend
        const response = await apiClient.get(`/api/vaccine-records/patient/${user.id}`);

        if (response.data) {
          setRecords(response.data);
        }
      } catch (err) {
        console.error('Error fetching vaccine records:', err);
        setError('Failed to load vaccine records. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVaccineRecords();
  }, [user?.id]);

  const columns = [
    {
      title: 'Vaccine',
      dataIndex: 'vaccineName',
      key: 'vaccineName',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <MedicineBoxOutlined className="text-blue-600 text-lg" />
          </div>
          <div>
            <div className="font-medium text-slate-800">{text}</div>
            <Text type="secondary" className="text-xs">
              Dose #{record.doseNumber}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Vaccination Date',
      dataIndex: 'vaccinationDate',
      key: 'vaccinationDate',
      render: (date) => (
        <div className="flex items-center gap-2 text-slate-600">
          <CalendarOutlined className="text-emerald-500" />
          <span>{new Date(date).toLocaleDateString('vi-VN')}</span>
        </div>
      ),
    },
    {
      title: 'Site',
      dataIndex: 'site',
      key: 'site',
      render: (site) => (
        <Tag color="blue" className="rounded-md border-0 bg-blue-50 text-blue-600">
          {site?.replace('_', ' ') || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Lot Number',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
      render: (lot) => (
        <div className="flex items-center gap-2">
          <ExperimentOutlined className="text-purple-500" />
          <Text className="font-mono text-sm text-slate-600">{lot || 'N/A'}</Text>
        </div>
      ),
    },
    {
      title: 'Doctor',
      dataIndex: 'doctorName',
      key: 'doctorName',
      render: (name) => (
        <div className="flex items-center gap-2 text-slate-600">
          <UserOutlined className="text-slate-400" />
          <span>{name || 'N/A'}</span>
        </div>
      ),
    },
    {
      title: 'Center',
      dataIndex: 'centerName',
      key: 'centerName',
      render: (name) => <Text className="text-slate-500">{name || 'N/A'}</Text>,
    },
    {
      title: 'Status',
      key: 'status',
      render: () => (
        <Tag icon={<CheckCircleFilled />} color="success" className="rounded-full px-3 border-0">
          Completed
        </Tag>
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
                Total Records
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
                Vaccines Taken
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
                Last Vaccination
              </Text>
              <div className="text-lg font-bold text-purple-600 mt-2">
                {records.length > 0
                  ? new Date(
                      Math.max(...records.map((r) => new Date(r.vaccinationDate)))
                    ).toLocaleDateString('vi-VN')
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
            Vaccination Records
          </Title>
          <Text className="text-slate-500">Official medical records stored on blockchain</Text>
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
              showTotal: (total) => `Total ${total} records`,
            }}
            expandable={{
              expandedRowRender: (record) => (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 m-2">
                  <Descriptions bordered size="small" column={2} className="bg-white rounded-lg">
                    <Descriptions.Item label="Patient Identity Hash" span={2}>
                      <Text className="font-mono text-xs text-slate-500">
                        {record.patientIdentityHash}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Appointment ID">
                      <span className="font-mono text-slate-700">{record.appointmentId}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Expiry Date">
                      {record.expiryDate
                        ? new Date(record.expiryDate).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="IPFS Hash" span={2}>
                      <Text className="font-mono text-xs text-blue-600">
                        {record.ipfsHash || 'N/A'}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Notes" span={2}>
                      {record.notes || (
                        <span className="text-slate-400 italic">No additional notes</span>
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              ),
            }}
            className="custom-table"
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No vaccination records found" />
        )}
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 mt-6 rounded-2xl">
        <Title level={5} className="text-blue-900">
          📋 About Vaccine Records
        </Title>
        <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc pl-4">
          <li>All vaccination records are stored securely on blockchain</li>
          <li>Each record is immutable and verifiable</li>
          <li>Records include complete vaccination details and doctor information</li>
          <li>You can access your records anytime for verification purposes</li>
        </ul>
      </Card>
    </div>
  );
};

export default VaccineRecordTab;
