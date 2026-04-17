import React, {
  createContext,
  useContext,
  useRef,
  type ReactNode,
} from 'react';
import { FetchKitConfig } from '../types';
import { configureAxios } from '../utils/axiosFetcher';

interface FetchKitContextValue {
  config: FetchKitConfig;
}

const FetchKitContext = createContext<FetchKitContextValue>({ config: {} });

export function FetchKitProvider({
  children,
  config = {},
}: {
  children: ReactNode;
  config?: FetchKitConfig;
}) {
  const configured = useRef(false);
  if (!configured.current) {
    configureAxios({ baseUrl: config.baseUrl, headers: config.headers });
    configured.current = true;
  }

  return (
    <FetchKitContext.Provider value={{ config }}>
      {children}
    </FetchKitContext.Provider>
  );
}

export function useFetchKitConfig(): FetchKitConfig {
  return useContext(FetchKitContext).config;
}
