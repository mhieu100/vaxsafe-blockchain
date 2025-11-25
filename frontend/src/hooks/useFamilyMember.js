import { buildQuery } from '../utils/buildQuery';
import { usePaginatedQuery } from './usePaginatedQuery';

/**
 * Custom hook for fetching family members with pagination and filtering
 * @param {object} filter - Filter parameters (current, pageSize, filters, sort)
 * @returns {object} React Query result with family members data
 */
export const useFamilyMember = (filter) => {
  const query = buildQuery(filter);
  return usePaginatedQuery('family-members', '/api/family-members', query);
};
