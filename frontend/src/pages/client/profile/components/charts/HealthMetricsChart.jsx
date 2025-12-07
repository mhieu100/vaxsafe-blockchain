import { Card, Empty, Segmented, Spin } from 'antd';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { getMyObservations } from '../../../../../services/observation.service';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const HealthMetricsChart = () => {
  const [loading, setLoading] = useState(true);
  const [observations, setObservations] = useState([]);
  const [metricType, setMetricType] = useState('BODY_WEIGHT'); // 'BODY_WEIGHT' or 'BODY_HEIGHT'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getMyObservations();
      if (res.data) {
        // Sort by date ascending for chart
        const sorted = res.data.sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
        setObservations(sorted);
      }
    } catch (error) {
      console.error('Failed to fetch observations', error);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    const filtered = observations.filter((obs) => obs.type === metricType);

    if (filtered.length === 0) return null;

    return {
      labels: filtered.map((obs) => dayjs(obs.recordedAt).format('DD/MM/YYYY')),
      datasets: [
        {
          label: metricType === 'BODY_WEIGHT' ? 'Cân nặng (kg)' : 'Chiều cao (cm)',
          data: filtered.map((obs) => parseFloat(obs.value)),
          borderColor: metricType === 'BODY_WEIGHT' ? 'rgb(53, 162, 235)' : 'rgb(75, 192, 192)',
          backgroundColor:
            metricType === 'BODY_WEIGHT' ? 'rgba(53, 162, 235, 0.5)' : 'rgba(75, 192, 192, 0.5)',
          tension: 0.3,
        },
      ],
    };
  };

  const chartData = getChartData();

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
        text: 'Biểu đồ sức khỏe',
      },
    },
    scales: {
      y: {
        beginAtZero: false, // Weight/Height usually doesn't start at 0 for adults
      },
    },
  };

  return (
    <Card
      className="rounded-3xl shadow-sm border border-slate-100"
      title="Theo dõi sức khỏe"
      extra={
        <Segmented
          options={[
            { label: 'Cân nặng', value: 'BODY_WEIGHT' },
            { label: 'Chiều cao', value: 'BODY_HEIGHT' },
          ]}
          value={metricType}
          onChange={setMetricType}
        />
      }
    >
      {loading ? (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      ) : chartData ? (
        <Line options={options} data={chartData} />
      ) : (
        <Empty description="Chưa có dữ liệu theo dõi" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Card>
  );
};

export default HealthMetricsChart;
