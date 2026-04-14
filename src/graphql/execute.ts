import type { TypedDocumentString } from "./__gen__/graphql";

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

type RawVariables = Record<string, unknown> | null | undefined;

async function runGraphQLRequest<TResult>(
  query: string,
  variables?: RawVariables,
): Promise<TResult> {
  const isServer = typeof window === "undefined";
  const endpoint = isServer
    ? process.env.WORDPRESS_API_URL
    : "/api/wordpress/graphql";

  if (!endpoint) {
    throw new Error("WORDPRESS_API_URL is not set for server-side execution");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/graphql-response+json",
  };

  if (isServer && process.env.WORDPRESS_API_KEY) {
    headers.Authorization = `Basic ${process.env.WORDPRESS_API_KEY}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL HTTP Error: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as GraphQLResponse<TResult>;

  if (json.errors?.length) {
    throw new Error(json.errors.map((error) => error.message).join(", "));
  }

  if (!json.data) {
    throw new Error("GraphQL response missing data field");
  }

  return json.data;
}

export async function execute<
  TResult,
  TVariables extends Record<string, unknown> = Record<string, never>,
>(
  query: TypedDocumentString<TResult, TVariables>,
  variables?: TVariables,
): Promise<TResult> {
  return runGraphQLRequest<TResult>(
    query.toString(),
    variables,
  );
}

export async function executeRaw<TResult>(
  query: string,
  variables?: RawVariables,
): Promise<TResult> {
  return runGraphQLRequest<TResult>(query, variables);
}
