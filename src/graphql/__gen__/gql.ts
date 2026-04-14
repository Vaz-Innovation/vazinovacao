/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  fragment BlogPostCard_PostFragment on Post {\n    id\n    title\n    slug\n    date\n    excerpt\n    featuredImage {\n      node {\n        sourceUrl\n        altText\n      }\n    }\n    tags {\n      nodes {\n        ...TaxonomyChip_TermFragment\n      }\n    }\n  }\n": typeof types.BlogPostCard_PostFragmentFragmentDoc,
    "\n  fragment BlogPostHeader_PostFragment on Post {\n    id\n    slug\n    title\n    excerpt\n    date\n    featuredImage {\n      node {\n        sourceUrl\n        altText\n      }\n    }\n    categories {\n      nodes {\n        ...TaxonomyChip_TermFragment\n      }\n    }\n    tags {\n      nodes {\n        ...TaxonomyChip_TermFragment\n      }\n    }\n  }\n": typeof types.BlogPostHeader_PostFragmentFragmentDoc,
    "\n  fragment TaxonomyChip_TermFragment on TermNode {\n    id\n    name\n    slug\n  }\n": typeof types.TaxonomyChip_TermFragmentFragmentDoc,
    "\n  fragment BlogList_onQuery on RootQuery {\n    categories(first: 100) {\n      nodes {\n        ...TaxonomyChip_TermFragment\n      }\n    }\n    blogPosts: posts(\n      first: $first\n      after: $after\n      where: {\n        orderby: { field: DATE, order: DESC }\n        language: $language\n      }\n    ) {\n      nodes {\n        ...BlogPostCard_PostFragment\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": typeof types.BlogList_OnQueryFragmentDoc,
    "\n  query BlogListPage(\n    $language: LanguageCodeFilterEnum = PT\n    $first: Int = 11\n    $after: String\n  ) {\n    ...BlogList_onQuery\n  }\n": typeof types.BlogListPageDocument,
    "\n  query BlogListPageInfo(\n    $language: LanguageCodeFilterEnum = PT\n    $first: Int = 11\n    $after: String\n  ) {\n    posts(\n      first: $first\n      after: $after\n      where: {\n        orderby: { field: DATE, order: DESC }\n        language: $language\n      }\n    ) {\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": typeof types.BlogListPageInfoDocument,
    "\n  fragment BlogPost_onQuery on RootQuery {\n    post(id: $slug, idType: SLUG) {\n      ...BlogPostHeader_PostFragment\n      content\n      modified\n      categories {\n        nodes {\n          ...TaxonomyChip_TermFragment\n        }\n      }\n      tags {\n        nodes {\n          ...TaxonomyChip_TermFragment\n        }\n      }\n    }\n    relatedPosts: posts(\n      first: 4\n      where: {\n        orderby: { field: DATE, order: DESC }\n        language: $language\n      }\n    ) {\n      nodes {\n        ...BlogPostCard_PostFragment\n      }\n    }\n  }\n": typeof types.BlogPost_OnQueryFragmentDoc,
    "\n  query BlogPostPage(\n    $slug: ID!\n    $language: LanguageCodeFilterEnum = PT\n  ) {\n    ...BlogPost_onQuery\n  }\n": typeof types.BlogPostPageDocument,
    "\n  query BlogPostSlugs(\n    $language: LanguageCodeFilterEnum = PT\n    $first: Int = 100\n    $after: String\n  ) {\n    posts(\n      first: $first\n      after: $after\n      where: {\n        orderby: { field: DATE, order: DESC }\n        language: $language\n      }\n    ) {\n      nodes {\n        slug\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": typeof types.BlogPostSlugsDocument,
};
const documents: Documents = {
    "\n  fragment BlogPostCard_PostFragment on Post {\n    id\n    title\n    slug\n    date\n    excerpt\n    featuredImage {\n      node {\n        sourceUrl\n        altText\n      }\n    }\n    tags {\n      nodes {\n        ...TaxonomyChip_TermFragment\n      }\n    }\n  }\n": types.BlogPostCard_PostFragmentFragmentDoc,
    "\n  fragment BlogPostHeader_PostFragment on Post {\n    id\n    slug\n    title\n    excerpt\n    date\n    featuredImage {\n      node {\n        sourceUrl\n        altText\n      }\n    }\n    categories {\n      nodes {\n        ...TaxonomyChip_TermFragment\n      }\n    }\n    tags {\n      nodes {\n        ...TaxonomyChip_TermFragment\n      }\n    }\n  }\n": types.BlogPostHeader_PostFragmentFragmentDoc,
    "\n  fragment TaxonomyChip_TermFragment on TermNode {\n    id\n    name\n    slug\n  }\n": types.TaxonomyChip_TermFragmentFragmentDoc,
    "\n  fragment BlogList_onQuery on RootQuery {\n    categories(first: 100) {\n      nodes {\n        ...TaxonomyChip_TermFragment\n      }\n    }\n    blogPosts: posts(\n      first: $first\n      after: $after\n      where: {\n        orderby: { field: DATE, order: DESC }\n        language: $language\n      }\n    ) {\n      nodes {\n        ...BlogPostCard_PostFragment\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": types.BlogList_OnQueryFragmentDoc,
    "\n  query BlogListPage(\n    $language: LanguageCodeFilterEnum = PT\n    $first: Int = 11\n    $after: String\n  ) {\n    ...BlogList_onQuery\n  }\n": types.BlogListPageDocument,
    "\n  query BlogListPageInfo(\n    $language: LanguageCodeFilterEnum = PT\n    $first: Int = 11\n    $after: String\n  ) {\n    posts(\n      first: $first\n      after: $after\n      where: {\n        orderby: { field: DATE, order: DESC }\n        language: $language\n      }\n    ) {\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": types.BlogListPageInfoDocument,
    "\n  fragment BlogPost_onQuery on RootQuery {\n    post(id: $slug, idType: SLUG) {\n      ...BlogPostHeader_PostFragment\n      content\n      modified\n      categories {\n        nodes {\n          ...TaxonomyChip_TermFragment\n        }\n      }\n      tags {\n        nodes {\n          ...TaxonomyChip_TermFragment\n        }\n      }\n    }\n    relatedPosts: posts(\n      first: 4\n      where: {\n        orderby: { field: DATE, order: DESC }\n        language: $language\n      }\n    ) {\n      nodes {\n        ...BlogPostCard_PostFragment\n      }\n    }\n  }\n": types.BlogPost_OnQueryFragmentDoc,
    "\n  query BlogPostPage(\n    $slug: ID!\n    $language: LanguageCodeFilterEnum = PT\n  ) {\n    ...BlogPost_onQuery\n  }\n": types.BlogPostPageDocument,
    "\n  query BlogPostSlugs(\n    $language: LanguageCodeFilterEnum = PT\n    $first: Int = 100\n    $after: String\n  ) {\n    posts(\n      first: $first\n      after: $after\n      where: {\n        orderby: { field: DATE, order: DESC }\n        language: $language\n      }\n    ) {\n      nodes {\n        slug\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": types.BlogPostSlugsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment BlogPostCard_PostFragment on Post {\n    id\n    title\n    slug\n    date\n    excerpt\n    featuredImage {\n      node {\n        sourceUrl\n        altText\n      }\n    }\n    tags {\n      nodes {\n        ...TaxonomyChip_TermFragment\n      }\n    }\n  }\n"): typeof import('./graphql').BlogPostCard_PostFragmentFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment BlogPostHeader_PostFragment on Post {\n    id\n    slug\n    title\n    excerpt\n    date\n    featuredImage {\n      node {\n        sourceUrl\n        altText\n      }\n    }\n    categories {\n      nodes {\n        ...TaxonomyChip_TermFragment\n      }\n    }\n    tags {\n      nodes {\n        ...TaxonomyChip_TermFragment\n      }\n    }\n  }\n"): typeof import('./graphql').BlogPostHeader_PostFragmentFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment TaxonomyChip_TermFragment on TermNode {\n    id\n    name\n    slug\n  }\n"): typeof import('./graphql').TaxonomyChip_TermFragmentFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment BlogList_onQuery on RootQuery {\n    categories(first: 100) {\n      nodes {\n        ...TaxonomyChip_TermFragment\n      }\n    }\n    blogPosts: posts(\n      first: $first\n      after: $after\n      where: {\n        orderby: { field: DATE, order: DESC }\n        language: $language\n      }\n    ) {\n      nodes {\n        ...BlogPostCard_PostFragment\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"): typeof import('./graphql').BlogList_OnQueryFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query BlogListPage(\n    $language: LanguageCodeFilterEnum = PT\n    $first: Int = 11\n    $after: String\n  ) {\n    ...BlogList_onQuery\n  }\n"): typeof import('./graphql').BlogListPageDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query BlogListPageInfo(\n    $language: LanguageCodeFilterEnum = PT\n    $first: Int = 11\n    $after: String\n  ) {\n    posts(\n      first: $first\n      after: $after\n      where: {\n        orderby: { field: DATE, order: DESC }\n        language: $language\n      }\n    ) {\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"): typeof import('./graphql').BlogListPageInfoDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment BlogPost_onQuery on RootQuery {\n    post(id: $slug, idType: SLUG) {\n      ...BlogPostHeader_PostFragment\n      content\n      modified\n      categories {\n        nodes {\n          ...TaxonomyChip_TermFragment\n        }\n      }\n      tags {\n        nodes {\n          ...TaxonomyChip_TermFragment\n        }\n      }\n    }\n    relatedPosts: posts(\n      first: 4\n      where: {\n        orderby: { field: DATE, order: DESC }\n        language: $language\n      }\n    ) {\n      nodes {\n        ...BlogPostCard_PostFragment\n      }\n    }\n  }\n"): typeof import('./graphql').BlogPost_OnQueryFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query BlogPostPage(\n    $slug: ID!\n    $language: LanguageCodeFilterEnum = PT\n  ) {\n    ...BlogPost_onQuery\n  }\n"): typeof import('./graphql').BlogPostPageDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query BlogPostSlugs(\n    $language: LanguageCodeFilterEnum = PT\n    $first: Int = 100\n    $after: String\n  ) {\n    posts(\n      first: $first\n      after: $after\n      where: {\n        orderby: { field: DATE, order: DESC }\n        language: $language\n      }\n    ) {\n      nodes {\n        slug\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"): typeof import('./graphql').BlogPostSlugsDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
