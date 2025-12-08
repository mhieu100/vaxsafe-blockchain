import { buildQuery } from '../utils/buildQuery';
import { usePaginatedQuery } from './usePaginatedQuery';

export const useFamilyMember = (filter) => {
  const query = buildQuery(filter);
  return usePaginatedQuery('family-members', '/api/family-members', query);
};
