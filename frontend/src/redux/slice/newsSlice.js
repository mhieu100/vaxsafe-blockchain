import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { callFetchNews } from '../../config/api.news';

export const fetchNews = createAsyncThunk(
  'news/fetchNews',
  async ({ query }) => {
    const response = await callFetchNews(query);
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

export const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.isFetching = true;
      })
      .addCase(fetchNews.rejected, (state) => {
        state.isFetching = false;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        if (action.payload && action.payload.data) {
          state.isFetching = false;
          state.meta = action.payload.data.meta;
          state.result = action.payload.data.result;
        }
      });
  },
});

export default newsSlice.reducer;
