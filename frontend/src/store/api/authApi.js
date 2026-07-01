import { apiSlice } from "./apiSlice.js";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    getMe: builder.query({
      query: () => "/auth/me",
      providesTags: ["Staff"],
    }),
    // Admin only — the 1-2 seeded logins that can manage all events/candidates
    getStaff: builder.query({
      query: () => "/auth/staff",
      providesTags: ["Staff"],
    }),
    createStaff: builder.mutation({
      query: (body) => ({ url: "/auth/staff", method: "POST", body }),
      invalidatesTags: ["Staff"],
    }),
    deleteStaff: builder.mutation({
      query: (staffId) => ({ url: `/auth/staff/${staffId}`, method: "DELETE" }),
      invalidatesTags: ["Staff"],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetMeQuery,
  useGetStaffQuery,
  useCreateStaffMutation,
  useDeleteStaffMutation,
} = authApi;
