import { CalendarOutlined, ClockCircleOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { Card, Col, Progress, Row, Statistic, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { useTranslation } from 'react-i18next';
import VaccinationHistoryTab from '../../profile/components/VaccinationHistoryTab';
import VaccineRecordTab from '../../profile/components/VaccineRecordTab';

dayjs.extend(isSameOrAfter);

const { Title, Text } = Typography;

const FamilyDashboard = ({ member, history, onTabChange }) => {
  const { t } = useTranslation(['client']);

  const totalVaccines = new Set(history.map((r) => r.vaccineName)).size;

  const coverage = Math.min(Math.round((totalVaccines / 12) * 100), 100);

  let nextAppointment = null;
  history.forEach((route) => {
    if (route.appointments) {
      route.appointments.forEach((apt) => {
        const status = apt.status || apt.appointmentStatus;
        if (status !== 'CANCELLED' && status !== 'COMPLETED') {
          const aptDate = dayjs(apt.scheduledDate);
          if (aptDate.isSameOrAfter(dayjs(), 'day')) {
            if (!nextAppointment || aptDate.isBefore(dayjs(nextAppointment.displayDate))) {
              nextAppointment = {
                ...apt,
                vaccineName: route.vaccineName,
                displayDate: aptDate,
                doseNumber: apt.doseNumber,
              };
            }
          }
        }
      });
    }
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card className="rounded-2xl shadow-sm border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white h-full">
            <Statistic
              title={
                <span className="text-emerald-600 font-bold uppercase text-xs tracking-wider">
                  {t('client:dashboard.totalVaccines')}
                </span>
              }
              value={totalVaccines}
              prefix={<MedicineBoxOutlined className="text-emerald-500 text-2xl mr-2" />}
              valueStyle={{ color: '#059669', fontWeight: 'bold' }}
            />
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
              value={nextAppointment ? 1 : 0}
              prefix={<CalendarOutlined className="text-blue-500 text-2xl mr-2" />}
              valueStyle={{ color: '#2563eb', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="rounded-2xl shadow-sm border border-purple-100 bg-gradient-to-br from-purple-50 to-white h-full">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-purple-600 font-bold uppercase text-xs tracking-wider mb-1">
                  {t('client:dashboard.coverage')}
                </div>
                <div className="text-2xl font-bold text-purple-700">{coverage}%</div>
              </div>
              <Progress type="circle" percent={coverage} size={50} strokeColor="#9333ea" />
            </div>
          </Card>
        </Col>
      </Row>

      <Card className="rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {nextAppointment ? (
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                <ClockCircleOutlined className="text-3xl" />
              </div>
              <div>
                <Tag color="cyan" className="mb-2">
                  {t('client:dashboard.nextAppointment')}
                </Tag>
                <Title level={4} className="!mb-1">
                  {nextAppointment.vaccineName} ({t('client:vaccinationHistory.dose')}{' '}
                  {nextAppointment.doseNumber})
                </Title>
                <Text type="secondary" className="flex items-center gap-2">
                  <CalendarOutlined /> {dayjs(nextAppointment.scheduledDate).format('DD/MM/YYYY')}
                </Text>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Text type="secondary">{t('client:appointments.noUpcoming')}</Text>
          </div>
        )}
      </Card>
    </div>
  );
};

const FamilyMemberTabs = ({ activeTab, onTabChange, member, history, familyMemberId }) => {
  const { t } = useTranslation(['client']);

  const tabConfig = {
    1: {
      title: t('client:sidebar.dashboard'),
      content: <FamilyDashboard member={member} history={history} onTabChange={onTabChange} />,
    },
    2: {
      title: t('client:sidebar.appointments'),
      content: <VaccinationHistoryTab customData={history} />,
    },
    3: {
      title: t('client:sidebar.vaccineRecord'),
      content: <VaccineRecordTab familyMemberId={familyMemberId} />,
    },
  };

  const currentTab = tabConfig[activeTab] || tabConfig['1'];

  return (
    <div className="profile-tab-content">
      <div className="animate-fade-in">{currentTab.content}</div>
    </div>
  );
};

export default FamilyMemberTabs;
