import { create } from 'zustand';
import { callFetchAppointmentOfCenter, callMySchedule } from '../config/api.appointment';

const useAppointmentStore = create((set) => ({
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
  fetchAppointmentOfCenter: async (query) => {
    set({ isFetching: true });
    try {
      const response = await callFetchAppointmentOfCenter(query);
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

  fetchAppointmentOfDoctor: async (query) => {
    set({ isFetching: true });
    try {
      const response = await callMySchedule(query);
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

export { useAppointmentStore };
export default useAppointmentStore;
