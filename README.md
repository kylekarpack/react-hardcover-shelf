# react-hardcover-shelf

This React component allows you to display a [Hardcover](https://hardcover.app) bookshelf in a React application, powered by the official Hardcover GraphQL API.

## Demo

[Live Demo](https://kylekarpack.github.io/react-hardcover-shelf)

Preview

![Example image](/sample/sample.png)

## Installation

```
pnpm install react-hardcover-shelf
```

(or with a package manager of your choice)

## Usage

Create a scoped API key from your Hardcover account ([Account → API](https://hardcover.app/account/api/keys/new?scope=read:library:public)), then pass it to the component:

```jsx
import React from "react";
import HardcoverShelf from "react-hardcover-shelf";

export default function App() {
  return <HardcoverShelf apiKey="YOUR_API_KEY" userId="kylekarpack" />;
}
```

When no `userId` is supplied, the shelf of the API key's owner is displayed. `userId` accepts either a numeric user ID or a username.

### API key scopes

Hardcover lets you pick exactly which scopes an API key grants. **`read:library:public` is the only scope the widget needs** for the default usage of displaying the shelf of the API key's owner:

[Generate a scoped API key →](https://hardcover.app/account/api/keys/new?scope=read:library:public)

| Scope                 | What it grants                                                  |
| --------------------- | --------------------------------------------------------------- |
| `read:library:public` | Your public shelf entries (the books the widget displays)       |
| `read:me:content`     | Your public profile (id, username, name, avatar)                |
| `read:catalog`        | Hardcover's public book catalog (covers, authors, descriptions) |

The additional scopes (`read:me:content` and `read:catalog`) are only necessary if you want to view someone else's public bookshelves, i.e. when passing the `userId` prop with another Hardcover user. The link below pre-selects everything:

[Generate an API key for public shelves →](https://hardcover.app/account/api/keys/new?scope=read:library:public+read:me:content+read:catalog)

With these scopes, an exposed key cannot modify your library, cannot read private or followers-only entries, and cannot see your email. Do not select any write scopes.

> **Security note:** a scoped key kept in the browser is still visible to visitors and usable for rate-limit-burning reads. That is fine for personal sites and blogs. If you need stronger isolation, you can run a small proxy that attaches the `Authorization` header server-side and pass its URL via the `apiUrl` option instead.

## Customization

| Option         | Type     | Description                                                                                                                                                                                         | Default                  |
| -------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| apiKey         | string   | An API key from a Hardcover account's settings page; a "Bearer" prefix is optional. Required unless apiUrl is provided. See [API key scopes](#api-key-scopes) for the recommended read-only scopes. | -                        |
| apiUrl         | string   | An alternative endpoint to send queries to; useful for proxies that keep the API key server-side                                                                                                    | Hardcover API            |
| userId         | string   | The Hardcover user ID or username whose shelf to fetch                                                                                                                                              | The owner of the API key |
| shelf          | string   | The shelf from which to fetch books ("read", "currently-reading", or "to-read")                                                                                                                     | read                     |
| sort           | string   | The field by which to sort the results returned (title, author, rating, avg_rating, date_read, date_added, or pages)                                                                                | date_read                |
| order          | string   | The direction in which to sort the results ("a" for ascending or "d" for descending)                                                                                                                | d                        |
| limit          | number   | The maximum number of books to be returned                                                                                                                                                          | 10                       |
| width          | number   | Minimum width allowed for each book                                                                                                                                                                 | 100                      |
| search         | string   | Filter fetched books by title and author                                                                                                                                                            | ""                       |
| groupBy        | string   | Group books by a field (e.g. "year")                                                                                                                                                                | -                        |
| displayOptions | object   | Options for hiding book details, background images, and grid spacing                                                                                                                                | -                        |
| filter         | function | A filter function to include only some of the fetched books                                                                                                                                         | -                        |

## Development

This project uses [Vite+](https://viteplus.dev).

- `pnpm dev` to run the demo page dev server
- `pnpm storybook` to launch storybook for testing
- `pnpm test` to run the test suite
- `pnpm check` to format-check, lint, and type-check everything

## Contribution

Please feel free to open issues or pull requests and I will review as promptly as I am able.
