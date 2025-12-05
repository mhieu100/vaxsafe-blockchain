import { buildQuery } from '../utils/buildQuery';
import { usePaginatedQuery } from './usePaginatedQuery';

/**
 * Custom hook for fetching vaccination centers with pagination and filtering
 * @param {object} filter - Filter parameters (current, pageSize, filters, sort)
 * @returns {object} React Query result with centers data
 */
export const useCenter = (filter) => {
  const query = buildQuery(filter);
  return usePaginatedQuery('centers', '/api/centers', query);
};
