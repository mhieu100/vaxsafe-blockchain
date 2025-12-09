import {
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  RightOutlined,
} from '@ant-design/icons';
import { Button, Card, Empty, Skeleton, Steps, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getGroupedBookingHistory } from '@/services/booking.service';
import useAccountStore from '@/stores/useAccountStore';

const { Title, Text } = Typography;

const VaccinationProgressTab = () => {
  const { t } = useTranslation(['client']);
  const { user } = useAccountStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [journeyData, setJourneyData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);

        const response = await getGroupedBookingHistory();
        const routes = response.data || [];

        const journeyList = routes.map((route) => {
          const steps = [];

          const appointments = route.appointments || [];

          for (let i = 1; i <= route.requiredDoses; i++) {
            const apt = appointments.find((a) => (a.doseNumber || 0) === i);

            let stepStatus = 'wait';
            let description = t('client:vaccinationHistory.notScheduled');
            const title = `${t('client:vaccinationHistory.dose')} ${i}`;
            let date = null;

            if (apt) {
              if (apt.status === 'COMPLETED') {
                stepStatus = 'finish';
                description = t('client:vaccinationHistory.completed');
                date = apt.vaccinationDate || apt.scheduledDate;
              } else if (apt.status !== 'CANCELLED') {
                // SCHEDULED, PENDING, CONFIRMED, etc.
                stepStatus = 'process';
                description = t('client:vaccinationHistory.scheduled');
                date = apt.scheduledDate;
              }
            } else {
              const prevApt = appointments.find((a) => (a.doseNumber || 0) === i - 1);

              if (i === 1 && !apt) {
                stepStatus = 'wait';
                description = t('client:progress.readyToBook');
              } else if (prevApt && prevApt.status === 'COMPLETED') {
                stepStatus = 'wait';
                description = t('client:progress.needToBook');
              }
            }

            steps.push({
              title,
              description,
              status: stepStatus,
              date: date ? dayjs(date).format('DD/MM/YYYY') : null,
              doseNumber: i,
            });
          }

          return {
            vaccineName: route.vaccineName,
            vaccineSlug: route.vaccineSlug,
            patientName: route.patientName,
            isFamily: route.isFamily,
            requiredDoses: route.requiredDoses,
            cycleIndex: route.cycleIndex,
            steps,
            status: route.status,
          };
        });

        const activeJourneys = journeyList.filter(
          (journey) =>
            journey.steps.filter((s) => s.status === 'finish').length < journey.requiredDoses
        );

        setJourneyData(activeJourneys);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, t]);

  if (loading) {
    return <Skeleton active />;
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Title level={4}>{t('client:progress.title')}</Title>
        <Text type="secondary">{t('client:progress.subtitle')}</Text>
      </div>

      {journeyData.length === 0 ? (
        <Empty description={t('client:dashboard.noData')} className="py-8" />
      ) : (
        journeyData.map((journey, index) => (
          <Card key={index} className="shadow-sm rounded-2xl border-slate-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-blue-800">{journey.vaccineName}</h3>
                <div className="text-slate-500 text-sm">
                  {t('client:progress.patient')}:{' '}
                  <span className="font-medium text-slate-700">{journey.patientName}</span>
                  {journey.isFamily && (
                    <Tag color="purple" className="ml-2">
                      {t('client:progress.relative')}
                    </Tag>
                  )}
                </div>
              </div>

              {journey.steps.filter((s) => s.status === 'finish').length >=
              journey.requiredDoses ? (
                <Tag color="green" icon={<CheckCircleFilled />}>
                  {t('client:vaccinationHistory.completed')}
                </Tag>
              ) : (
                <Button
                  type="primary"
                  size="small"
                  icon={<RightOutlined />}
                  onClick={() => navigate(`/booking?slug=${journey.vaccineSlug}`)}
                >
                  {t('client:progress.bookNext')}
                </Button>
              )}
            </div>

            <Steps
              current={
                journey.steps.findIndex((s) => s.status === 'process') !== -1
                  ? journey.steps.findIndex((s) => s.status === 'process')
                  : journey.steps.filter((s) => s.status === 'finish').length
              }
              items={journey.steps.map((step) => ({
                title: step.title,
                description: (
                  <div>
                    <div>{step.description}</div>
                    {step.date && <div className="text-xs text-slate-400">{step.date}</div>}
                  </div>
                ),
                status: step.status,
                icon:
                  step.status === 'finish' ? (
                    <CheckCircleFilled />
                  ) : step.status === 'process' ? (
                    <ClockCircleFilled />
                  ) : (
                    <CalendarOutlined />
                  ),
              }))}
            />
          </Card>
        ))
      )}
    </div>
  );
};

export default VaccinationProgressTab;
