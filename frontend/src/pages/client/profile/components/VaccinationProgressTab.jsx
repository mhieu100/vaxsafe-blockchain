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
          const key = `${b.vaccineName}-${b.familyMemberName || b.patientName}`;
          if (!groups[key]) {
            groups[key] = {
              vaccineName: b.vaccineName,
              vaccineSlug: b.vaccineSlug,
              patientName: b.familyMemberName || b.patientName,
              isFamily: !!b.familyMemberName,
              requiredDoses: b.vaccineTotalDoses || 3,
              events: [],
            };
          }

          if (b.appointments) {
            b.appointments.forEach((apt) => {
              if (apt.appointmentStatus !== 'CANCELLED') {
                groups[key].events.push({
                  doseNumber: apt.doseNumber,
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
          const key = `${r.vaccineName}-${user.fullName}`;

          if (!groups[key]) {
            groups[key] = {
              vaccineName: r.vaccineName,
              vaccineSlug: r.vaccineSlug,
              patientName: user.fullName,
              isFamily: false,
              requiredDoses: 3,
              events: [],
            };
          }

          const existing = groups[key].events.find(
            (e) => e.doseNumber === r.doseNumber && e.status === 'COMPLETED'
          );
          if (!existing) {
            const scheduledIndex = groups[key].events.findIndex(
              (e) => e.doseNumber === r.doseNumber
            );
            if (scheduledIndex !== -1) {
              groups[key].events[scheduledIndex] = {
                ...groups[key].events[scheduledIndex],
                status: 'COMPLETED',
                date: r.vaccinationDate,
                source: 'record',
              };
            } else {
              groups[key].events.push({
                doseNumber: r.doseNumber,
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
                description = 'Sẵn sàng đặt lịch';
              } else if (prevEvent && prevEvent.status === 'COMPLETED') {
                stepStatus = 'wait';
                description = 'Cần đặt lịch';
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

        setJourneyData(journeyList);
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
    return <Empty description="Chưa có lộ trình tiêm chủng nào" />;
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Title level={4}>Tiến độ tiêm chủng</Title>
        <Text type="secondary">Theo dõi hành trình tiêm chủng của bạn và người thân</Text>
      </div>

      {journeyData.map((journey, index) => (
        <Card key={index} className="shadow-sm rounded-2xl border-slate-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-blue-800">{journey.vaccineName}</h3>
              <div className="text-slate-500 text-sm">
                Người tiêm:{' '}
                <span className="font-medium text-slate-700">{journey.patientName}</span>
                {journey.isFamily && (
                  <Tag color="purple" className="ml-2">
                    Người thân
                  </Tag>
                )}
              </div>
            </div>
            {}
            <Button
              type="primary"
              size="small"
              icon={<RightOutlined />}
              onClick={() => navigate(`/booking?slug=${journey.vaccineSlug}`)}
            >
              Đặt tiếp
            </Button>
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
