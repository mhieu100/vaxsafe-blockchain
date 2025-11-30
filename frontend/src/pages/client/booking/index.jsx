import { Form, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { callCreateBooking } from '@/services/booking.service';
import { callGetBySlug } from '@/services/vaccine.service';
import AppointmentSection from './components/AppointmentSection';
import PaymentSection from './components/PaymentSection';
import ReviewSection from './components/ReviewSection';
import TopCheckoutSection from './components/TopCheckoutSection';

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
    appointmentDate: null,
    appointmentTime: '',
    appointmentCenter: null,
    paymentMethod: 'CASH',
  });

  const fetchVaccineData = async (slug) => {
    try {
      const response = await callGetBySlug(slug);

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
        // Validate required fields
        if (!vaccineData.dosesRequired) {
        }
        if (!vaccineData.duration) {
        }

        setVaccine(vaccineData);

        // IMPORTANT: Update bookingData with vaccineId from vaccine object
        setBookingData((prev) => ({
          ...prev,
          vaccineId: vaccineData.id,
        }));
      } else {
        message.error('Không tìm thấy thông tin vắc xin');
      }
    } catch (_error) {
      message.error('Không thể tải thông tin vắc xin');
    }
  };

  // Load vaccine data from URL params
  useEffect(() => {
    const slug = searchParams.get('slug');

    if (slug) {
      fetchVaccineData(slug);
    }
  }, [searchParams]);

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

      // Amount is just the vaccine price (backend will create all appointment records)
      const totalAmount = vaccine?.price || 0;

      // Prepare booking payload matching new simplified BookingRequest DTO
      const bookingPayload = {
        vaccineId: bookingData.vaccineId || vaccine?.id,
        familyMemberId: bookingData.bookingFor === 'family' ? bookingData.familyMemberId : null,
        appointmentDate:
          bookingData.appointmentDate?.format?.('YYYY-MM-DD') || bookingData.appointmentDate,
        appointmentTime: bookingData.appointmentTime,
        appointmentCenter: bookingData.appointmentCenter,
        amount: totalAmount,
        paymentMethod: bookingData.paymentMethod || 'CASH',
      };

      const response = await callCreateBooking(bookingPayload);

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
    } catch (_error) {
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
      <TopCheckoutSection currentStep={currentStep} setCurrentStep={setCurrentStep} />
      {renderStep()}
    </div>
  );
};

export default BookingPage;
