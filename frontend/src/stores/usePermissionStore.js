import { create } from 'zustand';
import { callFetchPermission } from '../services/permission.service';

const usePermissionStore = create((set) => ({
  isFetching: true,
  meta: {
    page: 1,
    pageSize: 10,
    pages: 0,
    total: 0,
  },
  result: [],

  fetchPermission: async (query) => {
    set({ isFetching: true });
    try {
      const response = await callFetchPermission(query);
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

export { usePermissionStore };
export default usePermissionStore;
