import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const addressApi = createApi({
  reducerPath: 'addressApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: () => ({}),
});
