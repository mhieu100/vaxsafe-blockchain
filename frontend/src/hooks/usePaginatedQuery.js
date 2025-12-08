import { keepPreviousData, useQuery } from '@tanstack/react-query';
import apiClient from '../services/apiClient';

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
    staleTime: 1000 * 60,
  });
};
