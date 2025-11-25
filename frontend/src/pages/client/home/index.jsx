import HeroSection from './components/HeroSection';
import ServiceSection from './components/ServiceSection';

const HomePage = () => {
  return (
    <div className="flex flex-col ">
      <HeroSection />
      <ServiceSection />
    </div>
  );
};

export default HomePage;
