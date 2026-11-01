import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { ALL_GROUP_TITLE, fetchAllBooks } from "./api";
import { HARDCOVER_API_URL } from "./graphql";

type FetchOptions = { body?: string; headers?: { [key: string]: string } };

// The url and body of the most recent request sent through respondWith
let lastUrl: string | null = null;
let lastOptions: FetchOptions | undefined;

// Mock out fetch with a canned GraphQL response
const respondWith = (data: unknown) => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, options?: FetchOptions) => {
      lastUrl = url;
      lastOptions = options;
      return {
        ok: true,
        status: 200,
        json: () => Promise.resolve(data),
      };
    }),
  );
};

afterEach(() => {
  vi.unstubAllGlobals();
  lastUrl = null;
  lastOptions = undefined;
});

const sampleRow = (index: number, overrides: Record<string, unknown> = {}) => {
  return {
    rating: 4,
    date_added: "2022-05-10",
    last_read_date: "2022-06-01",
    user_book_reads: [{ started_at: "2022-01-01", finished_at: "2022-06-01" }],
    book: {
      id: index + 1,
      slug: `test-book-${index + 1}`,
      title: `Test Book ${index + 1}`,
      pages: 123,
      rating: 3.9,
      release_year: 2019,
      image: { url: `https://example.com/cover-${index + 1}.jpg` },
      contributions: [{ author: { name: "Test Author" } }],
    },
    ...overrides,
  };
};

const sampleRows = (count: number) => Array.from({ length: count }, (_, index) => sampleRow(index));

describe("api", () => {
  it("fetches books with a single query", async () => {
    respondWith({ data: { me: { user_books: sampleRows(5) } } });

    const [bookGroup] = await fetchAllBooks({ apiKey: "my-api-key" });

    expect(lastUrl).toBe(HARDCOVER_API_URL);
    expect(bookGroup.title).toBe(ALL_GROUP_TITLE);
    expect(bookGroup.books.length).toBe(5);
  });

  it("sends the apiKey as an authorization header", async () => {
    respondWith({ data: { me: { user_books: [] } } });

    await fetchAllBooks({ apiKey: "abc123" });

    expect(lastOptions?.headers).toEqual({
      "content-type": "application/json",
      authorization: "Bearer abc123",
    });
  });

  it("uses the apiUrl prop when provided", async () => {
    respondWith({ data: { user_books: [] } });

    await fetchAllBooks({ apiUrl: "https://proxy.example.com/graphql" });

    expect(lastUrl).toBe("https://proxy.example.com/graphql");
  });

  it("maps books into the display shape", async () => {
    respondWith({ data: { me: { user_books: [sampleRow(0)] } } });

    const [bookGroup] = await fetchAllBooks({ apiKey: "my-api-key" });
    const [book] = bookGroup.books;

    expect(book).toEqual({
      id: "1",
      title: "Test Book 1",
      subtitle: "",
      description: "",
      author: "Test Author",
      authors: [{ name: "Test Author" }],
      imageUrl: "https://example.com/cover-1.jpg",
      link: "https://hardcover.app/books/test-book-1",
      rating: 4,
      avgRating: 3.9,
      pages: 123,
      releaseYear: 2019,
      dateRead: new Date("2022-06-01"),
      dateAdded: new Date("2022-05-10"),
    });
  });

  it("fetches grouped books", async () => {
    respondWith({
      data: {
        me: {
          user_books: [
            sampleRow(0, { book: { ...sampleRow(0).book, title: "2022 Book" } }),
            sampleRow(1, {
              book: { ...sampleRow(1).book, title: "2021 Book" },
              date_added: "2021-03-01",
              last_read_date: "",
              user_book_reads: [],
            }),
          ],
        },
      },
    });

    const groups = await fetchAllBooks({ apiKey: "my-api-key", groupBy: "year" });

    expect(groups.length).toBe(2);
    expect(groups[0]?.title).toBe("2022");
    expect(groups[1]?.title).toBe("2021");
  });

  it("fetches with limit", async () => {
    respondWith({ data: { me: { user_books: sampleRows(30) } } });

    const [bookGroup] = await fetchAllBooks({ apiKey: "my-api-key", limit: 5 });

    expect(bookGroup.books.length).toBe(5);
  });

  it("passes the limit to the query", async () => {
    respondWith({ data: { me: { user_books: sampleRows(30) } } });

    await fetchAllBooks({ apiKey: "my-api-key", limit: 12 });

    expect(lastOptions?.body).toContain("limit: 12");
  });

  it("fetches with filter", async () => {
    respondWith({ data: { me: { user_books: sampleRows(5) } } });

    const [bookGroup] = await fetchAllBooks({
      apiKey: "my-api-key",
      filter: (book) => book.title === "Test Book 3",
    });

    expect(bookGroup.books.length).toBe(1);
    expect(bookGroup.books[0]?.title).toBe("Test Book 3");
  });

  it("fetches with search", async () => {
    respondWith({
      data: {
        me: {
          user_books: [
            ...sampleRows(5),
            sampleRow(30, {
              book: {
                ...sampleRow(30).book,
                title: "Special: The Club",
                contributions: [{ author: { name: "Someone Else" } }],
              },
            }),
          ],
        },
      },
    });

    const [bookGroup] = await fetchAllBooks({ apiKey: "my-api-key", search: "The Club" });

    expect(bookGroup.books.length).toBe(1);
    expect(bookGroup.books[0]?.title).toBe("Special: The Club");
  });

  it("sorts the books", async () => {
    respondWith({
      data: {
        me: {
          user_books: [
            sampleRow(0, { book: { ...sampleRow(0).book, title: "Zulu Book" } }),
            sampleRow(1, { book: { ...sampleRow(1).book, title: "Alpha Book" } }),
            sampleRow(2, { book: { ...sampleRow(2).book, title: "Mid Book" } }),
          ],
        },
      },
    });

    const ascending = await fetchAllBooks({ apiKey: "my-api-key", sort: "title", order: "a" });
    expect(ascending[0].books[0]?.title).toBe("Alpha Book");

    const descending = await fetchAllBooks({ apiKey: "my-api-key", sort: "title", order: "d" });
    expect(descending[0].books[0]?.title).toBe("Zulu Book");
  });

  it("queries the given user id instead of the key owner", async () => {
    respondWith({ data: { user_books: sampleRows(2) } });

    const [bookGroup] = await fetchAllBooks({ apiKey: "my-api-key", userId: "123" });

    expect(bookGroup.books.length).toBe(2);
    expect(lastOptions?.body).toContain("user_id: { _eq: 123 }");
    expect(lastOptions?.body).not.toContain("me {");
  });

  it("queries by username in a single request", async () => {
    respondWith({ data: { user_books: sampleRows(2) } });

    const [bookGroup] = await fetchAllBooks({ apiKey: "my-api-key", userId: "kylekarpack" });

    expect(bookGroup.books.length).toBe(2);
    expect(lastOptions?.body).toContain('user: { username: { _eq: \\"kylekarpack\\" } }');
    expect(lastOptions?.body).not.toContain("me {");
  });

  it("defaults to the currently-reading shelf", async () => {
    respondWith({ data: { me: { user_books: [] } } });

    await fetchAllBooks({ apiKey: "my-api-key", shelf: "currently-reading" });

    expect(lastOptions?.body).toContain("status_id: { _eq: 2 }");
  });

  it("errors when there is no apiKey or apiUrl", async () => {
    await expect(fetchAllBooks({ userId: "123" })).rejects.toThrow(/apiKey/);
  });

  it("errors on unsupported shelf names", async () => {
    await expect(
      fetchAllBooks({
        apiKey: "key",
        shelf: "currently-reading-in-paris" as never,
      }),
    ).rejects.toThrow(/Unsupported shelf/);
  });

  it("errors on GraphQL errors", async () => {
    respondWith({ errors: [{ message: "GraphQL went wrong" }] });

    await expect(fetchAllBooks({ apiKey: "my-api-key" })).rejects.toThrow("GraphQL went wrong");
  });

  it("errors on http failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 401 })),
    );

    await expect(fetchAllBooks({ apiKey: "my-api-key" })).rejects.toThrow("status 401");
  });
});
