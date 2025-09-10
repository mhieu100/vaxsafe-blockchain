import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { callFetchAccount } from '../../config/api.auth';

export const fetchAccount = createAsyncThunk(
  'account/fetchAccount',
  async () => {
    const response = await callFetchAccount();
    return response.data;
  }
);

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: {
    id: '',
    fullName: '',
    email: '',
    role: '',
    walletAddress: '',
    centerName: '',
  },
};

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setUserLoginInfo: (state, action) => {
      state.isAuthenticated = true;
      state.isLoading = false;

      state.user.id = action.payload.id;
      state.user.fullName = action.payload.fullName;
      state.user.email = action.payload.email;
      state.user.role = action.payload.role;
      state.user.walletAddress = action.payload.walletAddress;
      state.user.centerName = action.payload.centerName;
    },
    setLogoutAction: (state) => {
      state.isAuthenticated = false;
      state.user = {};
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAccount.pending, (state, action) => {
      if (action.payload) {
        state.isAuthenticated = false;
        state.isLoading = true;
      }
    });

    builder.addCase(fetchAccount.fulfilled, (state, action) => {
      if (action.payload) {
        state.isAuthenticated = true;
        state.isLoading = false;
        state.user.id = action.payload.id;
        state.user.fullName = action.payload.fullName;
        state.user.email = action.payload.email;
        state.user.role = action.payload.role;
        state.user.walletAddress = action.payload.walletAddress;
        state.user.centerName = action.payload.centerName;
      }
    });

    builder.addCase(fetchAccount.rejected, (state, action) => {
      if (action.payload) {
        state.isAuthenticated = false;
        state.isLoading = false;
      }
    });
  },
});

export const { setUserLoginInfo, setLogoutAction } = accountSlice.actions;

export default accountSlice.reducer;
