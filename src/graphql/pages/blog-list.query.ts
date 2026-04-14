import { graphql } from "@/graphql/__gen__";

export const BlogListOnQueryFragment = graphql(/* GraphQL */ `
  fragment BlogList_onQuery on RootQuery {
    categories(first: 100, where: { language: $language }) {
      nodes {
        ...BlogCategoryMenu_CategoryFragment
      }
    }
    blogPosts: posts(
      first: $first
      after: $after
      where: {
        orderby: { field: DATE, order: DESC }
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

export const BlogListPageQuery = graphql(/* GraphQL */ `
  query BlogListPage(
    $language: LanguageCodeFilterEnum = PT
    $first: Int = 11
    $after: String
  ) {
    ...BlogList_onQuery
  }
`);

export const BlogListPageInfoQuery = graphql(/* GraphQL */ `
  query BlogListPageInfo(
    $language: LanguageCodeFilterEnum = PT
    $first: Int = 11
    $after: String
  ) {
    posts(
      first: $first
      after: $after
      where: {
        orderby: { field: DATE, order: DESC }
        language: $language
      }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);
