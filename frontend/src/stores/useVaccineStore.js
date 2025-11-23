import { create } from 'zustand';
import { callFetchVaccine } from '../config/api.vaccine';

const useVaccineStore = create((set) => ({
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
  fetchVaccine: async (query) => {
    set({ isFetching: true });
    try {
      const response = await callFetchVaccine(query);
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

export { useVaccineStore };
export default useVaccineStore;
