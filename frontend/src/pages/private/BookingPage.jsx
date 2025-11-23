import { useState, useEffect } from 'react';
import { Form, message } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TopCheckoutSection from '../../components/booking/TopCheckoutSection';
import AppointmentSection from '../../components/booking/AppointmentSection';
import PaymentSection from '../../components/booking/PaymentSection';
import ReviewSection from '../../components/booking/ReviewSection';
import { callGetBySlug } from '../../services/vaccine.service';
import { callCreateBooking } from '../../services/booking.service';

const BookingPage = () => {
  const [bookingForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [vaccine, setVaccine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    vaccineId: null,
    bookingFor: 'self',
    familyMemberId: null,
    firstDoseDate: null,
    firstDoseTime: '',
    firstDoseCenter: '',
    doseSchedules: [],
    paymentMethod: 'CASH',
  });

  // Load vaccine data from URL params
  useEffect(() => {
    const slug = searchParams.get('slug');

    if (slug) {
      fetchVaccineData(slug);
    }
  }, [searchParams]);

  const fetchVaccineData = async (slug) => {
    try {
      console.log('📡 Fetching vaccine data for slug:', slug);

      const response = await callGetBySlug(slug);
      console.log('📦 API Response:', response);

      // Handle different response formats
      let vaccineData = null;
      if (response?.result) {
        vaccineData = response.result;
      } else if (response?.data) {
        vaccineData = response.data;
      } else if (response) {
        vaccineData = response;
      }

      if (vaccineData) {
        console.log('✅ Vaccine data loaded:', vaccineData);

        // Validate required fields
        if (!vaccineData.dosesRequired) {
          console.warn('⚠️ Missing dosesRequired field');
        }
        if (!vaccineData.duration) {
          console.warn('⚠️ Missing duration field');
        }

        setVaccine(vaccineData);
        
        // IMPORTANT: Update bookingData with vaccineId from vaccine object
        setBookingData((prev) => ({
          ...prev,
          vaccineId: vaccineData.id,
        }));
      } else {
        console.error('❌ No vaccine data in response');
        message.error('Không tìm thấy thông tin vắc xin');
      }
    } catch (error) {
      console.error('❌ Error fetching vaccine:', error);
      message.error('Không thể tải thông tin vắc xin');
    }
  };

  // Sync form data to bookingData state every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      const bookingValues = bookingForm.getFieldsValue();
      const paymentValues = paymentForm.getFieldsValue();

      setBookingData((prev) => ({
        ...prev,
        ...bookingValues,
        ...paymentValues,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [bookingForm, paymentForm]);

  const handleBookingSubmit = async () => {
    try {
      setLoading(true);

      // Validate all forms
      await bookingForm.validateFields();
      await paymentForm.validateFields();

      const paymentValues = paymentForm.getFieldsValue();

      /* eslint-disable no-console */
      console.log('🔍 Submit Validation Check:');
      console.log('   paymentValues:', paymentValues);
      console.log('   paymentMethod from form:', paymentValues.paymentMethod);
      console.log('   bookingData:', bookingData);
      console.log('   bookingData.paymentMethod:', bookingData.paymentMethod);
      console.log('   doseSchedules from state:', bookingData.doseSchedules);
      console.log('   doseSchedules length:', bookingData.doseSchedules?.length);
      console.log('   vaccine dosesRequired:', vaccine?.dosesRequired);
      console.log('   vaccine:', vaccine);
      /* eslint-enable no-console */

      // Check if all dose schedules are filled
      if (
        !bookingData.doseSchedules ||
        bookingData.doseSchedules.length !== vaccine?.dosesRequired
      ) {
        /* eslint-disable no-console */
        console.error('❌ Dose schedules validation failed!');
        console.error('   Expected:', vaccine?.dosesRequired);
        console.error('   Got:', bookingData.doseSchedules?.length);
        /* eslint-enable no-console */
        message.error(`Vui lòng hoàn thành tất cả ${vaccine?.dosesRequired} mũi tiêm (hiện có ${bookingData.doseSchedules?.length || 0} mũi)`);
        return;
      }

      // Validate all doses have required fields
      const hasIncompleteDose = bookingData.doseSchedules.some(
        (dose, index) => {
          const isIncomplete = !dose || !dose.date || !dose.time || !dose.centerId;
          /* eslint-disable no-console */
          if (isIncomplete) {
            console.error(`❌ Mũi ${index + 1} thiếu thông tin:`, dose);
          }
          /* eslint-enable no-console */
          return isIncomplete;
        }
      );

      if (hasIncompleteDose) {
        message.error('Vui lòng điền đầy đủ thông tin cho tất cả các mũi tiêm');
        return;
      }

      /* eslint-disable no-console */
      console.log('✅ All validations passed!');
      /* eslint-enable no-console */

      // Format dose schedules for API - match BookingRequest.DoseSchedule
      const doseSchedules = bookingData.doseSchedules.map((dose) => ({
        date: dose.date.format('YYYY-MM-DD'),
        time: dose.time, // Time already in HH:mm format
        centerId: dose.centerId,
      }));

      // Calculate total amount
      const totalAmount = vaccine?.price * doseSchedules.length || 0;

      // Prepare booking payload matching BookingRequest DTO
      const bookingPayload = {
        vaccineId: bookingData.vaccineId || vaccine?.id,
        familyMemberId:
          bookingData.bookingFor === 'family'
            ? bookingData.familyMemberId
            : null,
        centerId: doseSchedules[0]?.centerId, // First dose center
        firstDoseDate: doseSchedules[0]?.date,
        firstDoseTime: doseSchedules[0]?.time,
        amount: totalAmount,
        doseSchedules: doseSchedules,
        paymentMethod: bookingData.paymentMethod || 'CASH',
      };

      /* eslint-disable no-console */
      console.log('📦 Booking Payload:', bookingPayload);
      console.log('💉 Vaccine object:', vaccine);
      console.log('🔑 Vaccine ID:', vaccine?.id);
      console.log('💰 Total Amount:', totalAmount);
      /* eslint-enable no-console */

      const response = await callCreateBooking(bookingPayload);

      /* eslint-disable no-console */
      console.log('📨 Booking Response:', response);
      /* eslint-enable no-console */

      // Handle both response.result and response.data formats
      const paymentData = response?.result || response?.data;

      if (paymentData) {
        message.success('Đặt lịch tiêm thành công!');

        // Handle payment redirects based on method from response (same as safevax-repo)
        if (paymentData.method === 'PAYPAL' && paymentData.paymentURL) {
          window.location.href = paymentData.paymentURL;
        } else if (paymentData.method === 'BANK' && paymentData.paymentURL) {
          window.location.href = paymentData.paymentURL;
        } else {
          // For CASH and METAMASK, redirect to success page
          navigate('/success');
        }
      } else {
        message.error('Đặt lịch thất bại. Vui lòng thử lại!');
      }
    } catch (error) {
      /* eslint-disable no-console */
      console.error('❌ Booking submission error:', error);
      /* eslint-enable no-console */
      message.error('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <AppointmentSection
            bookingForm={bookingForm}
            vaccine={vaccine}
            setCurrentStep={setCurrentStep}
            setBookingData={setBookingData}
          />
        );
      case 1:
        return (
          <PaymentSection
            paymentForm={paymentForm}
            setCurrentStep={setCurrentStep}
            setBookingData={setBookingData}
          />
        );
      case 2:
        return (
          <ReviewSection
            bookingData={bookingData}
            vaccine={vaccine}
            setCurrentStep={setCurrentStep}
            handleBookingSubmit={handleBookingSubmit}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <TopCheckoutSection
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />
      {renderStep()}
    </div>
  );
};

export default BookingPage;
