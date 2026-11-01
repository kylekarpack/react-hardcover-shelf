import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import useHardcoverShelf from "./useHardcoverShelf";

const fetchStub = (data: unknown) => {
  return vi.fn(async () => ({ ok: true, json: () => Promise.resolve(data) }));
};

describe("shelf hook", () => {
  afterEach(() => {
    // Restore the fetch stubbed below so later tests get the setup baseline again
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ text: () => Promise.resolve([]) })));
  });

  it("handles loading state", async () => {
    const fetchFn = fetchStub({ data: { me: { user_books: [] } } });
    vi.stubGlobal("fetch", fetchFn);

    const { result } = renderHook(() => useHardcoverShelf({ apiKey: "my-api-key" }));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.books).toEqual([{ title: "All", books: [] }]);
  });

  it("handles errors", async () => {
    const fetchFn = vi.fn(async () => {
      throw "some error message";
    });
    vi.stubGlobal("fetch", fetchFn);

    const { result } = renderHook(() => useHardcoverShelf({ apiKey: "my-api-key" }));

    expect(result.current.error).toBeNull();
    await waitFor(() => expect(result.current.error).toBe("some error message"));
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});
