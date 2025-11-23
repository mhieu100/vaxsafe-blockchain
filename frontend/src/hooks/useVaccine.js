import { usePaginatedQuery } from './usePaginatedQuery';
import { buildQuery } from '../utils/buildQuery';

/**
 * Custom hook for fetching vaccines with pagination and filtering
 * @param {object} filter - Filter parameters (current, pageSize, filters, sort)
 * @returns {object} React Query result with vaccines data
 */
export const useVaccine = (filter) => {
  const query = buildQuery(filter);
  return usePaginatedQuery('vaccines', '/vaccines', query);
};
