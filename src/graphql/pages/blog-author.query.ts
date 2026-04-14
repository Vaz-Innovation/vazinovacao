import { graphql } from "@/graphql/__gen__";

export const BlogAuthorPageOnQueryFragment = graphql(/* GraphQL */ `
  fragment BlogAuthorPage_onQuery on RootQuery {
    blogAuthor: users(first: 1, where: { nicename: $slug }) {
      nodes {
        ...BlogAuthorCard_AuthorFragment
      }
    }
    authorPosts: posts(
      first: $first
      after: $after
      where: {
        orderby: { field: DATE, order: DESC }
        authorName: $slug
        language: $language
      }
    ) {
      nodes {
        ...BlogPostCard_PostFragment
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);

export const BlogAuthorPageQuery = graphql(/* GraphQL */ `
  query BlogAuthorPage(
    $slug: String!
    $language: LanguageCodeFilterEnum = PT
    $first: Int = 11
    $after: String
  ) {
    ...BlogAuthorPage_onQuery
  }
`);

export const BlogAuthorSlugsQuery = graphql(/* GraphQL */ `
  query BlogAuthorSlugs(
    $first: Int = 100
    $after: String
  ) {
    users(first: $first, after: $after, where: { hasPublishedPosts: [POST] }) {
      nodes {
        slug
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);
