// src/services/postsApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { Todo } from "./types"

export const todosApi = createApi({
  reducerPath: "postsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://697a2adbcc9c576a8e1906e1.mockapi.io/",
  }),
  tagTypes: ["Todo"],
  endpoints: (builder) => ({
    //GET /posts
    getPosts: builder.query<Todo[], void>({
      query: () => "todos",
      providesTags: (result) =>
        result
          ? [
              ...result.map((todo) => ({
                type: "Todo" as const,
                id: todo.id,
              })),
              { type: "Todo" as const, id: "LIST" },
            ]
          : [{ type: "Todo" as const, id: "LIST" }],
    }),

    //GET /posts/:id
    getPostById: builder.query<Todo, string>({
      query: (id) => `todos/${id}`,
      providesTags: (result, error, id) => [{ type: "Todo", id }],
    }),

    //POST /todos
    addPost: builder.mutation<Todo, Omit<Todo, "id">>({
      query: (newTodo) => ({
        url: "todos",
        method: "POST",
        body: newTodo,
      }),
      invalidatesTags: [{ type: "Todo", id: "LIST" }],
    }),

    // PUT /todos/:id
    updatePost: builder.mutation<Todo, Partial<Todo> & Pick<Todo, "id">>({
      query: ({ id, ...patch }) => ({
        url: `todos/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Todo", id },
      ],
    }),

    //DELETE /todos/:id
    deletePost: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `todos/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Todo", id: "LIST" }],
    }),
  }),
})

export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useAddPostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = todosApi
