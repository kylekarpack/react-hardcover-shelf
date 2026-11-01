import { act, render, waitFor } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vite-plus/test";
import HardcoverShelf from "./HardcoverShelf";

const respondWith = (data: unknown) => {
  return vi.fn(async () => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
  }));
};

const sampleRow = (index: number) => {
  return {
    rating: 4,
    date_added: "2022-05-10",
    last_read_date: "2022-06-01",
    user_book_reads: [{ started_at: "2022-01-01", finished_at: "2022-06-01" }],
    book: {
      id: index + 1,
      slug: `test-book-${index + 1}`,
      title: `Test Book ${index + 1}`,
      image: { url: `https://example.com/cover-${index + 1}.jpg` },
      contributions: [{ author: { name: "Test Author" } }],
    },
  };
};

describe("HardcoverShelf component", () => {
  afterEach(() => {
    // Restore the fetch stubbed below so later tests get the setup baseline again
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve({ text: () => Promise.resolve([]) })),
    );
  });

  it("renders without crashing", async () => {
    await act(async () => {
      const shelf = render(<HardcoverShelf />);
      expect(shelf.container).toBeInTheDocument();
    });
  });

  it("works with an api key", async () => {
    vi.stubGlobal("fetch", respondWith({ data: { me: { user_books: [sampleRow(0)] } } }));

    const shelf = await act(async () => {
      return render(<HardcoverShelf apiKey="my-api-key" />);
    });

    await waitFor(() => expect(shelf.container.querySelector(".rhs-group")).not.toBeNull());
  });

  it("passes props properly", async () => {
    vi.stubGlobal("fetch", respondWith({ data: { me: { user_books: [sampleRow(1)] } } }));

    const shelf = await act(async () => {
      return render(
        <HardcoverShelf
          apiKey="my-api-key"
          limit={15}
          shelf="currently-reading"
          sort="date_added"
        />,
      );
    });

    await waitFor(() => expect(shelf.container.querySelector(".rhs-group")).not.toBeNull());
  });

  it("shows an error message when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 401 })),
    );

    const shelf = await act(async () => {
      return render(<HardcoverShelf apiKey="my-api-key" />);
    });

    await waitFor(() =>
      expect(shelf.container.textContent).toContain(
        "Sorry, we couldn't load books right now: Request to the Hardcover API failed with status 401",
      ),
    );
  });
});
