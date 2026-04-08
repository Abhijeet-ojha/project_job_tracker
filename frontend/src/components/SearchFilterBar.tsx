import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ColumnId, COLUMNS } from "@/types/application";

interface SearchFilterBarProps {
  searchQuery: string;
  statusFilter: ColumnId | "all";
  resultCount: number;
  onSearchChange: (q: string) => void;
  onStatusChange: (s: ColumnId | "all") => void;
  onClearFilters: () => void;
}

const SearchFilterBar = ({
  searchQuery,
  statusFilter,
  resultCount,
  onSearchChange,
  onStatusChange,
  onClearFilters,
}: SearchFilterBarProps) => {
  const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== "all";

  return (
    <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-6 py-2.5">
        {/* Search input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="search-applications"
            placeholder="Search company or role…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-sm border-border/60 bg-card rounded-lg focus-visible:ring-1 focus-visible:ring-primary"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <div className="flex gap-1">
            <button
              onClick={() => onStatusChange("all")}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                statusFilter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-container text-muted-foreground hover:bg-surface-container-high"
              }`}
            >
              All
            </button>
            {COLUMNS.map((col) => (
              <button
                key={col.id}
                onClick={() => onStatusChange(col.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                  statusFilter === col.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-surface-container text-muted-foreground hover:bg-surface-container-high"
                }`}
              >
                {col.title}
              </button>
            ))}
          </div>
        </div>

        {/* Result count + clear */}
        <div className="ml-auto flex items-center gap-2">
          {hasActiveFilters && (
            <>
              <span className="text-[11px] text-muted-foreground">
                {resultCount} result{resultCount !== 1 ? "s" : ""}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;
