import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Progress, Row, Statistic, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const DashboardTab = ({ onTabChange }) => {
  const { t } = useTranslation(['client']);
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Row */}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card className="rounded-2xl shadow-sm border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white h-full">
            <Statistic
              title={
                <span className="text-emerald-600 font-bold uppercase text-xs tracking-wider">
                  {t('client:dashboard.totalVaccines')}
                </span>
              }
              value={8}
              prefix={<MedicineBoxOutlined className="text-emerald-500 text-2xl mr-2" />}
              valueStyle={{ color: '#059669', fontWeight: 'bold' }}
            />
            <div className="mt-4 text-xs text-emerald-600 font-medium bg-emerald-100/50 px-2 py-1 rounded w-fit">
              {t('client:dashboard.plusThisYear')}
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="rounded-2xl shadow-sm border border-blue-100 bg-gradient-to-br from-blue-50 to-white h-full">
            <Statistic
              title={
                <span className="text-blue-600 font-bold uppercase text-xs tracking-wider">
                  {t('client:appointments.upcoming')}
                </span>
              }
              value={2}
              prefix={<CalendarOutlined className="text-blue-500 text-2xl mr-2" />}
              valueStyle={{ color: '#2563eb', fontWeight: 'bold' }}
            />
            <div className="mt-4 text-xs text-blue-600 font-medium bg-blue-100/50 px-2 py-1 rounded w-fit">
              {t('client:dashboard.nextDate')}
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="rounded-2xl shadow-sm border border-purple-100 bg-gradient-to-br from-purple-50 to-white h-full">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-purple-600 font-bold uppercase text-xs tracking-wider mb-1">
                  {t('client:dashboard.coverage')}
                </div>
                <div className="text-2xl font-bold text-purple-700">85%</div>
              </div>
              <Progress type="circle" percent={85} width={50} strokeColor="#9333ea" />
            </div>
            <div className="mt-4 text-xs text-purple-600 font-medium bg-purple-100/50 px-2 py-1 rounded w-fit">
              {t('client:dashboard.goodStatus')}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Next Appointment Card */}
      <Card className="rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
              <ClockCircleOutlined className="text-3xl" />
            </div>
            <div>
              <Tag color="blue" className="mb-2">
                {t('client:dashboard.nextAppointment')}
              </Tag>
              <Title level={4} className="!mb-1">
                Flu Vaccination (Dose 2)
              </Title>
              <Text type="secondary" className="flex items-center gap-2">
                <CalendarOutlined /> October 15, 2024 • 09:00 AM
              </Text>
            </div>
          </div>
          <Button
            type="primary"
            size="large"
            className="rounded-xl shadow-lg shadow-blue-500/20"
            onClick={() => onTabChange('3')}
          >
            {t('client:appointments.viewDetails')}
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card
        title={t('client:dashboard.recentActivity')}
        className="rounded-3xl shadow-sm border border-slate-100"
        extra={
          <Button type="link" onClick={() => onTabChange('2')}>
            {t('client:dashboard.viewAll')} <RightOutlined />
          </Button>
        }
      >
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircleOutlined />
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-800">COVID-19 Booster Shot</div>
                <div className="text-xs text-slate-500">Completed on Sep 20, 2024</div>
              </div>
              <Tag color="success">{t('client:vaccinePassport.completed')}</Tag>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DashboardTab;
