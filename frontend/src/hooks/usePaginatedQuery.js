import { keepPreviousData, useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

/**
 * Custom hook for paginated API queries with React Query
 * @param {string} key - Query key for caching
 * @param {string} url - API endpoint URL
 * @param {string} queryString - Query string parameters
 * @returns {object} React Query result with data, isLoading, error, etc.
 */
export const usePaginatedQuery = (key, url, queryString) => {
  return useQuery({
    queryKey: [key, queryString],
    queryFn: async () => {
      const res = await apiClient.get(`${url}?${queryString}`);

      if (res.statusCode !== 200 || !res.data) {
        throw new Error(res.error || 'Failed to fetch data');
      }

      return res.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // 1 minute
  });
};
