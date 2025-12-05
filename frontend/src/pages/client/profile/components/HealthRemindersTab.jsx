import { CheckCircleOutlined, ExperimentOutlined, WarningOutlined } from '@ant-design/icons';
import { Card, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const HealthRemindersTab = () => {
  const { t } = useTranslation(['client']);
  return (
    <div>
      <Title level={4} className="mb-4">
        {t('client:healthReminders.title')}
      </Title>

      <div className="space-y-4">
        <Card size="small" className="border-l-4 border-l-orange-400">
          <div className="flex items-center gap-3">
            <WarningOutlined className="text-orange-500" />
            <div>
              <Text strong>{t('client:healthReminders.fluVaccineDue')}</Text>
              <br />
              <Text type="secondary" className="text-sm">
                {t('client:healthReminders.fluVaccineDueDesc')}
              </Text>
            </div>
          </div>
        </Card>

        <Card size="small" className="border-l-4 border-l-blue-400">
          <div className="flex items-center gap-3">
            <ExperimentOutlined className="text-blue-500" />
            <div>
              <Text strong>{t('client:healthReminders.healthCheckupReminder')}</Text>
              <br />
              <Text type="secondary" className="text-sm">
                {t('client:healthReminders.healthCheckupDesc')}
              </Text>
            </div>
          </div>
        </Card>

        <Card size="small" className="border-l-4 border-l-green-400">
          <div className="flex items-center gap-3">
            <CheckCircleOutlined className="text-green-500" />
            <div>
              <Text strong>{t('client:healthReminders.vaccinationRecordComplete')}</Text>
              <br />
              <Text type="secondary" className="text-sm">
                {t('client:healthReminders.vaccinationRecordCompleteDesc')}
              </Text>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-4 bg-green-50">
        <Title level={5}>🏥 {t('client:healthReminders.healthTips')}</Title>
        <ul className="text-sm text-gray-600 mt-2 space-y-1">
          <li>• {t('client:healthReminders.healthTip1')}</li>
          <li>• {t('client:healthReminders.healthTip2')}</li>
          <li>• {t('client:healthReminders.healthTip3')}</li>
          <li>• {t('client:healthReminders.healthTip4')}</li>
        </ul>
      </Card>
    </div>
  );
};

export default HealthRemindersTab;
