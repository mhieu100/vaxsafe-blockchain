import { create } from 'zustand';
import { callFetchCenter } from '../config/api.center';

const useCenterStore = create((set) => ({
  // State
  isFetching: true,
  meta: {
    page: 1,
    pageSize: 10,
    pages: 0,
    total: 0,
  },
  result: [],

  // Actions
  fetchCenter: async (query) => {
    set({ isFetching: true });
    try {
      const response = await callFetchCenter(query);
      if (response && response.data) {
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
