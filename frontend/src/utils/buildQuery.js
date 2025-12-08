import queryString from 'query-string';
import { sfGt, sfLike, sfLt } from 'spring-filter-query-builder';

export const buildQuery = ({ current = 1, pageSize = 10, filters = {}, sort = {} }) => {
  const q = {
    page: current,
    size: pageSize,
    filter: '',
  };

  const filterStrings = [];
  Object.entries(filters).forEach(([field, value]) => {
    if (field === 'price' && Array.isArray(value) && value.length === 2) {
      const [min, max] = value;
      filterStrings.push(`(${sfGt(field, min)} and ${sfLt(field, max)})`);
    } else if (Array.isArray(value) && value.length > 0) {
      const orFilters = value.map((v) => sfLike(field, v)).join(' or ');
      filterStrings.push(`(${orFilters})`);
    } else if (value !== undefined && value !== null && value !== '') {
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

  let sortBy = '';
  for (const [field, order] of Object.entries(sort)) {
    sortBy = order === 'ascend' ? `sort=${field},asc` : `sort=${field},desc`;
  }

  if (sortBy) {
    temp = `${temp}&${sortBy}`;
  }

  return temp;
};
