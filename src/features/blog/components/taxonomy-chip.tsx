import { type FragmentType, graphql, useFragment } from "@/graphql/__gen__";

export const TaxonomyChipFragment = graphql(/* GraphQL */ `
  fragment TaxonomyChip_TermFragment on TermNode {
    id
    name
    slug
  }
`);

interface TaxonomyChipProps {
  term: FragmentType<typeof TaxonomyChipFragment>;
}

export function TaxonomyChip({ term }: TaxonomyChipProps) {
  const termData = useFragment(TaxonomyChipFragment, term);

  return (
    <span className="text-xs border border-foreground/10 px-3 py-1 text-muted-foreground">
      {termData.name}
    </span>
  );
}
