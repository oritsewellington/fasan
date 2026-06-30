import { apiSlice } from './apiSlice.js';

export const eventsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query({
      query: (params = {}) => ({ url: '/events', params }),
      providesTags: ['Event'],
    }),
    getEvent: builder.query({
      query: (id) => `/events/${id}`,
      providesTags: (r, e, id) => [{ type: 'Event', id }],
    }),
    createEvent: builder.mutation({
      query: (formData) => ({ url: '/events', method: 'POST', body: formData, formData: true }),
      invalidatesTags: ['Event'],
    }),
    updateEvent: builder.mutation({
      query: ({ id, formData }) => ({ url: `/events/${id}`, method: 'PUT', body: formData, formData: true }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Event', id }, 'Event'],
    }),
    deleteEvent: builder.mutation({
      query: (id) => ({ url: `/events/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Event'],
    }),
    toggleEvent: builder.mutation({
      query: (id) => ({ url: `/events/${id}/toggle`, method: 'PATCH' }),
      invalidatesTags: ['Event'],
    }),
  }),
});

export const {
  useGetEventsQuery, useGetEventQuery,
  useCreateEventMutation, useUpdateEventMutation,
  useDeleteEventMutation, useToggleEventMutation,
} = eventsApi;
