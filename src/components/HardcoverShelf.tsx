import { FunctionComponent } from "react";
import useHardcoverShelf from "../hooks/useHardcoverShelf";
import { Props } from "../types";
import { ALL_GROUP_TITLE } from "../util";
import BookList from "./BookList";
import styles from "./HardcoverShelf.module.css";
import Loader from "./Loader";

/** Display a Hardcover bookshelf component */
const HardcoverShelf: FunctionComponent<Props> = (props) => {
  const { books, loading, error } = useHardcoverShelf(props);

  return (
    <div className="rhs-shelf">
      {loading ? (
        <Loader />
      ) : (
        <div>
          {books.map((el) => {
            return (
              <div key={el.title} className={`rhs-group ${styles.group}`}>
                {el.title !== ALL_GROUP_TITLE && (
                  <div className={`rhs-group-title ${styles.groupTitle}`}>
                    {el.title}{" "}
                    <small>
                      ({el.books.length} {el.books.length === 1 ? "book" : "books"})
                    </small>
                  </div>
                )}
                <BookList books={el.books} options={props} />
              </div>
            );
          })}
        </div>
      )}

      {error && <div>Sorry, we couldn't load books right now: {error.message}</div>}
    </div>
  );
};

export default HardcoverShelf;
