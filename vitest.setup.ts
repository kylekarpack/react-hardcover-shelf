import "@testing-library/jest-dom"; // needed for testing-library assertions
import { vi } from "vite-plus/test";

// Mock fetch
const fetch = vi.fn(() =>
  Promise.resolve({
    text: () => Promise.resolve([]),
  }),
);

vi.stubGlobal("fetch", fetch);

// Mock IntersectionObserver
// Note: the implementation must be a non-arrow function so the mock stays constructable
const IntersectionObserverMock = vi.fn(function () {
  return {
    disconnect: vi.fn(),
    observe: vi.fn(),
    takeRecords: vi.fn(),
    unobserve: vi.fn(),
  };
});

vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

// Mock crypto
const crypto = {
  randomUUID: vi.fn(),
};

vi.stubGlobal("crypto", crypto);
