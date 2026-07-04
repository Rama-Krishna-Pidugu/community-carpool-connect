import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import "./styles.css";

// 1. Create a fresh core QueryClient instance for caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// 2. Initialize the router and inject the required queryClient context
const router = createRouter({
  routeTree,
  context: {
    queryClient, // This satisfies the 'Property context is missing' type requirement
  },
});

// 3. Register the router instance for type-safety across the application
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// 4. Mount the DOM tree wrapped with the QueryClient provider wrapper
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);