import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  MoreOutlined,
  PhoneOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Avatar,
  Button,
  Card,
  DatePicker,
  Dropdown,
  Form,
  Input,
  Modal,
  message,
  Select,
  Skeleton,
  Table,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/constants/index';
import { useFamilyMember } from '@/hooks/useFamilyMember';
import { callCreateMember, callDeleteMember, callUpdateMember } from '@/services/family.service';

const { Title, Text } = Typography;
const { Option } = Select;

const FamilyManagerTab = () => {
  const { t } = useTranslation(['client']);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form] = Form.useForm();
  const _queryClient = useQueryClient();

  const filter = {
    current: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
  };

  const { data, isPending: isLoading, error, refetch } = useFamilyMember(filter);

  const familyMembers =
    data?.result?.map((member, index) => ({
      ...member,
      key: member.id.toString(),
      bloodType: 'O+',
      allergies: 'None',
      emergencyContact: 'Emergency Contact',
      insuranceNumber: 'INS123456789',
      avatar: undefined,
      vaccinationStatus: index % 3 === 0 ? 'UP_TO_DATE' : index % 3 === 1 ? 'OVERDUE' : 'PARTIAL',
      totalVaccines: Math.floor(Math.random() * 10) + 5,
      lastVaccination: '2024-03-15',
    })) || [];

  const handleAddMember = () => {
    setEditingMember(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    form.setFieldsValue({
      fullName: member.fullName,
      relationship: member.relationship,
      dateOfBirth: member.dateOfBirth ? dayjs(member.dateOfBirth) : null,
      gender: member.gender,
      phone: member.phone,
      identityNumber: member.identityNumber,
      bloodType: member.bloodType,
      allergies: member.allergies,
      emergencyContact: member.emergencyContact,
      insuranceNumber: member.insuranceNumber,
    });
    setIsModalVisible(true);
  };

  const handleDeleteMember = async (memberId) => {
    try {
      await callDeleteMember(memberId);
      message.success(t('client:family.removeSuccess'));
      await refetch();
    } catch (_error) {
      message.error(t('client:family.removeFailed'));
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const apiData = {
        fullName: values.fullName,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : '',
        relationship: values.relationship,
        phone: values.phone,
        gender: values.gender,
        identityNumber: values.identityNumber,
      };

      if (editingMember) {
        await callUpdateMember({
          id: editingMember.id,
          ...apiData,
        });
        message.success(t('client:family.updateSuccess'));
      } else {
        await callCreateMember(apiData);
        message.success(t('client:family.addSuccess'));
      }

      setIsModalVisible(false);
      form.resetFields();
      await refetch();
    } catch (_error) {
      message.error(editingMember ? t('client:family.updateFailed') : t('client:family.addFailed'));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'UP_TO_DATE':
        return 'green';
      case 'OVERDUE':
        return 'red';
      case 'PARTIAL':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getMenuItems = (member) => [
    {
      key: 'edit',
      label: t('client:family.editDetails'),
      icon: <EditOutlined />,
      onClick: () => handleEditMember(member),
    },
    {
      key: 'delete',
      label: t('client:family.remove'),
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDeleteMember(member.id),
    },
  ];

  const columns = [
    {
      title: t('client:family.member'),
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar size={48} icon={<UserOutlined />} src={record.avatar} className="bg-blue-500" />
          <div>
            <Title level={5} className="mb-0 text-slate-800">
              {text}
            </Title>
            <Text type="secondary" className="text-xs">
              {t(`client:relationships.${record.relationship}`) || record.relationship} • ID:{' '}
              {record.id}
            </Text>
            <br />
            <Text type="secondary" className="text-xs">
              DOB: {record.dateOfBirth} • {record.gender}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: t('client:family.contactInfo'),
      dataIndex: 'phone',
      key: 'contact',
      render: (phone, record) => (
        <div>
          <div className="flex items-center gap-2 mb-1 text-slate-600">
            <PhoneOutlined className="text-blue-500" />
            <Text>{phone || 'N/A'}</Text>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <HomeOutlined className="text-green-500" />
            <Text type="secondary" className="text-xs">
              {t('client:profile.bloodType')}: {record.bloodType}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: t('client:family.vaccinationStatus'),
      dataIndex: 'vaccinationStatus',
      key: 'vaccinationStatus',
      render: (status, record) => (
        <div>
          <Tag color={getStatusColor(status)} className="mb-2 rounded-md border-0">
            {t(`client:blockchainAppointmentStatus.${status}`)}
          </Tag>
          <br />
          <div className="flex items-center gap-2 text-slate-600">
            <MedicineBoxOutlined className="text-purple-500" />
            <Text className="text-xs">
              {record.totalVaccines} {t('client:vaccinationHistory.vaccine').toLowerCase()}s
            </Text>
          </div>
          <Text type="secondary" className="text-xs block">
            {t('client:vaccinePassport.lastUpdated')}: {record.lastVaccination}
          </Text>
        </div>
      ),
    },
    {
      title: t('client:family.actions'),
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          menu={{ items: getMenuItems(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" icon={<MoreOutlined />} className="hover:bg-slate-100 rounded-full" />
        </Dropdown>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <Skeleton.Input active size="small" className="!w-48" />
          <Skeleton.Button active size="default" />
        </div>
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
    return (
      <Alert
        type="error"
        message={t('client:appointments.errorLoading')}
        description={t('client:appointments.errorLoading')}
        showIcon
        className="rounded-xl"
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Title level={3} className="!mb-1 text-slate-800">
            {t('client:family.familyHealthManager')}
          </Title>
          <Text className="text-slate-500 text-lg">{t('client:family.manageProfiles')}</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddMember}
          size="large"
          className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 rounded-xl px-6"
        >
          {t('client:family.addMember')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card
          size="small"
          className="rounded-2xl shadow-sm border border-slate-100 bg-gradient-to-br from-blue-50 to-white"
        >
          <div className="flex items-center justify-between p-2">
            <div>
              <Text className="text-slate-500 font-medium uppercase text-xs tracking-wider">
                {t('client:family.totalMembers')}
              </Text>
              <div className="text-3xl font-bold text-blue-600 mt-1">{familyMembers.length}</div>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <UserOutlined className="text-2xl text-blue-600" />
            </div>
          </div>
        </Card>

        <Card
          size="small"
          className="rounded-2xl shadow-sm border border-slate-100 bg-gradient-to-br from-green-50 to-white"
        >
          <div className="flex items-center justify-between p-2">
            <div>
              <Text className="text-slate-500 font-medium uppercase text-xs tracking-wider">
                {t('client:family.upToDate')}
              </Text>
              <div className="text-3xl font-bold text-green-600 mt-1">
                {familyMembers.filter((m) => m.vaccinationStatus === 'UP_TO_DATE').length}
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <MedicineBoxOutlined className="text-2xl text-green-600" />
            </div>
          </div>
        </Card>

        <Card
          size="small"
          className="rounded-2xl shadow-sm border border-slate-100 bg-gradient-to-br from-red-50 to-white"
        >
          <div className="flex items-center justify-between p-2">
            <div>
              <Text className="text-slate-500 font-medium uppercase text-xs tracking-wider">
                {t('client:family.needAttention')}
              </Text>
              <div className="text-3xl font-bold text-red-600 mt-1">
                {familyMembers.filter((m) => m.vaccinationStatus === 'OVERDUE').length}
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <CalendarOutlined className="text-2xl text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <Table
          columns={columns}
          dataSource={familyMembers}
          pagination={false}
          className="custom-table"
        />
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 mt-6 rounded-2xl">
        <Title level={5} className="text-blue-900">
          👨‍👩‍👧‍👦 {t('client:family.familyHealthTips')}
        </Title>
        <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc pl-4">
          <li>{t('client:family.tip1')}</li>
          <li>{t('client:family.tip2')}</li>
          <li>{t('client:family.tip3')}</li>
          <li>{t('client:family.tip4')}</li>
          <li>{t('client:family.tip5')}</li>
        </ul>
      </Card>

      <Modal
        title={
          editingMember ? t('client:family.editFamilyMember') : t('client:family.addFamilyMember')
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText={editingMember ? t('client:family.update') : t('client:family.add')}
        className="rounded-xl"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="fullName"
              label={t('client:family.fullName')}
              rules={[{ required: true, message: t('client:family.enterFullName') }]}
            >
              <Input placeholder={t('client:family.enterFullName')} className="rounded-lg" />
            </Form.Item>

            <Form.Item
              name="identityNumber"
              label={
                <span>
                  {t('client:family.identityNumber')} <span className="text-red-500">*</span>
                </span>
              }
              tooltip={t('client:family.identityTooltip')}
              rules={[
                { required: true, message: 'Please enter identity number' },
                {
                  pattern: /^[0-9]{9,12}$/,
                  message: 'Please enter a valid identity number (9-12 digits)',
                },
              ]}
            >
              <Input placeholder={t('client:family.enterIdentity')} className="rounded-lg" />
            </Form.Item>

            <Form.Item
              name="relationship"
              label={t('client:family.relationship')}
              rules={[{ required: true, message: t('client:family.selectRelationship') }]}
            >
              <Select placeholder={t('client:family.selectRelationship')} className="rounded-lg">
                <Option value="WIFE_HUSBAND">{t('client:relationships.WIFE_HUSBAND')}</Option>
                <Option value="SON">{t('client:relationships.SON')}</Option>
                <Option value="DAUGHTER">{t('client:relationships.DAUGHTER')}</Option>
                <Option value="FATHER">{t('client:relationships.FATHER')}</Option>
                <Option value="MOTHER">{t('client:relationships.MOTHER')}</Option>
                <Option value="BROTHER">{t('client:relationships.BROTHER')}</Option>
                <Option value="SISTER">{t('client:relationships.SISTER')}</Option>
                <Option value="OTHER">{t('client:relationships.OTHER')}</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="dateOfBirth"
              label={t('client:family.dateOfBirth')}
              rules={[{ required: true, message: t('client:family.selectDOB') }]}
            >
              <DatePicker
                className="w-full rounded-lg"
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </Form.Item>

            <Form.Item
              name="gender"
              label={t('client:family.gender')}
              rules={[{ required: true, message: t('client:family.selectGender') }]}
            >
              <Select placeholder={t('client:family.selectGender')} className="rounded-lg">
                <Option value="MALE">{t('client:family.male')}</Option>
                <Option value="FEMALE">{t('client:family.female')}</Option>
              </Select>
            </Form.Item>

            <Form.Item name="phone" label={t('client:family.phone')}>
              <Input placeholder={t('client:family.enterPhone')} className="rounded-lg" />
            </Form.Item>

            <Form.Item
              name="bloodType"
              label={t('client:family.bloodType')}
              rules={[{ required: true, message: t('client:family.selectBloodType') }]}
            >
              <Select placeholder={t('client:family.selectBloodType')} className="rounded-lg">
                <Option value="A">A</Option>
                <Option value="B">B</Option>
                <Option value="AB">AB</Option>
                <Option value="O">O</Option>
              </Select>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default FamilyManagerTab;
