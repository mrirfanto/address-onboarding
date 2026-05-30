import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  AddressDetailsResponse,
  AddressSearchResponse,
  AddressCreatePayload,
  CountryCode,
  CountryMetadataResponse,
  CountryOption,
  SavedAddress,
} from '@features/address-onboarding/types';

export const addressApi = createApi({
  reducerPath: 'addressApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Address', 'Metadata', 'Country'],
  endpoints: (builder) => ({
    getCountries: builder.query<CountryOption[], void>({
      query: () => '/countries',
      providesTags: ['Country'],
    }),
    getMetadata: builder.query<CountryMetadataResponse, CountryCode>({
      query: (countryCode) => `/metadata/${countryCode}`,
      providesTags: (_result, _error, countryCode) => [{ type: 'Metadata', id: countryCode }],
    }),
    getAddressSearch: builder.query<AddressSearchResponse, { query: string; countryCode: CountryCode }>({
      query: ({ query, countryCode }) => ({
        url: '/address-search',
        params: { query, countryCode },
      }),
    }),
    getAddressDetails: builder.query<AddressDetailsResponse, { placeId: string; countryCode: CountryCode }>({
      query: ({ placeId, countryCode }) => ({
        url: '/address-details',
        params: { placeId, countryCode },
      }),
    }),
    createAddress: builder.mutation<SavedAddress, AddressCreatePayload>({
      query: (body) => ({
        url: '/addresses',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Address'],
    }),
    getAddresses: builder.query<SavedAddress[], void>({
      query: () => '/addresses',
      providesTags: (result) =>
        result
          ? [
              ...result.map((address) => ({ type: 'Address' as const, id: address.id })),
              { type: 'Address', id: 'LIST' },
            ]
          : [{ type: 'Address', id: 'LIST' }],
    }),
    deleteAddress: builder.mutation<void, string>({
      query: (id) => ({
        url: `/addresses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Address', id },
        { type: 'Address', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetCountriesQuery,
  useGetMetadataQuery,
  useGetAddressSearchQuery,
  useGetAddressDetailsQuery,
  useLazyGetAddressDetailsQuery,
  useCreateAddressMutation,
  useGetAddressesQuery,
  useDeleteAddressMutation,
} = addressApi;
