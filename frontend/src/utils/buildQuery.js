/* eslint-disable import/no-extraneous-dependencies */
import { sfLike, sfGt, sfLt } from 'spring-filter-query-builder';
import queryString from 'query-string';

/**
 * Build query string for API requests with pagination, filtering, and sorting
 * @param {object} params - Query parameters
 * @param {number} [params.current=1] - Current page number
 * @param {number} [params.pageSize=10] - Number of items per page
 * @param {object} [params.filters={}] - Filters object
 * @param {object} [params.sort={}] - Sort object with field: 'ascend'|'descend'
 * @returns {string} Query string for API request
 */
export const buildQuery = ({
  current = 1,
  pageSize = 10,
  filters = {},
  sort = {},
}) => {
  const q = {
    page: current,
    size: pageSize,
    filter: '',
  };

  const filterStrings = [];
  Object.entries(filters).forEach(([field, value]) => {
    // Handle price range filter
    if (field === 'price' && Array.isArray(value) && value.length === 2) {
      const [min, max] = value;
      filterStrings.push(`(${sfGt(field, min)} and ${sfLt(field, max)})`);
    }
    // Handle array filters (OR condition)
    else if (Array.isArray(value) && value.length > 0) {
      const orFilters = value.map((v) => sfLike(field, v)).join(' or ');
      filterStrings.push(`(${orFilters})`);
    }
    // Handle single value filter
    else if (value !== undefined && value !== null && value !== '') {
      filterStrings.push(sfLike(field, value).toString());
    }
  });

  if (filterStrings.length > 0) {
    q.filter = filterStrings.join(' and ');
  } else {
    delete q.filter;
  }

  let temp = queryString.stringify(q, {
    encode: false,
  });

  // Add sorting
  let sortBy = '';
  for (const [field, order] of Object.entries(sort)) {
    sortBy = order === 'ascend' ? `sort=${field},asc` : `sort=${field},desc`;
  }

  if (sortBy) {
    temp = `${temp}&${sortBy}`;
  }

  return temp;
};
