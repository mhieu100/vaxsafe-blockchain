import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Spin, Statistic, Typography } from 'antd';
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { useEffect, useState } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import CountUp from 'react-countup';
import dashboardService from '@/services/dashboard.service';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const { Text } = Typography;

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatter = (value) => <CountUp end={Number(value)} separator="," />;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!stats) {
    return <div>Failed to load data</div>;
  }

  // Prepare chart data
  const dailyLabels = stats.dailyAppointments?.map((d) => d.date) || [];
  const dailyData = stats.dailyAppointments?.map((d) => d.count) || [];

  const vaccinationRateData = {
    labels: dailyLabels,
    datasets: [
      {
        label: 'Lượt tiêm hàng ngày',
        data: dailyData,
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const vaccineLabels = Object.keys(stats.vaccineDistribution || {});
  const vaccineCounts = Object.values(stats.vaccineDistribution || {});

  const vaccineDistributionData = {
    labels: vaccineLabels,
    datasets: [
      {
        data: vaccineCounts,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(107, 114, 128, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h1>
        <p className="mt-1 text-sm text-gray-500">
          Thống kê thời gian thực về hoạt động tiêm chủng và người dùng
        </p>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Tổng bệnh nhân"
              value={stats.totalPatients}
              formatter={formatter}
              prefix={<UserOutlined style={{ color: '#3B82F6' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Tổng bác sĩ"
              value={stats.totalDoctors}
              formatter={formatter}
              prefix={<TeamOutlined style={{ color: '#10B981' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Tổng trung tâm"
              value={stats.totalCenters}
              formatter={formatter}
              prefix={<MedicineBoxOutlined style={{ color: '#F59E0B' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Loại Vaccine"
              value={stats.totalVaccines}
              formatter={formatter}
              prefix={<MedicineBoxOutlined style={{ color: '#8B5CF6' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Appointment Status Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm bg-yellow-50">
            <Statistic
              title="Lịch hẹn chờ xử lý"
              value={stats.pendingAppointments}
              formatter={formatter}
              prefix={<ClockCircleOutlined style={{ color: '#F59E0B' }} />}
              valueStyle={{ color: '#F59E0B' }}
            />
            <Text type="secondary" className="text-xs">
              Cần phân công bác sĩ
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm bg-green-50">
            <Statistic
              title="Lịch hẹn đã hoàn thành"
              value={stats.completedAppointments}
              formatter={formatter}
              prefix={<CheckCircleOutlined style={{ color: '#10B981' }} />}
              valueStyle={{ color: '#10B981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="shadow-sm bg-red-50">
            <Statistic
              title="Lịch hẹn đã hủy"
              value={stats.cancelledAppointments}
              formatter={formatter}
              prefix={<CloseCircleOutlined style={{ color: '#EF4444' }} />}
              valueStyle={{ color: '#EF4444' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Xu hướng đặt lịch (30 ngày qua)" bordered={false} className="shadow-sm">
            <div style={{ height: 350 }}>
              <Line
                data={vaccinationRateData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Phân bố Vaccine (Theo quốc gia)" bordered={false} className="shadow-sm">
            <div style={{ height: 350, display: 'flex', justifyContent: 'center' }}>
              <Doughnut
                data={vaccineDistributionData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                  cutout: '60%',
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
