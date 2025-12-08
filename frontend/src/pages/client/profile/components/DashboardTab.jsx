import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  RightOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Empty,
  Progress,
  Row,
  Skeleton,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiClient from '@/services/apiClient';
import { getMyBookingHistory } from '@/services/booking.service';
import useAccountStore from '@/stores/useAccountStore';

const { Title, Text } = Typography;

const DashboardTab = ({ onTabChange }) => {
  const { t } = useTranslation(['client']);
  const { user } = useAccountStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVaccines: 0,
    upcomingCount: 0,
    coverage: 0,
  });
  const [nextAppointment, setNextAppointment] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);

        const [recordsRes, bookingsRes] = await Promise.all([
          apiClient.get(`/api/vaccine-records/patient/${user.id}`),
          getMyBookingHistory(),
        ]);

        const records = recordsRes.data || [];
        const bookings = bookingsRes.data || [];

        const uniqueVaccines = new Set(records.map((r) => r.vaccineName)).size;

        const upcoming = bookings.filter((b) => {
          return (
            b.appointments &&
            b.appointments.some(
              (apt) =>
                apt.appointmentStatus !== 'CANCELLED' &&
                apt.appointmentStatus !== 'COMPLETED' &&
                dayjs(apt.scheduledDate).isAfter(dayjs())
            )
          );
        });

        let nearestApt = null;
        bookings.forEach((b) => {
          if (b.appointments) {
            b.appointments.forEach((apt) => {
              if (apt.appointmentStatus !== 'CANCELLED' && apt.appointmentStatus !== 'COMPLETED') {
                const aptDate = dayjs(apt.scheduledDate);
                if (aptDate.isAfter(dayjs())) {
                  if (!nearestApt || aptDate.isBefore(dayjs(nearestApt.scheduledDate))) {
                    nearestApt = {
                      ...apt,
                      vaccineName: b.vaccineName,
                      displayDate: aptDate,
                    };
                  }
                }
              }
            });
          }
        });

        const sortedRecords = [...records]
          .sort((a, b) => dayjs(b.vaccinationDate).unix() - dayjs(a.vaccinationDate).unix())
          .slice(0, 3);

        setStats({
          totalVaccines: uniqueVaccines,
          upcomingCount: upcoming.length,
          coverage: Math.min(Math.round((uniqueVaccines / 12) * 100), 100),
        });
        setNextAppointment(nearestApt);
        setRecentActivity(sortedRecords);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  if (loading) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card className="rounded-2xl shadow-sm border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white h-full">
            <Statistic
              title={
                <span className="text-emerald-600 font-bold uppercase text-xs tracking-wider">
                  {t('client:dashboard.totalVaccines')}
                </span>
              }
              value={stats.totalVaccines}
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
              value={stats.upcomingCount}
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
                <div className="text-2xl font-bold text-purple-700">{stats.coverage}%</div>
              </div>
              <Progress type="circle" percent={stats.coverage} width={50} strokeColor="#9333ea" />
            </div>
            <div className="mt-4 text-xs text-purple-600 font-medium bg-purple-100/50 px-2 py-1 rounded w-fit">
              {t('client:dashboard.goodStatus')}
            </div>
          </Card>
        </Col>
      </Row>

      {}
      <Card className="rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {nextAppointment ? (
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
                  {nextAppointment.vaccineName} ({t('client:vaccinationHistory.dose')}{' '}
                  {nextAppointment.doseNumber})
                </Title>
                <Text type="secondary" className="flex items-center gap-2">
                  <CalendarOutlined /> {dayjs(nextAppointment.scheduledDate).format('DD/MM/YYYY')} •{' '}
                  {t('client:dashboard.checkTimeInListing')}
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
        ) : (
          <div className="text-center py-6">
            <Text type="secondary">Bạn chưa có lịch hẹn sắp tới</Text>
            <div className="mt-4">
              <Button type="primary" onClick={() => onTabChange('2')}>
                Đặt lịch ngay
              </Button>
            </div>
          </div>
        )}
      </Card>

      {}
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
          {recentActivity.length > 0 ? (
            recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircleOutlined />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-800">{item.vaccineName}</div>
                  <div className="text-xs text-slate-500">
                    {t('client:vaccinationHistory.completed')} •{' '}
                    {dayjs(item.vaccinationDate).format('DD/MM/YYYY')}
                  </div>
                </div>
                <Tag color="success">#{item.doseNumber}</Tag>
              </div>
            ))
          ) : (
            <Empty description="Chưa có hoạt động gần đây" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      </Card>
    </div>
  );
};

export default DashboardTab;
