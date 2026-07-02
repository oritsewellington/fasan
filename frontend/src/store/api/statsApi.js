import { apiSlice } from "./apiSlice.js";

export const statsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query({
      query: () => "/stats/admin",
      providesTags: ["Stats"],
    }),
    getStaffStats: builder.query({
      query: () => "/stats/staff",
      providesTags: ["Stats"],
    }),
    getEventStats: builder.query({
      query: (id) => `/stats/event/${id}`,
      providesTags: ["Stats"],
    }),
    getRecentTransactions: builder.query({
      query: (p = {}) => ({ url: "/stats/transactions", params: p }),
      providesTags: ["Stats"],
    }),
    getPlatformStats: builder.query({
      query: () => "/stats/platform",
      providesTags: ["Stats"],
    }),
  }),
});

export const {
  useGetAdminStatsQuery,
  useGetStaffStatsQuery,
  useGetEventStatsQuery,
  useGetRecentTransactionsQuery,
  useGetPlatformStatsQuery,
} = statsApi;
