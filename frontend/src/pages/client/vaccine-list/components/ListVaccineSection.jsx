import VaccineCard from './VaccineCard';
import VaccineModeCard from './VaccineModeCard';

const ListVaccineSection = ({ vaccines, viewMode }) => {
  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
          : 'flex flex-col gap-4'
      }
    >
      {vaccines?.map((vaccine) =>
        viewMode === 'grid' ? (
          <VaccineCard key={vaccine.id} vaccine={vaccine} />
        ) : (
          <VaccineModeCard key={vaccine.id} vaccine={vaccine} />
        )
      )}
    </div>
  );
};

export default ListVaccineSection;
