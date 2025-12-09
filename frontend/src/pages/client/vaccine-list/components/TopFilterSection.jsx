import { AppstoreOutlined, BarsOutlined } from '@ant-design/icons';
import { Button, Pagination, Space } from 'antd';
import { useTranslation } from 'react-i18next';

const TopFilterSection = ({
  meta,
  pageSize,
  setPageSize,
  currentPage,
  setCurrentPage,
  viewMode,
  setViewMode,
  /* onSearch removed */
}) => {
  const { t } = useTranslation();

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    if (size !== pageSize) {
      setPageSize(size);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
      <span className="text-lg font-medium text-gray-700 hidden sm:inline-block">
        {meta.total} {t(meta.total === 1 ? 'vaccine.found' : 'vaccine.foundPlural')}
      </span>

      <div className="flex items-center justify-between w-full sm:w-auto">
        {/* Mobile Total Count */}
        <span className="text-sm font-medium text-gray-700 sm:hidden">
          {meta.total} {t(meta.total === 1 ? 'vaccine.found' : 'vaccine.foundPlural')}
        </span>

        <div className="flex items-center">
          <Pagination
            current={currentPage}
            total={meta.total}
            pageSize={pageSize}
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
            pageSizeOptions={['8', '12', '24', '48']}
            className="text-center"
            size="small"
          />

          <div className="h-8 w-px bg-gray-300 mx-4 hidden sm:block" />

          <Space.Compact className="hidden sm:inline-flex">
            <Button
              icon={<AppstoreOutlined />}
              type={viewMode === 'grid' ? 'primary' : 'default'}
              onClick={() => setViewMode('grid')}
              className="shadow-sm"
            />
            <Button
              icon={<BarsOutlined />}
              type={viewMode === 'list' ? 'primary' : 'default'}
              onClick={() => setViewMode('list')}
              className="shadow-sm"
            />
          </Space.Compact>
        </div>
      </div>
    </div>
  );
};

export default TopFilterSection;
