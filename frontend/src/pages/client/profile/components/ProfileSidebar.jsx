import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  HistoryOutlined,
  MedicineBoxOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Badge, Card, Col, Menu, Row, Statistic } from 'antd';

const ProfileSidebar = ({
  totalVaccines,
  upcomingAppointments,
  coveragePercentage,
  nextAppointment,
  onTabChange,
  activeTab,
}) => {
  const menuItems = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: 'Health Profile',
    },
    {
      key: '2',
      icon: <HistoryOutlined />,
      label: (
        <span className="flex justify-between items-center w-full">
          Vaccination History
          <Badge count={totalVaccines} style={{ backgroundColor: '#52c41a' }} />
        </span>
      ),
    },
    {
      key: '3',
      icon: <CalendarOutlined />,
      label: (
        <span className="flex justify-between items-center w-full">
          Appointments
          <Badge count={upcomingAppointments} />
        </span>
      ),
    },
    {
      key: '4',
      icon: <HeartOutlined />,
      label: 'Health Reminders',
    },
    {
      key: '5',
      icon: <TeamOutlined />,
      label: 'Family Manager',
    },
    {
      key: '6',
      icon: <SafetyCertificateOutlined />,
      label: 'Vaccine Passport',
      className: 'bg-gradient-to-r from-purple-50 to-blue-50',
    },
  ];

  const handleMenuClick = (e) => {
    onTabChange(e.key);
  };

  return (
    <>
      <Card className="rounded-xl shadow-sm border-0 !mb-6">
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          onClick={handleMenuClick}
          items={menuItems}
          className="border-0"
          style={{
            background: 'transparent',
          }}
        />
      </Card>

      <Card className="rounded-xl shadow-sm border-0 ">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Health Overview</h3>
        </div>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <Statistic
                title={<span className="text-green-700 font-medium">Total Vaccines</span>}
                value={totalVaccines}
                prefix={<MedicineBoxOutlined className="text-green-600" />}
                styles={{ content: { color: '#059669', fontWeight: 'bold' } }}
              />
            </Card>
          </Col>
          <Col span={24}>
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <Statistic
                title={<span className="text-blue-700 font-medium">Upcoming</span>}
                value={upcomingAppointments}
                prefix={<ClockCircleOutlined className="text-blue-600" />}
                suffix="appointments"
                styles={{ content: { color: '#0284c7', fontWeight: 'bold' } }}
              />
            </Card>
          </Col>
          <Col span={24}>
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <Statistic
                title={<span className="text-purple-700 font-medium">Coverage</span>}
                value={coveragePercentage}
                prefix={<CheckCircleOutlined className="text-purple-600" />}
                suffix="%"
                styles={{ content: { color: '#9333ea', fontWeight: 'bold' } }}
              />
            </Card>
          </Col>
        </Row>
        {nextAppointment && (
          <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
            <p className="text-xs text-orange-700 font-medium mb-1">NEXT APPOINTMENT</p>
            <p className="text-sm font-semibold text-orange-900">{nextAppointment}</p>
          </div>
        )}
      </Card>
    </>
  );
};

export default ProfileSidebar;
