import {
  BlockOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Spin, Statistic, Typography } from 'antd';

import { useBlockchainStats } from '../../hooks/useBlockchainStats';

const { Title } = Typography;

const BlockchainPage = () => {
  const { stats, isLoading } = useBlockchainStats();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="mb-6">
        <Title level={2} className="mb-2">
          Blockchain Real-time Dashboard
        </Title>
        <p className="text-gray-600">Theo dõi trạng thái blockchain theo thời gian thực</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Total Blocks"
              value={stats?.totalBlocks || 0}
              prefix={<BlockOutlined className="text-blue-600" />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Total Transactions"
              value={stats?.totalTransactions || 0}
              prefix={<DatabaseOutlined className="text-green-600" />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Pending Transactions"
              value={stats?.pendingTransactions || 0}
              prefix={<ClockCircleOutlined className="text-orange-600" />}
              styles={{ content: { color: '#fa8c16' } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Certificates Issued"
              value={stats?.certificatesIssued || 0}
              prefix={<SafetyCertificateOutlined className="text-purple-600" />}
              styles={{ content: { color: '#722ed1' } }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="mt-6 rounded-xl shadow-sm">
        <Title level={4}>Latest Blockchain Activity</Title>
        <div className="space-y-4 mt-4">
          {stats?.recentBlocks?.slice(0, 5).map((block) => (
            <div
              key={block.blockHash || block.blockNumber}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-semibold">Block #{block.number}</p>
                <p className="text-sm text-gray-600">Hash: {block.hash?.slice(0, 20)}...</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{block.transactions} transactions</p>
                <p className="text-xs text-gray-500">{block.timestamp}</p>
              </div>
            </div>
          )) || <p className="text-center text-gray-500 py-8">No blockchain data available</p>}
        </div>
      </Card>
    </div>
  );
};

export default BlockchainPage;
