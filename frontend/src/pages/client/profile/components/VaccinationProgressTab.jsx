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
        // 1. Fetch completed records (Vaccine Passport)
        const recordRes = await apiClient.get(`/api/vaccine-records/patient/${user.id}`);
        const completedRecords = recordRes.data || [];

        // 2. Fetch booking history (Scheduled/Pending)
        const bookingRes = await getMyBookingHistory();
        const bookings = bookingRes.data || [];

        // 3. Merge Phase
        // We group by "Vaccine Name" AND "Patient Name" (to handle family members)
        const groups = {};

        // Process Bookings first (contains vaccineTotalDoses info)
        bookings.forEach((b) => {
          const key = `${b.vaccineName}-${b.familyMemberName || b.patientName}`;
          if (!groups[key]) {
            groups[key] = {
              vaccineName: b.vaccineName,
              vaccineSlug: b.vaccineSlug,
              patientName: b.familyMemberName || b.patientName,
              isFamily: !!b.familyMemberName,
              requiredDoses: b.vaccineTotalDoses || 3, // Fallback if missing
              events: [],
            };
          }

          // Add appointments from booking
          if (b.appointments) {
            b.appointments.forEach((apt) => {
              // Only add if not cancelled
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

        // Process Completed Records
        completedRecords.forEach((r) => {
          const key = `${r.vaccineName}-${user.fullName}`; // Assumptions: Records are usually for the logged-in user unless filtered
          // Actually, fetching /patient/{id} only returns logs for that user?
          // If family members have own records, they might be missing here unless backend supports it.
          // For now assume these are mainly for the main user.

          if (!groups[key]) {
            groups[key] = {
              vaccineName: r.vaccineName,
              vaccineSlug: r.vaccineSlug,
              patientName: user.fullName, // Default to user
              isFamily: false,
              requiredDoses: 3, // We don't verify dose count from record easily
              events: [],
            };
          }

          // Check if this dose already exists from booking (avoid duplicates)
          const existing = groups[key].events.find(
            (e) => e.doseNumber === r.doseNumber && e.status === 'COMPLETED'
          );
          if (!existing) {
            // If we have a SCHEDULED event for this dose, mark it completed or replace it?
            // Usually Record is the source of truth for completion.
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

        // 4. Format for UI
        const journeyList = Object.values(groups).map((group) => {
          // Sort events by dose
          group.events.sort((a, b) => a.doseNumber - b.doseNumber);

          // Generate Steps items
          const steps = [];
          for (let i = 1; i <= group.requiredDoses; i++) {
            const event = group.events.find((e) => e.doseNumber === i);
            let stepStatus = 'wait';
            let description = t('client:vaccinationHistory.notScheduled'); // Update translation later
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
              // Start logic: if previous dose finished, this is 'next'
              const prevEvent = group.events.find((e) => e.doseNumber === i - 1);
              if (i === 1 && !event) {
                stepStatus = 'wait'; // Ready to start
                description = 'Sẵn sàng đặt lịch';
              } else if (prevEvent && prevEvent.status === 'COMPLETED') {
                stepStatus = 'wait'; // Needs action
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
            {/* Action Button logic */}
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
