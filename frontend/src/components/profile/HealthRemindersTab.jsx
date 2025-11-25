import { CheckCircleOutlined, ExperimentOutlined, WarningOutlined } from '@ant-design/icons';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const HealthRemindersTab = () => {
  return (
    <div>
      <Title level={4} className="mb-4">
        Health Reminders & Alerts
      </Title>

      <div className="space-y-4">
        <Card size="small" className="border-l-4 border-l-orange-400">
          <div className="flex items-center gap-3">
            <WarningOutlined className="text-orange-500" />
            <div>
              <Text strong>Influenza Vaccine Due</Text>
              <br />
              <Text type="secondary" className="text-sm">
                Your annual flu shot is due in 2 weeks
              </Text>
            </div>
          </div>
        </Card>

        <Card size="small" className="border-l-4 border-l-blue-400">
          <div className="flex items-center gap-3">
            <ExperimentOutlined className="text-blue-500" />
            <div>
              <Text strong>Health Checkup Reminder</Text>
              <br />
              <Text type="secondary" className="text-sm">
                Annual health screening recommended
              </Text>
            </div>
          </div>
        </Card>

        <Card size="small" className="border-l-4 border-l-green-400">
          <div className="flex items-center gap-3">
            <CheckCircleOutlined className="text-green-500" />
            <div>
              <Text strong>Vaccination Record Complete</Text>
              <br />
              <Text type="secondary" className="text-sm">
                All required vaccinations are up to date
              </Text>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-4 bg-green-50">
        <Title level={5}>🏥 Health Tips</Title>
        <ul className="text-sm text-gray-600 mt-2 space-y-1">
          <li>• Stay hydrated and maintain a balanced diet</li>
          <li>• Regular exercise boosts immune system</li>
          <li>• Get adequate sleep (7-9 hours daily)</li>
          <li>• Keep vaccination records up to date</li>
        </ul>
      </Card>
    </div>
  );
};

export default HealthRemindersTab;
