import { create } from 'zustand';
import { callFetchNews } from '../services/news.service';

const useNewsStore = create((set) => ({
  isFetching: true,
  meta: {
    page: 1,
    pageSize: 10,
    pages: 0,
    total: 0,
  },
  result: [],

  fetchNews: async (query) => {
    set({ isFetching: true });
    try {
      const response = await callFetchNews(query);
      if (response?.data) {
        set({
          isFetching: false,
          meta: response.data.meta,
          result: response.data.result,
        });
      }
    } catch {
      set({ isFetching: false });
    }
  },

  reset: () =>
    set({
      isFetching: true,
      meta: {
        page: 1,
        pageSize: 10,
        pages: 0,
        total: 0,
      },
      result: [],
    }),
}));

export { useNewsStore };
export default useNewsStore;
