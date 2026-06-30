import { apiSlice } from './apiSlice.js';

export const candidatesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCandidates: builder.query({
      query: (eventId) => `/events/${eventId}/candidates`,
      providesTags: ['Candidate'],
    }),
    getCandidate: builder.query({
      query: ({ eventId, candidateId }) => `/events/${eventId}/candidates/${candidateId}`,
      providesTags: ['Candidate'],
    }),
    createCandidate: builder.mutation({
      query: ({ eventId, formData }) => ({
        url: `/events/${eventId}/candidates`,
        method: 'POST', body: formData, formData: true,
      }),
      invalidatesTags: ['Candidate'],
    }),
    updateCandidate: builder.mutation({
      query: ({ eventId, candidateId, formData }) => ({
        url: `/events/${eventId}/candidates/${candidateId}`,
        method: 'PUT', body: formData, formData: true,
      }),
      invalidatesTags: ['Candidate'],
    }),
    deleteCandidate: builder.mutation({
      query: ({ eventId, candidateId }) => ({
        url: `/events/${eventId}/candidates/${candidateId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Candidate'],
    }),
  }),
});

export const {
  useGetCandidatesQuery, useGetCandidateQuery,
  useCreateCandidateMutation, useUpdateCandidateMutation,
  useDeleteCandidateMutation,
} = candidatesApi;
