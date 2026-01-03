import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

/**
 * Creates a new QueryClient instance for server-side use.
 * Wrapped in React's cache() to ensure a single instance per request.
 */
export const getQueryClient = cache(() => new QueryClient());
