import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import 'react-native-url-polyfill/auto';
import { API_CONFIG } from '../constants';
import { authStorage } from '../storage';

// Type imports - these would match your backend router types
// For now, we'll use a generic type
type AppRouter = any; // Replace with actual router type from backend

// Create the tRPC React client
export const trpc = createTRPCReact<AppRouter>();

// Create the tRPC vanilla client
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MOBILE}/trpc`,
      headers: async () => {
        const token = authStorage.getToken();
        return {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        };
      },
    }),
  ],
});

// Create React Query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

// tRPC client configuration
export const trpcClientConfig = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MOBILE}/trpc`,
      headers: async () => {
        const token = authStorage.getToken();
        return {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        };
      },
      fetch: async (input, init) => {
        // Add timeout and error handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        try {
          const response = await fetch(input, {
            ...init,
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          // Handle authentication errors
          if (response.status === 401) {
            // Clear stored token and redirect to login
            authStorage.removeToken();
            // You might want to emit an event or use a navigation service here
          }
          
          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      },
    }),
  ],
});

// API utility functions
export const api = {
  // Featured listings for home screen
  getFeaturedListings: () => 
    trpcClient.mobile.getFeaturedListings.query(),
  
  // Get listings with pagination and filters
  getListings: (params: {
    page?: number;
    limit?: number;
    search?: string;
    systemId?: string;
    deviceId?: string;
    emulatorId?: string;
    performanceRank?: number;
    sortBy?: string;
  }) => 
    trpcClient.mobile.getListings.query(params),
  
  // Get listing by ID
  getListingById: (id: string) => 
    trpcClient.mobile.getListingById.query({ id }),
  
  // Get games with search
  getGames: (params: { search?: string; systemId?: string; limit?: number }) => 
    trpcClient.mobile.getGames.query(params),
  
  // Get systems
  getSystems: () => 
    trpcClient.mobile.getSystems.query(),
  
  // Get devices
  getDevices: (params: { search?: string; brandId?: string; limit?: number }) => 
    trpcClient.mobile.getDevices.query(params),
  
  // Get emulators
  getEmulators: (params: { search?: string; systemId?: string; limit?: number }) => 
    trpcClient.mobile.getEmulators.query(params),
  
  // Vote on listing
  voteListing: (params: { listingId: string; voteType: 'UP' | 'DOWN' }) => 
    trpcClient.mobile.voteListing.mutate(params),
  
  // Get user profile
  getUserProfile: () => 
    trpcClient.mobile.getUserProfile.query(),
  
  // Get user listings
  getUserListings: (params: { page?: number; limit?: number }) => 
    trpcClient.mobile.getUserListings.query(params),
};

// Error handling utility
export const handleApiError = (error: any) => {
  console.error('API Error:', error);
  
  if (error?.data?.code === 'UNAUTHORIZED') {
    authStorage.removeToken();
    // Handle redirect to login
  }
  
  return {
    message: error?.message || 'An unexpected error occurred',
    code: error?.data?.code || 'UNKNOWN_ERROR',
  };
}; 