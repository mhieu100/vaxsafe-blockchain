import {
  DollarOutlined,
  FilterOutlined,
  GlobalOutlined,
  SearchOutlined,
  SortAscendingOutlined,
} from '@ant-design/icons';
import { Button, Input, Select, Slider } from 'antd';

import debounce from 'lodash/debounce';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MAX_PRICE, MIN_PRICE } from '@/constants';
import { callGetAllCountries } from '@/services/vaccine.service';
import { formatPrice } from '@/utils/formatPrice';

const { Option } = Select;

const LeftFilterSection = ({ setPriceRange, country, setCountry, sortBy, setSortBy, onSearch }) => {
  const { t } = useTranslation();
  const [countries, setCountries] = useState([]);
  const [sliderRange, setSliderRange] = useState([MIN_PRICE, MAX_PRICE]);
  const [searchValue, setSearchValue] = useState('');

  const handleCountryChange = (value) => {
    setCountry(value);
  };

  useEffect(() => {
    const handleFetchCountries = async () => {
      const response = await callGetAllCountries();
      if (response?.data) {
        setCountries(response.data);
      }
    };
    handleFetchCountries();
  }, []);

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const debouncedSetPriceRange = useMemo(
    () =>
      debounce((value) => {
        setPriceRange([value[0] ?? MIN_PRICE, value[1] ?? MAX_PRICE]);
      }, 300),
    [setPriceRange]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch(value);
  };

  const handlePriceRangeChange = (value) => {
    setSliderRange([value[0] ?? MIN_PRICE, value[1] ?? MAX_PRICE]);
    debouncedSetPriceRange(value);
  };

  useEffect(() => {
    return () => {
      debouncedSetPriceRange.cancel();
    };
  }, [debouncedSetPriceRange]);

  const clearAllFilters = () => {
    setSortBy(null);
    setCountry([]);
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setSliderRange([MIN_PRICE, MAX_PRICE]);
    setSearchValue('');
    onSearch('');
  };

  return (
    <div id="tour-vaccine-filter" className="hidden md:block sticky w-64 flex-shrink-0">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FilterOutlined className="text-blue-600" /> {t('vaccine.filters')}
          </h3>
          {(country.length > 0 ||
            sortBy ||
            sliderRange[0] !== MIN_PRICE ||
            sliderRange[1] !== MAX_PRICE) && (
            <Button
              type="text"
              size="small"
              onClick={clearAllFilters}
              className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="mb-8">
          <Input
            placeholder={t('vaccine.searchPlaceholder', 'Search...')}
            prefix={<SearchOutlined className="text-slate-400" />}
            onChange={handleSearchChange}
            value={searchValue}
            className="w-full rounded-xl"
            allowClear
            size="large"
          />
        </div>

        {/* Sort By */}
        <div className="mb-8">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">
            Sort By
          </label>
          <Select
            placeholder={t('vaccine.sortBy')}
            style={{ width: '100%' }}
            value={sortBy}
            onChange={handleSortChange}
            suffixIcon={<SortAscendingOutlined className="text-slate-400" />}
            className="custom-select"
            size="large"
            allowClear
          >
            <Option value="price-ascend">{t('vaccine.sortOptions.priceLowToHigh')}</Option>
            <Option value="price-descend">{t('vaccine.sortOptions.priceHighToLow')}</Option>
            <Option value="name-ascend">{t('vaccine.sortOptions.nameAZ')}</Option>
            <Option value="name-descend">{t('vaccine.sortOptions.nameZA')}</Option>
          </Select>
        </div>

        {}
        <div className="mb-8">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block flex items-center gap-2">
            <GlobalOutlined /> Origin Country
          </label>
          <Select
            mode="multiple"
            placeholder="Select countries"
            allowClear
            style={{ width: '100%' }}
            value={country}
            onChange={handleCountryChange}
            className="custom-select"
            size="large"
            maxTagCount="responsive"
          >
            {countries.map((c) => (
              <Option key={c} value={c}>
                <div className="flex items-center gap-2">
                  <span>{c}</span>
                </div>
              </Option>
            ))}
          </Select>
        </div>

        {}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 block flex items-center gap-2">
            <DollarOutlined /> Price Range
          </label>
          <div className="px-2">
            <Slider
              range
              min={MIN_PRICE}
              max={MAX_PRICE}
              value={sliderRange}
              onChange={handlePriceRangeChange}
              tooltip={{ formatter: (value) => formatPrice(value) }}
              trackStyle={[{ backgroundColor: '#2563eb' }]}
              handleStyle={[
                { borderColor: '#2563eb', backgroundColor: 'white' },
                { borderColor: '#2563eb', backgroundColor: 'white' },
              ]}
            />
          </div>
          <div className="flex items-center justify-between mt-4 text-sm font-medium text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span>{formatPrice(sliderRange[0])}</span>
            <span className="text-slate-300">-</span>
            <span>{formatPrice(sliderRange[1])}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftFilterSection;
