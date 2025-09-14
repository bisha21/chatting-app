import { useState, useEffect, DependencyList } from "react";
import axios, { type AxiosRequestConfig } from "axios";

// Types
interface QueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

type QueryKey = string;

export const useQuery = <T = any>(
  key: QueryKey,
  url: string,
  config: AxiosRequestConfig = {},
  dependencies: DependencyList = []
): QueryResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await axios<T>(url, config);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An unknown error occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const runFetch = async () => {
      try {
        setIsLoading(true);
        const response = await axios<T>(url, config);
        if (isMounted) {
          setData(response.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("An unknown error occurred"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    runFetch();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, isLoading, error, refetch: fetchData };
};
