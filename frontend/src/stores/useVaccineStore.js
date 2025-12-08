import { create } from 'zustand';
import { callFetchVaccine } from '../services/vaccine.service';

const useVaccineStore = create((set) => ({
  isFetching: true,
  meta: {
    page: 1,
    pageSize: 10,
    pages: 0,
    total: 0,
  },
  result: [],

  fetchVaccine: async (query) => {
    set({ isFetching: true });
    try {
      const response = await callFetchVaccine(query);
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

export { useVaccineStore };
export default useVaccineStore;
