import {
  mutationOptions as buildMutationOptions,
  queryOptions as buildQueryOptions,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

import type { TypedDocumentString } from "./__gen__/graphql";
import { execute } from "./execute";

const normalizeQueryKey = (query: string): string => {
  return String(query).replace(/\s+/g, " ").trim();
};

type QueryOptionsInput<TResult, TVariables> = (TVariables extends Record<
  string,
  never
>
  ? {
      input?: never;
    }
  : {
      input: TVariables;
    }) &
  Omit<UseQueryOptions<TResult, Error, TResult>, "queryKey" | "queryFn">;

export function gqlQueryOptions<TResult, TVariables extends Record<string, unknown>>(
  query: TypedDocumentString<TResult, TVariables>,
  options?: QueryOptionsInput<TResult, TVariables>,
) {
  type OptionsType = { input?: TVariables } & Record<string, unknown>;
  const { input: params, ...queryOptions } = (options ?? {}) as OptionsType;

  const queryKey = ["graph", normalizeQueryKey(query.toString()), params ?? {}] as const;

  return buildQueryOptions<TResult, Error, TResult>({
    queryKey,
    queryFn: async () => execute(query, params as TVariables | undefined),
    ...queryOptions,
  });
}

export function gqlMutationOptions<TResult, TVariables extends Record<string, unknown>>(
  query: TypedDocumentString<TResult, TVariables>,
  options?: Omit<UseMutationOptions<TResult, Error, TVariables>, "mutationFn">,
) {
  const mutationKey = ["graph", normalizeQueryKey(query.toString())] as const;

  return buildMutationOptions<TResult, Error, TVariables>({
    mutationKey,
    mutationFn: async (variables) => execute(query, variables as TVariables),
    ...options,
  });
}
