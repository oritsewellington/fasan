import { apiSlice } from "./apiSlice.js";

export const pollsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Summary for every event — powers the /polls index page
    getAllPolls: builder.query({
      query: () => "/polls",
      providesTags: ["Poll"],
    }),
    // Full live standings for one event's candidates
    getEventPoll: builder.query({
      query: (eventId) => `/polls/${eventId}`,
      providesTags: (r, e, eventId) => [{ type: "Poll", id: eventId }],
    }),
  }),
});

export const { useGetAllPollsQuery, useGetEventPollQuery } = pollsApi;
