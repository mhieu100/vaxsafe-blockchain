import {
  ClearOutlined,
  FilterOutlined,
  SortAscendingOutlined,
} from '@ant-design/icons';
import { Button, Divider, Select, Slider } from 'antd';
import { useEffect, useMemo, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import debounce from 'lodash/debounce';
import { MIN_PRICE, MAX_PRICE } from '../../constants';
import { formatPrice } from '../../utils/formatPrice';
import { callGetAllCountries } from '../../config/api.vaccine';

const { Option } = Select;

/**
 * LeftFilterSection component for filtering vaccines
 * @param {object} props - Component props
 * @param {Function} props.setPriceRange - Function to set price range filter
 * @param {Array} props.country - Selected countries array
 * @param {Function} props.setCountry - Function to set country filter
 * @param {string|null} props.sortBy - Sort by value
 * @param {Function} props.setSortBy - Function to set sort by value
 * @returns {React.Component}
 */
const LeftFilterSection = ({
  setPriceRange,
  country,
  setCountry,
  sortBy,
  setSortBy,
}) => {
  const [countries, setCountries] = useState([]);
  const [sliderRange, setSliderRange] = useState([MIN_PRICE, MAX_PRICE]);

  const handleCountryChange = (value) => {
    setCountry(value);
  };

  useEffect(() => {
    const handleFetchCountries = async () => {
      const response = await callGetAllCountries();
      if (response && response.data) {
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
  };

  return (
    <div className="hidden md:block sticky w-64 flex-shrink-0">
      <div className="bg-amber-50 p-6 rounded-lg shadow-sm top-6">
        <h3 className="text-lg font-bold mb-6">
          <FilterOutlined /> Filters
        </h3>

        <div className="mb-8">
          <div className="flex flex-wrap gap-3 items-center">
            <Select
              mode="multiple"
              placeholder="Select Country"
              allowClear
              style={{ width: '100%' }}
              value={country}
              onChange={handleCountryChange}
              className="shadow-sm"
            >
              {countries.map((c) => (
                <Option key={c} value={c}>
                  {c}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Sort by"
              style={{ width: '100%' }}
              value={sortBy}
              onChange={handleSortChange}
              suffixIcon={<SortAscendingOutlined />}
              className="shadow-sm"
            >
              <Option value="price-ascend">Price: Low to High</Option>
              <Option value="price-descend">Price: High to Low</Option>
              <Option value="name-ascend">Name A-Z</Option>
              <Option value="name-descend">Name Z-A</Option>
            </Select>
          </div>
        </div>
        <h3 className="text-lg font-bold mb-6">Price Range</h3>
        <div className="p-2 rounded-lg">
          <Slider
            range
            min={MIN_PRICE}
            max={MAX_PRICE}
            value={sliderRange}
            onChange={handlePriceRangeChange}
            marks={{
              0: '0',
              1000000: '1tr',
              2000000: '2tr',
              3000000: '3tr',
            }}
          />
          <div className="text-center text-sm text-gray-500 bg-white px-2 py-1 rounded">
            {formatPrice(sliderRange[0])} - {formatPrice(sliderRange[1])}
          </div>
        </div>
        <Divider />
        <Button
          type="primary"
          size="small"
          onClick={clearAllFilters}
          icon={<ClearOutlined />}
          className="w-full"
          danger
        >
          Clear All
        </Button>
      </div>
    </div>
  );
};

export default LeftFilterSection;
