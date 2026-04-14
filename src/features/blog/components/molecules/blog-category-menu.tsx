import {
  type FragmentType,
  graphql,
  useFragment as readFragment,
} from "@/graphql/__gen__";
import { CategoryFilterItem } from "@/features/blog/components/atoms/category-filter-item";

export const BlogCategoryMenuCategoryFragment = graphql(/* GraphQL */ `
  fragment BlogCategoryMenu_CategoryFragment on Category {
    id
    slug
    name
    count
  }
`);

interface BlogCategoryMenuProps {
  categories: Array<FragmentType<typeof BlogCategoryMenuCategoryFragment>>;
  selectedCategorySlug: string;
  onSelectedCategorySlugChange: (slug: string) => void;
}

export function BlogCategoryMenu({
  categories,
  selectedCategorySlug,
  onSelectedCategorySlugChange,
}: BlogCategoryMenuProps) {
  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label="Filtrar por categoria">
      <CategoryFilterItem
        label="Todas"
        active={!selectedCategorySlug}
        onClick={() => onSelectedCategorySlugChange("")}
      />

      {categories.map((category) => {
        const categoryData = readFragment(BlogCategoryMenuCategoryFragment, category);

        if (!categoryData.slug || !categoryData.name) {
          return null;
        }

        return (
          <CategoryFilterItem
            key={categoryData.id}
            label={categoryData.name}
            count={categoryData.count}
            active={selectedCategorySlug === categoryData.slug}
            onClick={() => onSelectedCategorySlugChange(categoryData.slug || "")}
          />
        );
      })}
    </nav>
  );
}
