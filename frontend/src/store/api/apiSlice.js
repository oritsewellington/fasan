import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    // Automatically grabs the URL from your active .env file
    baseUrl: import.meta.env.VITE_API_URL || "/api",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Event", "Candidate", "Vote", "Stats", "Organizer", "Category"],
  endpoints: () => ({}),
});
