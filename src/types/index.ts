import React from 'react';

export interface FetchKitConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
  defaultCacheTime?: number;
  onError?: (error: FetchError) => void;
  devMode?: boolean;
}

export interface FetchError {
  message: string;
  status?: number;
  data?: unknown;
}

export interface FetchOptions<T = unknown> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  body?: unknown;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: FetchError) => void;
  transform?: (data: unknown) => T;
  retry?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheTime?: number;
}

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: FetchError | null;
  status: 'idle' | 'loading' | 'success' | 'error';
}

export interface MutationToast {
  success?: string;
  error?: string;
  loading?: string;
}

export interface MutationOptions<TData = unknown, TVariables = unknown> {
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: FetchError) => void;
  toast?: MutationToast;
  invalidates?: string[];
}

export interface MutationState<TData> {
  data: TData | null;
  loading: boolean;
  error: FetchError | null;
  status: 'idle' | 'loading' | 'success' | 'error';
}

export interface RealtimeOptions {
  every?: number;
  paused?: boolean;
}

export interface RealtimeState<T> {
  data: T | null;
  loading: boolean;
  error: FetchError | null;
  isPolling: boolean;
  stop: () => void;
  resume: () => void;
}

export interface PaginatedFetchOptions {
  pageSize?: number;
  params?: Record<string, unknown>;
  pageParam?: string;
  limitParam?: string;
  useOffset?: boolean;
}

export interface PaginatedState<T> {
  data: T[] | null;
  loading: boolean;
  error: FetchError | null;
  page: number;
  totalPages: number;
  total: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (p: number) => void;
  refetch: () => void;
}

export interface InfiniteFetchOptions<T = unknown> {
  pageSize?: number;
  getNextPageParam?: (lastPage: unknown) => unknown;
  dataKey?: string;
  params?: Record<string, unknown>;
}

export interface InfiniteState<T> {
  data: T[];
  loading: boolean;
  error: FetchError | null;
  loadMore: () => void;
  hasMore: boolean;
  isFetchingMore: boolean;
  refetch: () => void;
}

export interface TabConfig {
  key: string;
  url: string;
  label: string;
  params?: Record<string, unknown>;
}

export interface TabFetchOptions<T = unknown> {
  tabs: TabConfig[];
  defaultTab?: string;
  cacheEachTab?: boolean;
}

export interface TabFetchState<T> {
  data: T | null;
  loading: boolean;
  error: FetchError | null;
  activeTab: string;
  setTab: (key: string) => void;
  refetch: () => void;
}

export interface DebouncedFetchOptions {
  params?: Record<string, unknown>;
  delay?: number;
  minLength?: number;
  enabled?: boolean;
}

export interface DebouncedFetchState<T> {
  data: T | null;
  loading: boolean;
  error: FetchError | null;
  isDebouncing: boolean;
}

// ─── UI Types ────────────────────────────────────────────────────────────────

export interface LoaderProps {
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'ring';
  className?: string;
}

export interface SkeletonProps {
  width?: string;
  height?: string;
  variant?: 'text' | 'circle' | 'rect' | 'card';
  color?: string;
  highlightColor?: string;
  borderRadius?: string;
  count?: number;
  className?: string;
}

export interface ToastOptions {
  duration?: number;
  color?: string;
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'loading';
  message: string;
  duration?: number;
  color?: string;
}

export interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
  maxToasts?: number;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}
