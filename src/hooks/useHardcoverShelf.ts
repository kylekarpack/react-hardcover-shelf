import { useEffect, useState } from "react";
import { BookGroup, Props } from "../types";
import { fetchAllBooks } from "../util";

const useHardcoverShelf = (props: Props) => {
  const { apiKey, apiUrl, userId, limit, order, search, shelf, sort } = props;
  const [books, setBooks] = useState<BookGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);

    try {
      setBooks(await fetchAllBooks(props));
    } catch (err: unknown) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, [apiKey, apiUrl, userId, limit, order, search, shelf, sort]);

  return { books, loading, error };
};

export default useHardcoverShelf;
