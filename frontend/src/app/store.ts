import { configureStore } from '@reduxjs/toolkit';
import { addressApi } from '@shared/api/addressApi';

export const store = configureStore({
  reducer: {
    [addressApi.reducerPath]: addressApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(addressApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
