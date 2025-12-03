import { create } from 'zustand';
import { callFetchPatients } from '../services/user.service';

// This store is deprecated - new pages use local state
// Keeping for backward compatibility with old user page
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
      // Default to patients if used
      const response = await callFetchPatients(query);
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

export { useUserStore };
export default useUserStore;
