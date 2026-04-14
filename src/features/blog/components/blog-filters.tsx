import { Search, Tag } from "lucide-react";

interface BlogFiltersProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  selectedTag: string;
  onSelectedTagChange: (value: string) => void;
  tags: string[];
}

export function BlogFilters({
  searchQuery,
  onSearchQueryChange,
  selectedTag,
  onSelectedTagChange,
  tags,
}: BlogFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar artigos..."
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
      </div>

      {tags.length > 0 && (
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            className="pl-9 pr-8 py-2.5 rounded-lg border border-border bg-card text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            value={selectedTag}
            onChange={(event) => onSelectedTagChange(event.target.value)}
          >
            <option value="">Todas as tags</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
