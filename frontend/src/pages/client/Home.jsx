import HeroSection from '../../components/hero/HeroSection';
import ServiceSection from '../../components/service/ServiceSection';

const HomePage = () => {
  return (
    <div className="flex flex-col ">
      <HeroSection />
      <ServiceSection />
    </div>
  );
};

export default HomePage;
