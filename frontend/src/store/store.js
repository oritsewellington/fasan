import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice.js';
import authReducer from './slices/authSlice.js';
import voteReducer from './slices/voteSlice.js';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    vote: voteReducer,
  },
  middleware: (gDM) => gDM().concat(apiSlice.middleware),
  devTools: import.meta.env.DEV,
});
