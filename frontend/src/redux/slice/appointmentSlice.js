import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { callFetchAppointmentOfCenter } from '../../config/api.appointment';

export const fetchAppointment = createAsyncThunk(
  'appointment/fetchAppointment',
  async ({ query }) => {
    const response = await callFetchAppointmentOfCenter(query);
    return response;
  }
);

const initialState = {
  isFetching: true,
  meta: {
    page: 1,
    pageSize: 10,
    pages: 0,
    total: 0,
  },
  result: [],
};

export const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointment.pending, (state) => {
        state.isFetching = true;
      })
      .addCase(fetchAppointment.rejected, (state) => {
        state.isFetching = false;
      })
      .addCase(fetchAppointment.fulfilled, (state, action) => {
        if (action.payload && action.payload.data) {
          state.isFetching = false;
          state.meta = action.payload.data.meta;
          state.result = action.payload.data.result;
        }
      });
  },
});

export default appointmentSlice.reducer;
