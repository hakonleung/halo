export type FilterOption = { label: string; value: string };

export type FilterConfig =
  | { type: 'select'; id: string; label: string; options: FilterOption[] }
  | { type: 'search'; id: string; label: string };

export type FilterGroup = {
  id: string;
  label: string;
  filters: FilterConfig[];
};
