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
import apiClient from '@/services/apiClient';
import { getMyBookingHistory } from '@/services/booking.service';
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

        const recordRes = await apiClient.get(`/api/vaccine-records/patient/${user.id}`);
        const completedRecords = recordRes.data || [];

        const bookingRes = await getMyBookingHistory();
        const bookings = bookingRes.data || [];

        const groups = {};

        bookings.forEach((b) => {
          if (b.appointments) {
            b.appointments.forEach((apt) => {
              if (apt.appointmentStatus !== 'CANCELLED') {
                const required = b.vaccineTotalDoses || 3;
                const cycleIndex = Math.ceil(apt.doseNumber / required) - 1;
                const effectiveDose = ((apt.doseNumber - 1) % required) + 1;
                const personName = b.familyMemberName || b.patientName;

                const key = `${b.vaccineName}-${personName}-${cycleIndex}`;

                if (!groups[key]) {
                  groups[key] = {
                    vaccineName: b.vaccineName,
                    vaccineSlug: b.vaccineSlug,
                    patientName: personName,
                    isFamily: !!b.familyMemberName,
                    requiredDoses: required,
                    cycleIndex: cycleIndex,
                    events: [],
                  };
                }

                groups[key].events.push({
                  doseNumber: effectiveDose,
                  realDoseNumber: apt.doseNumber,
                  status: apt.appointmentStatus === 'COMPLETED' ? 'COMPLETED' : 'SCHEDULED',
                  date: apt.scheduledDate,
                  id: apt.appointmentId,
                  source: 'booking',
                });
              }
            });
          }
        });

        completedRecords.forEach((r) => {
          const required = r.dosesRequired || 3;
          const cycleIndex = Math.ceil(r.doseNumber / required) - 1;
          const effectiveDose = ((r.doseNumber - 1) % required) + 1;
          const personName = r.patientName; // Use patientName from record

          const key = `${r.vaccineName}-${personName}-${cycleIndex}`;

          if (!groups[key]) {
            groups[key] = {
              vaccineName: r.vaccineName,
              vaccineSlug: r.vaccineSlug,
              patientName: personName,
              isFamily: false, // Default false, hard to know from record alone unless we check ID
              requiredDoses: required,
              cycleIndex: cycleIndex,
              events: [],
            };
          }

          const existing = groups[key].events.find(
            (e) => e.doseNumber === effectiveDose && e.status === 'COMPLETED'
          );

          if (!existing) {
            const scheduledIndex = groups[key].events.findIndex(
              (e) => e.doseNumber === effectiveDose
            );

            if (scheduledIndex !== -1) {
              groups[key].events[scheduledIndex] = {
                ...groups[key].events[scheduledIndex],
                status: 'COMPLETED',
                date: r.vaccinationDate,
                source: 'record',
                realDoseNumber: r.doseNumber,
              };
            } else {
              groups[key].events.push({
                doseNumber: effectiveDose,
                realDoseNumber: r.doseNumber,
                status: 'COMPLETED',
                date: r.vaccinationDate,
                id: r.id,
                source: 'record',
              });
            }
          }
        });

        const journeyList = Object.values(groups).map((group) => {
          group.events.sort((a, b) => a.doseNumber - b.doseNumber);

          const steps = [];
          for (let i = 1; i <= group.requiredDoses; i++) {
            const event = group.events.find((e) => e.doseNumber === i);
            let stepStatus = 'wait';
            let description = t('client:vaccinationHistory.notScheduled');
            const title = `${t('client:vaccinationHistory.dose')} ${i}`;
            let date = null;

            if (event) {
              if (event.status === 'COMPLETED') {
                stepStatus = 'finish';
                description = t('client:vaccinationHistory.completed');
                date = event.date;
              } else if (event.status === 'SCHEDULED') {
                stepStatus = 'process';
                description = t('client:vaccinationHistory.scheduled');
                date = event.date;
              }
            } else {
              const prevEvent = group.events.find((e) => e.doseNumber === i - 1);
              if (i === 1 && !event) {
                stepStatus = 'wait';
                description = t('client:progress.readyToBook');
              } else if (prevEvent && prevEvent.status === 'COMPLETED') {
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
            ...group,
            steps,
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

  if (journeyData.length === 0) {
    return <Empty description={t('client:dashboard.noData')} />;
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Title level={4}>{t('client:progress.title')}</Title>
        <Text type="secondary">{t('client:progress.subtitle')}</Text>
      </div>

      {journeyData.map((journey, index) => (
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
            {/* Action Button */}
            {journey.steps.filter((s) => s.status === 'finish').length >= journey.requiredDoses ? (
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
      ))}
    </div>
  );
};

export default VaccinationProgressTab;
