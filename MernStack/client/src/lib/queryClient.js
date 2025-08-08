import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

export class ApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

export async function apiRequest(method, url, data = null) {
  const config = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data && !(data instanceof FormData)) {
    config.body = JSON.stringify(data);
  } else if (data instanceof FormData) {
    delete config.headers['Content-Type'];
    config.body = data;
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (e) {
      errorMessage = response.statusText || errorMessage;
    }
    throw new ApiError(errorMessage, response.status, response);
  }

  return response;
}

export function getQueryFn(options = {}) {
  return async ({ queryKey }) => {
    const url = queryKey[0];
    try {
      const response = await apiRequest('GET', url);
      return response.json();
    } catch (error) {
      if (options.on401 === 'returnNull' && error.status === 401) {
        return null;
      }
      throw error;
    }
  };
}