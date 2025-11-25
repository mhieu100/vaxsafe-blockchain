import VaccineCard from '@/components/card/VaccineCard';
import VaccineModeCard from '@/components/card/VaccineModeCard';

/**
 * ListVaccineSection component displays vaccines in grid or list view
 * @param {object} props - Component props
 * @param {string} props.viewMode - View mode: 'grid' or 'list'
 * @param {Array} props.vaccines - Array of vaccine objects
 * @returns {React.Component}
 */
const ListVaccineSection = ({ vaccines, viewMode }) => {
  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2'
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
