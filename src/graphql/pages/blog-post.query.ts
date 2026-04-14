import { graphql } from "@/graphql/__gen__";

export const BlogPostOnQueryFragment = graphql(/* GraphQL */ `
  fragment BlogPost_onQuery on RootQuery {
    post(id: $slug, idType: SLUG) {
      ...BlogPostHeader_PostFragment
      content
      modified
      categories {
        nodes {
          ...TaxonomyChip_TermFragment
        }
      }
      tags {
        nodes {
          ...TaxonomyChip_TermFragment
        }
      }
    }
    relatedPosts: posts(
      first: 4
      where: {
        orderby: { field: DATE, order: DESC }
        language: $language
      }
    ) {
      nodes {
        ...BlogPostCard_PostFragment
      }
    }
  }
`);

export const BlogPostPageQuery = graphql(/* GraphQL */ `
  query BlogPostPage(
    $slug: ID!
    $language: LanguageCodeFilterEnum = PT
  ) {
    ...BlogPost_onQuery
  }
`);

export const BlogPostSlugsQuery = graphql(/* GraphQL */ `
  query BlogPostSlugs(
    $language: LanguageCodeFilterEnum = PT
    $first: Int = 100
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
