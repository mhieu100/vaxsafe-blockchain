import { Card, Col, Row, Skeleton } from 'antd';
import debounce from 'lodash/debounce';
import { useEffect, useMemo, useState } from 'react';
import { MAX_PRICE, MIN_PRICE } from '@/constants';
import { useVaccine } from '@/hooks/useVaccine';
import LeftFilterSection from './components/LeftFilterSection';
import ListVaccineSection from './components/ListVaccineSection';
import TopFilterSection from './components/TopFilterSection';

const VaccineListPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [country, setCountry] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [priceRange, setPriceRange] = useState([MIN_PRICE, MAX_PRICE]);
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setSearchTerm(value);
        setCurrentPage(1); // Reset to page 1 on search
      }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const sort = {};
  if (sortBy) {
    const [field, direction] = sortBy.split('-');
    sort[field] = direction === 'ascend' ? 'ascend' : 'descend';
  }

  const filter = {
    current: currentPage,
    pageSize: pageSize,
    filters: { price: priceRange, country: country, search: searchTerm },
    sort,
  };

  const { data, isPending: isLoading } = useVaccine(filter);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6">
          {}
          <aside className="md:w-64 sticky top-[88px] self-start h-[calc(100vh-88px)] overflow-y-auto hidden md:block">
            {isLoading ? (
              <Card className="rounded-2xl shadow-sm border border-slate-100">
                <Skeleton active paragraph={{ rows: 8 }} />
              </Card>
            ) : (
              <LeftFilterSection
                country={country}
                setCountry={setCountry}
                sortBy={sortBy}
                setSortBy={setSortBy}
                setPriceRange={setPriceRange}
                onSearch={debouncedSearch}
              />
            )}
          </aside>

          {}
          <main id="tour-vaccine-list" className="flex-1 min-w-0">
            {isLoading ? (
              <div className="space-y-6">
                {}
                <Card className="rounded-2xl shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center">
                    <Skeleton.Input active size="default" className="!w-48" />
                    <Skeleton.Button active size="default" />
                  </div>
                </Card>

                {}
                <Row gutter={[24, 24]}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Col key={i} xs={24} sm={12} lg={8}>
                      <Card className="rounded-3xl shadow-sm border border-slate-100 overflow-hidden h-full">
                        <Skeleton.Image active className="!w-full !h-48" />
                        <div className="p-4">
                          <Skeleton active paragraph={{ rows: 3 }} />
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            ) : (
              <>
                <TopFilterSection
                  meta={data?.meta ?? undefined}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  pageSize={pageSize}
                  setPageSize={setPageSize}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                />
                <ListVaccineSection vaccines={data?.result || []} viewMode={viewMode} />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default VaccineListPage;
