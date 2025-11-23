import { create } from 'zustand';
import { callFetchUser } from '../config/api.user';

const useUserStore = create((set) => ({
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
  fetchUser: async (query) => {
    set({ isFetching: true });
    try {
      const response = await callFetchUser(query);
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

export { useUserStore };
export default useUserStore;
