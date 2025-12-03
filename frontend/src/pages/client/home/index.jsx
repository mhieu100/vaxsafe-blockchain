import BookingStepsSection from './components/BookingStepsSection';
import HeroSection from './components/HeroSection';
import NewsSection from './components/NewsSection';
import ServiceSection from './components/ServiceSection';

const HomePage = () => {
  return (
    <div className="flex flex-col ">
      <HeroSection />
      <BookingStepsSection />
      <ServiceSection />
      <NewsSection />
    </div>
  );
};

export default HomePage;
