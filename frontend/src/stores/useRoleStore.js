import { create } from 'zustand';
import { callFetchRole } from '../config/api.role';

const useRoleStore = create((set) => ({
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
  fetchRole: async (query) => {
    set({ isFetching: true });
    try {
      const response = await callFetchRole(query);
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

export { useRoleStore };
export default useRoleStore;
