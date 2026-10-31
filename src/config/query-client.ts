import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 0, // Immediately stale so new logins always fetch fresh account data
      gcTime: 1000 * 60 * 5, // 5 minutes garbage collection
    },
  },
});

export default queryClient;

