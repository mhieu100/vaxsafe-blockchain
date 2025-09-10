import { configureStore } from '@reduxjs/toolkit';

import accountReducer from './slice/accountSlide';
import centerReducer from './slice/centerSlice';
import vaccineReducer from './slice/vaccineSlice';
import userReducer from './slice/userSlice';
import permissionReducer from './slice/permissionSlice';
import roleReducer from './slice/roleSlice';
import bookingReducer from './slice/bookingSlice';

export const store = configureStore({
  reducer: {
    account: accountReducer,
    booking: bookingReducer,
    center: centerReducer,
    vaccine: vaccineReducer,
    user: userReducer,
    permission: permissionReducer,
    role: roleReducer,
  },
});
