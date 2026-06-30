import { apiSlice } from './apiSlice.js';

export const votesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    initializePayment: builder.mutation({
      query: (body) => ({ url: '/votes/initialize', method: 'POST', body }),
    }),
    verifyPayment: builder.mutation({
      query: (reference) => ({ url: `/votes/verify/${reference}`, method: 'POST' }),
      invalidatesTags: ['Vote', 'Candidate', 'Stats'],
    }),
    getVoteHistory: builder.query({
      query: (eventId) => `/votes?eventId=${eventId}`,
      providesTags: ['Vote'],
    }),
  }),
});

export const {
  useInitializePaymentMutation, useVerifyPaymentMutation, useGetVoteHistoryQuery,
} = votesApi;
