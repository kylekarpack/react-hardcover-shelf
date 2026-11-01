import { act, fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";
import Book from "./Book";
import { Book as BookType } from "../types";

describe("book component", () => {
  it("renders without crashing", () => {
    const book = render(<Book book={null as unknown as BookType} />);
    expect(book.container).toBeInTheDocument();
  });

  it("renders image", () => {
    const data: BookType = { id: "1", title: "test", imageUrl: "test.jpg" };
    const book = render(<Book book={data} />);
    act(() => {
      expect(book.getByAltText("test")).toBeInTheDocument();
    });
  });

  it("renders a placeholder", async () => {
    const data: BookType = { title: "Test", id: "1", imageUrl: "fail.jpg" };
    const screen = render(<Book book={data} />);
    const img = screen.getByAltText("Test");
    fireEvent.error(img);
    expect(img).not.toBeInTheDocument();
  });
});
