import { useState } from 'react';
import {
  Typography,
  Button,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Card,
  Avatar,
  Dropdown,
  message,
  Spin,
  Alert,
} from 'antd';
import dayjs from 'dayjs';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  MoreOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  PhoneOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useFamilyMember } from '../../hooks/useFamilyMember';
import {
  callCreateMember,
  callDeleteMember,
  callUpdateMember,
} from '../../services/family.service';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../../constants/index';

const { Title, Text } = Typography;
const { Option } = Select;

const FamilyManagerTab = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form] = Form.useForm();
  const [refreshKey, setRefreshKey] = useState(0);

  const filter = {
    current: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
  };

  const { data, isLoading, error } = useFamilyMember(filter);

  const familyMembers =
    data?.result?.map((member, index) => ({
      ...member,
      key: member.id.toString(),
      bloodType: 'O+',
      allergies: 'None',
      emergencyContact: 'Emergency Contact',
      insuranceNumber: 'INS123456789',
      avatar: undefined,
      vaccinationStatus:
        index % 3 === 0 ? 'Up to Date' : index % 3 === 1 ? 'Overdue' : 'Partial',
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
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      message.error('Failed to remove family member. Please try again.');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const apiData = {
        fullName: values.fullName,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format('YYYY-MM-DD')
          : '',
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
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      message.error(
        editingMember
          ? 'Failed to update family member'
          : 'Failed to add family member'
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
          <Avatar
            size={48}
            icon={<UserOutlined />}
            src={record.avatar}
            className="bg-blue-500"
          />
          <div>
            <Title level={5} className="mb-0">
              {text}
            </Title>
            <Text type="secondary" className="text-sm">
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
          <div className="flex items-center gap-2 mb-1">
            <PhoneOutlined className="text-blue-500" />
            <Text>{phone || 'N/A'}</Text>
          </div>
          <div className="flex items-center gap-2">
            <HomeOutlined className="text-green-500" />
            <Text type="secondary" className="text-sm">
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
          <Tag color={getStatusColor(status)} className="mb-2">
            {status}
          </Tag>
          <br />
          <div className="flex items-center gap-2">
            <MedicineBoxOutlined className="text-purple-500" />
            <Text className="text-sm">{record.totalVaccines} vaccines</Text>
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
          <Button
            type="text"
            icon={<MoreOutlined />}
            className="hover:bg-gray-100"
          />
        </Dropdown>
      ),
    },
  ];

  if (error) {
    return (
      <Alert
        type="error"
        message="Error loading family members"
        description="Failed to fetch family member data"
        showIcon
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <Title level={4}>Family Health Manager</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddMember}
          className="bg-green-600 hover:bg-green-700"
        >
          Add Family Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card size="small" className="border-l-4 border-l-blue-400">
          <div className="flex items-center justify-between">
            <div>
              <Text type="secondary">Total Members</Text>
              <div className="text-2xl font-bold text-blue-600">
                {familyMembers.length}
              </div>
            </div>
            <UserOutlined className="text-3xl text-blue-500" />
          </div>
        </Card>

        <Card size="small" className="border-l-4 border-l-green-400">
          <div className="flex items-center justify-between">
            <div>
              <Text type="secondary">Up to Date</Text>
              <div className="text-2xl font-bold text-green-600">
                {familyMembers.filter((m) => m.vaccinationStatus === 'Up to Date').length}
              </div>
            </div>
            <MedicineBoxOutlined className="text-3xl text-green-500" />
          </div>
        </Card>

        <Card size="small" className="border-l-4 border-l-red-400">
          <div className="flex items-center justify-between">
            <div>
              <Text type="secondary">Need Attention</Text>
              <div className="text-2xl font-bold text-red-600">
                {familyMembers.filter((m) => m.vaccinationStatus === 'Overdue').length}
              </div>
            </div>
            <CalendarOutlined className="text-3xl text-red-500" />
          </div>
        </Card>
      </div>

      <Table
        columns={columns}
        dataSource={familyMembers}
        pagination={false}
        className="mb-4"
        loading={isLoading}
      />

      <Card className="bg-blue-50">
        <Title level={5}>👨‍👩‍👧‍👦 Family Health Tips</Title>
        <ul className="text-sm text-gray-600 mt-2 space-y-1">
          <li>• Keep all family vaccination records synchronized</li>
          <li>• Schedule family appointments together when possible</li>
          <li>• Maintain emergency contact information up to date</li>
          <li>• Share allergy information with healthcare providers</li>
          <li>• Regular family health checkups are recommended</li>
        </ul>
      </Card>

      <Modal
        title={editingMember ? 'Edit Family Member' : 'Add Family Member'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText={editingMember ? 'Update' : 'Add'}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter name' }]}
            >
              <Input placeholder="Enter full name" />
            </Form.Item>

            <Form.Item
              name="identityNumber"
              label="Identity Number"
              rules={[{ required: true, message: 'Please enter identity number' }]}
            >
              <Input placeholder="Enter full identity number" />
            </Form.Item>

            <Form.Item
              name="relationship"
              label="Relationship"
              rules={[{ required: true, message: 'Please select relationship' }]}
            >
              <Select placeholder="Select relationship">
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
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true, message: 'Please select gender' }]}
            >
              <Select placeholder="Select gender">
                <Option value="MALE">Male</Option>
                <Option value="FEMALE">Female</Option>
              </Select>
            </Form.Item>

            <Form.Item name="phone" label="Phone Number">
              <Input placeholder="Enter phone number" />
            </Form.Item>

            <Form.Item
              name="bloodType"
              label="Blood Type"
              rules={[{ required: true, message: 'Please select blood type' }]}
            >
              <Select placeholder="Select blood type">
                <Option value="A">A</Option>
                <Option value="B">B</Option>
                <Option value="AB">AB</Option>
                <Option value="O">O</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="allergies" label="Known Allergies">
            <Input.TextArea rows={2} placeholder="Enter any known allergies" />
          </Form.Item>

          <Form.Item name="emergencyContact" label="Emergency Contact">
            <Input placeholder="Name and phone number" />
          </Form.Item>

          <Form.Item name="insuranceNumber" label="Insurance Number">
            <Input placeholder="Enter insurance number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FamilyManagerTab;
