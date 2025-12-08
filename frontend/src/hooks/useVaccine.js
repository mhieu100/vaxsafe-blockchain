import { buildQuery } from '../utils/buildQuery';
import { usePaginatedQuery } from './usePaginatedQuery';

export const useVaccine = (filter) => {
  const query = buildQuery(filter);
  return usePaginatedQuery('vaccines', '/api/vaccines', query);
};
