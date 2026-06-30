import { apiSlice } from './apiSlice.js';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({ url: '/auth/login', method: 'POST', body: credentials }),
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['Organizer'],
    }),
    getOrganizers: builder.query({
      query: () => '/auth/organizers',
      providesTags: ['Organizer'],
    }),
    createOrganizer: builder.mutation({
      query: (body) => ({ url: '/auth/organizers', method: 'POST', body }),
      invalidatesTags: ['Organizer'],
    }),
    updateCommission: builder.mutation({
      query: ({ organizerId, commission }) => ({
        url: `/auth/organizers/${organizerId}/commission`,
        method: 'PATCH',
        body: { commission },
      }),
      invalidatesTags: ['Organizer'],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetMeQuery,
  useGetOrganizersQuery,
  useCreateOrganizerMutation,
  useUpdateCommissionMutation,
} = authApi;
