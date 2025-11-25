import { Skeleton } from 'antd';
import { useState } from 'react';
import { MAX_PRICE, MIN_PRICE } from '@/constants';
import { useVaccine } from '@/hooks/useVaccine';
import LeftFilterSection from './components/LeftFilterSection';
import ListVaccineSection from './components/ListVaccineSection';
import QuickStatsSection from './components/QuickStatsSection';
import TopFilterSection from './components/TopFilterSection';

const VaccineListPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [country, setCountry] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [priceRange, setPriceRange] = useState([MIN_PRICE, MAX_PRICE]);

  const sort = {};
  if (sortBy) {
    const [field, direction] = sortBy.split('-');
    sort[field] = direction === 'ascend' ? 'ascend' : 'descend';
  }

  const filter = {
    current: currentPage,
    pageSize: pageSize,
    filters: { price: priceRange, country: country },
    sort,
  };

  const { data } = useVaccine(filter);

  return (
    <div className="my-5 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-6">
        {!data ? (
          <Skeleton />
        ) : (
          <>
            <aside className="md:w-64 sticky top-[88px] self-start h-[calc(100vh-88px)] overflow-y-auto">
              <LeftFilterSection
                country={country}
                setCountry={setCountry}
                sortBy={sortBy}
                setSortBy={setSortBy}
                setPriceRange={setPriceRange}
              />
            </aside>
            <main className="flex-1 min-w-0">
              <TopFilterSection
                meta={data?.meta ?? undefined}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                pageSize={pageSize}
                setPageSize={setPageSize}
                viewMode={viewMode}
                setViewMode={setViewMode}
              />
              <ListVaccineSection vaccines={data.result} viewMode={viewMode} />
              <QuickStatsSection />
            </main>
          </>
        )}
      </div>
    </div>
  );
};

export default VaccineListPage;
