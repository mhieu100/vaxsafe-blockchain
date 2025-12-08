import { buildQuery } from '../utils/buildQuery';
import { usePaginatedQuery } from './usePaginatedQuery';

export const useCenter = (filter) => {
  const query = buildQuery(filter);
  return usePaginatedQuery('centers', '/api/centers', query);
};
