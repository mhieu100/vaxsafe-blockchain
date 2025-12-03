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
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/constants/index';
import { useFamilyMember } from '@/hooks/useFamilyMember';
import { callCreateMember, callDeleteMember, callUpdateMember } from '@/services/family.service';

const { Title, Text } = Typography;
const { Option } = Select;

const FamilyManagerTab = () => {
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
      vaccinationStatus: index % 3 === 0 ? 'Up to Date' : index % 3 === 1 ? 'Overdue' : 'Partial',
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
      message.success('Family member removed successfully');
      await refetch();
    } catch (_error) {
      message.error('Failed to remove family member. Please try again.');
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
        message.success('Family member updated successfully');
      } else {
        await callCreateMember(apiData);
        message.success('Family member added successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
      await refetch();
    } catch (_error) {
      message.error(
        editingMember ? 'Failed to update family member' : 'Failed to add family member'
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Up to Date':
        return 'green';
      case 'Overdue':
        return 'red';
      case 'Partial':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getMenuItems = (member) => [
    {
      key: 'edit',
      label: 'Edit Details',
      icon: <EditOutlined />,
      onClick: () => handleEditMember(member),
    },
    {
      key: 'delete',
      label: 'Remove',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDeleteMember(member.id),
    },
  ];

  const columns = [
    {
      title: 'Member',
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
              {record.relationship} • ID: {record.id}
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
      title: 'Contact Info',
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
              Blood Type: {record.bloodType}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Vaccination Status',
      dataIndex: 'vaccinationStatus',
      key: 'vaccinationStatus',
      render: (status, record) => (
        <div>
          <Tag color={getStatusColor(status)} className="mb-2 rounded-md border-0">
            {status}
          </Tag>
          <br />
          <div className="flex items-center gap-2 text-slate-600">
            <MedicineBoxOutlined className="text-purple-500" />
            <Text className="text-xs">{record.totalVaccines} vaccines</Text>
          </div>
          <Text type="secondary" className="text-xs block">
            Last: {record.lastVaccination}
          </Text>
        </div>
      ),
    },
    {
      title: 'Actions',
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
        message="Error loading family members"
        description="Failed to fetch family member data"
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
            Family Health Manager
          </Title>
          <Text className="text-slate-500 text-lg">Manage health profiles for your loved ones</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddMember}
          size="large"
          className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 rounded-xl px-6"
        >
          Add Member
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
                Total Members
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
                Up to Date
              </Text>
              <div className="text-3xl font-bold text-green-600 mt-1">
                {familyMembers.filter((m) => m.vaccinationStatus === 'Up to Date').length}
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
                Need Attention
              </Text>
              <div className="text-3xl font-bold text-red-600 mt-1">
                {familyMembers.filter((m) => m.vaccinationStatus === 'Overdue').length}
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
          👨‍👩‍👧‍👦 Family Health Tips
        </Title>
        <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc pl-4">
          <li>Keep all family vaccination records synchronized</li>
          <li>Schedule family appointments together when possible</li>
          <li>Maintain emergency contact information up to date</li>
          <li>Share allergy information with healthcare providers</li>
          <li>Regular family health checkups are recommended</li>
        </ul>
      </Card>

      <Modal
        title={editingMember ? 'Edit Family Member' : 'Add Family Member'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText={editingMember ? 'Update' : 'Add'}
        className="rounded-xl"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter name' }]}
            >
              <Input placeholder="Enter full name" className="rounded-lg" />
            </Form.Item>

            <Form.Item
              name="identityNumber"
              label={
                <span>
                  Identity No. / Personal ID <span className="text-red-500">*</span>
                </span>
              }
              tooltip="For children under 14, please use the Personal ID Code found on the Birth Certificate."
              rules={[
                { required: true, message: 'Please enter identity number' },
                {
                  pattern: /^[0-9]{9,12}$/,
                  message: 'Please enter a valid identity number (9-12 digits)',
                },
              ]}
            >
              <Input
                placeholder="Enter Identity Number or Personal ID Code"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="relationship"
              label="Relationship"
              rules={[{ required: true, message: 'Please select relationship' }]}
            >
              <Select placeholder="Select relationship" className="rounded-lg">
                <Option value="Vợ/Chồng">Vợ/Chồng</Option>
                <Option value="Con trai">Con trai</Option>
                <Option value="Con gái">Con gái</Option>
                <Option value="Bố">Bố</Option>
                <Option value="Mẹ">Mẹ</Option>
                <Option value="Anh/Em trai">Anh/Em trai</Option>
                <Option value="Chị/Em gái">Chị/Em gái</Option>
                <Option value="Khác">Khác</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="dateOfBirth"
              label="Date of Birth"
              rules={[{ required: true, message: 'Please select date of birth' }]}
            >
              <DatePicker
                className="w-full rounded-lg"
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </Form.Item>

            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true, message: 'Please select gender' }]}
            >
              <Select placeholder="Select gender" className="rounded-lg">
                <Option value="MALE">Male</Option>
                <Option value="FEMALE">Female</Option>
              </Select>
            </Form.Item>

            <Form.Item name="phone" label="Phone Number">
              <Input placeholder="Enter phone number" className="rounded-lg" />
            </Form.Item>

            <Form.Item
              name="bloodType"
              label="Blood Type"
              rules={[{ required: true, message: 'Please select blood type' }]}
            >
              <Select placeholder="Select blood type" className="rounded-lg">
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
