import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { FetchError } from '../types';

let axiosInstance: AxiosInstance = axios.create();

export function configureAxios(options: {
  baseUrl?: string;
  headers?: Record<string, string>;
}): void {
  axiosInstance = axios.create({
    baseURL: options.baseUrl,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}

export async function axiosFetcher<T>(
  url: string,
  options: AxiosRequestConfig & { signal?: AbortSignal }
): Promise<T> {
  try {
    const response = await axiosInstance.request<T>({
      url,
      ...options,
    });
    return response.data;
  } catch (err) {
    const axiosErr = err as AxiosError;
    const fetchError: FetchError = {
      message:
        (axiosErr.response?.data as { message?: string })?.message ??
        axiosErr.message ??
        'An error occurred',
      status: axiosErr.response?.status,
      data: axiosErr.response?.data,
    };
    throw fetchError;
  }
}

export { axiosInstance };
