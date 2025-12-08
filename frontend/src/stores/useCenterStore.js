import { create } from 'zustand';
import { callFetchCenter } from '../services/center.service';

const useCenterStore = create((set) => ({
  isFetching: true,
  meta: {
    page: 1,
    pageSize: 10,
    pages: 0,
    total: 0,
  },
  result: [],

  fetchCenter: async (query) => {
    set({ isFetching: true });
    try {
      const response = await callFetchCenter(query);
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

export { useCenterStore };
export default useCenterStore;
