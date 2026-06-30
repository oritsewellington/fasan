import { apiSlice } from './apiSlice.js';

export const statsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats:          builder.query({ query: () => '/stats/admin',                        providesTags: ['Stats'] }),
    getOrganizerStats:      builder.query({ query: (id) => `/stats/organizer/${id}`,            providesTags: ['Stats'] }),
    getEventStats:          builder.query({ query: (id) => `/stats/event/${id}`,                providesTags: ['Stats'] }),
    getRecentTransactions:  builder.query({ query: (p={}) => ({ url: '/stats/transactions', params: p }), providesTags: ['Stats'] }),
  }),
});

export const {
  useGetAdminStatsQuery, useGetOrganizerStatsQuery,
  useGetEventStatsQuery, useGetRecentTransactionsQuery,
} = statsApi;
