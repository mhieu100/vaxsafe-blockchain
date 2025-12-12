import {
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  RightOutlined,
} from '@ant-design/icons';
import { Button, Card, Skeleton, Steps } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/services/apiClient';

const MemberVaccinationProgress = ({ memberId, customData }) => {
  const { t } = useTranslation(['client']);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [journeyData, setJourneyData] = useState([]);

  useEffect(() => {
    const processData = (routes) => {
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
            if (apt.appointmentStatus === 'COMPLETED') {
              stepStatus = 'finish';
              description = t('client:vaccinationHistory.completed');
              date = apt.vaccinationDate || apt.scheduledDate;
            } else if (apt.appointmentStatus !== 'CANCELLED') {
              stepStatus = 'process';
              description = t('client:vaccinationHistory.scheduled');
              date = apt.scheduledDate;
            }
          } else {
            const prevApt = appointments.find((a) => (a.doseNumber || 0) === i - 1);
            if (i === 1 && !apt) {
              stepStatus = 'wait';
              description = t('client:progress.readyToBook');
            } else if (prevApt && prevApt.appointmentStatus === 'COMPLETED') {
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
          vaccinationCourseId: route.routeId,
          vaccineName: route.vaccineName,
          vaccineSlug: route.vaccineSlug,
          patientName: route.patientName,
          requiredDoses: route.requiredDoses,
          steps,
          status: route.status,
        };
      });

      const activeJourneys = journeyList.filter(
        (journey) =>
          journey.steps.filter((s) => s.status === 'finish').length < journey.requiredDoses
      );
      setJourneyData(activeJourneys);
    };

    const fetchData = async () => {
      if (customData) {
        processData(customData);
        setLoading(false);
        return;
      }

      if (!memberId) return;
      try {
        setLoading(true);
        const response = await apiClient.post('/api/family-members/booking-history-grouped', {
          id: memberId,
        });
        const routes = response.data || [];
        processData(routes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [memberId, customData, t]);

  if (loading) return <Skeleton active />;

  if (journeyData.length === 0) {
    return (
      <div className="p-4 bg-slate-50 rounded-xl text-center text-gray-500">
        {t('client:dashboard.noData')}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-slate-50 rounded-xl">
      <h3 className="font-semibold text-gray-700">{t('client:progress.title')}</h3>
      {journeyData.map((journey, index) => (
        <Card key={index} className="shadow-sm rounded-xl border-slate-200" size="small">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-bold text-blue-800 m-0">{journey.vaccineName}</h4>
            </div>
            {/* Action Button */}
            {journey.steps.filter((s) => s.status === 'finish').length < journey.requiredDoses &&
              !journey.steps.some((s) => s.status === 'process') && (
                <Button
                  type="primary"
                  size="small"
                  icon={<RightOutlined />}
                  onClick={() =>
                    navigate(
                      `/booking?slug=${journey.vaccineSlug}&doseNumber=${
                        journey.steps.filter((s) => s.status === 'finish').length + 1
                      }&vaccinationCourseId=${journey.vaccinationCourseId}&familyMemberId=${memberId}`
                    )
                  }
                >
                  {t('client:progress.bookNext')}
                </Button>
              )}
          </div>

          <Steps
            size="small"
            current={
              journey.steps.findIndex((s) => s.status === 'process') !== -1
                ? journey.steps.findIndex((s) => s.status === 'process')
                : journey.steps.filter((s) => s.status === 'finish').length
            }
            items={journey.steps.map((step) => ({
              title: step.title,
              description: step.date ? (
                <span className="text-xs text-gray-400">{step.date}</span>
              ) : null,
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
      ))}
    </div>
  );
};

export default MemberVaccinationProgress;
