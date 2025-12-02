import {
  CalendarOutlined,
  CheckCircleOutlined,
  ExperimentOutlined,
  MedicineBoxOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Alert, Card, Descriptions, Empty, Spin, Table, Tag, Typography } from 'antd';
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
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <MedicineBoxOutlined className="text-blue-600 text-lg" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{text}</div>
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
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-green-500" />
          <span>{new Date(date).toLocaleDateString('vi-VN')}</span>
        </div>
      ),
    },
    {
      title: 'Site',
      dataIndex: 'site',
      key: 'site',
      render: (site) => <Tag color="blue">{site?.replace('_', ' ') || 'N/A'}</Tag>,
    },
    {
      title: 'Lot Number',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
      render: (lot) => (
        <div className="flex items-center gap-2">
          <ExperimentOutlined className="text-purple-500" />
          <Text className="font-mono text-sm">{lot || 'N/A'}</Text>
        </div>
      ),
    },
    {
      title: 'Doctor',
      dataIndex: 'doctorName',
      key: 'doctorName',
      render: (name) => (
        <div className="flex items-center gap-2">
          <UserOutlined className="text-gray-400" />
          <span>{name || 'N/A'}</span>
        </div>
      ),
    },
    {
      title: 'Center',
      dataIndex: 'centerName',
      key: 'centerName',
      render: (name) => <Text type="secondary">{name || 'N/A'}</Text>,
    },
    {
      title: 'Status',
      key: 'status',
      render: () => (
        <Tag icon={<CheckCircleOutlined />} color="success">
          Completed
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} showIcon className="mb-4" />;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card size="small" className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <Text type="secondary">Total Records</Text>
              <div className="text-2xl font-bold text-blue-600">{records.length}</div>
            </div>
            <SafetyCertificateOutlined className="text-3xl text-blue-500" />
          </div>
        </Card>

        <Card size="small" className="border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <Text type="secondary">Vaccines Taken</Text>
              <div className="text-2xl font-bold text-green-600">
                {new Set(records.map((r) => r.vaccineName)).size}
              </div>
            </div>
            <MedicineBoxOutlined className="text-3xl text-green-500" />
          </div>
        </Card>

        <Card size="small" className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <Text type="secondary">Last Vaccination</Text>
              <div className="text-sm font-bold text-purple-600">
                {records.length > 0
                  ? new Date(
                      Math.max(...records.map((r) => new Date(r.vaccinationDate)))
                    ).toLocaleDateString('vi-VN')
                  : 'N/A'}
              </div>
            </div>
            <CalendarOutlined className="text-3xl text-purple-500" />
          </div>
        </Card>
      </div>

      <Card className="shadow-sm">
        <Title level={5} className="mb-4">
          Vaccination Records
        </Title>
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
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Descriptions bordered size="small" column={2}>
                    <Descriptions.Item label="Patient Identity Hash" span={2}>
                      <Text className="font-mono text-xs">{record.patientIdentityHash}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Appointment ID">
                      {record.appointmentId}
                    </Descriptions.Item>
                    <Descriptions.Item label="Expiry Date">
                      {record.expiryDate
                        ? new Date(record.expiryDate).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="IPFS Hash" span={2}>
                      <Text className="font-mono text-xs">{record.ipfsHash || 'N/A'}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Notes" span={2}>
                      {record.notes || 'No additional notes'}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              ),
            }}
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No vaccination records found" />
        )}
      </Card>

      <Card className="bg-blue-50 mt-4">
        <Title level={5}>📋 About Vaccine Records</Title>
        <ul className="text-sm text-gray-600 mt-2 space-y-1">
          <li>• All vaccination records are stored securely on blockchain</li>
          <li>• Each record is immutable and verifiable</li>
          <li>• Records include complete vaccination details and doctor information</li>
          <li>• You can access your records anytime for verification purposes</li>
        </ul>
      </Card>
    </div>
  );
};

export default VaccineRecordTab;
