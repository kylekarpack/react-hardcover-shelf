/** The default GraphQL endpoint used by Hardcover */
export const HARDCOVER_API_URL = "https://api.hardcover.app/v1/graphql";

/** Options for sending a query to the Hardcover API */
export type RunQueryOptions = {
  /** The GraphQL query to send */
  query: string;
  /**
   * An API key generated from a Hardcover account's settings page.
   * A "Bearer" prefix is optional and added automatically.
   */
  apiKey?: string;
  /**
   * An alternative endpoint to send the query to; useful when running a
   * proxy that keeps the API key server-side.
   */
  apiUrl?: string;
};

type GraphQLResponse<Data> = {
  data?: Data;
  errors?: { message: string }[];
};

/** Send a GraphQL query to the Hardcover API and return its data */
export const runQuery = async <Data>(options: RunQueryOptions): Promise<Data> => {
  const response = await window.fetch(options.apiUrl || HARDCOVER_API_URL, {
    method: "POST",
    body: JSON.stringify({ query: options.query }),
    headers: {
      "content-type": "application/json",
      ...(options.apiKey
        ? {
            // Accept the API key with or without a "Bearer" prefix
            authorization: /^Bearer /i.test(options.apiKey)
              ? options.apiKey
              : `Bearer ${options.apiKey}`,
          }
        : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request to the Hardcover API failed with status ${response.status}`);
  }

  const body: GraphQLResponse<Data> = await response.json();

  if (body.errors?.length) {
    const messages = body.errors.map((error) => error.message).join(", ");
    throw new Error(`Request to the Hardcover API failed: ${messages}`);
  }

  return body.data as Data;
};
