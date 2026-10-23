/**
 * Generic search + dropdown-filter bar reused by UserManagement,
 * NGOManagement, and DonationManagement.
 *
 * @param {{
 *   searchValue: string,
 *   onSearchChange: (value: string) => void,
 *   searchPlaceholder?: string,
 *   filters?: Array<{ key: string, label: string, value: string, options: Array<{value:string,label:string}>, onChange: (value:string) => void }>,
 *   dateValue?: string,
 *   onDateChange?: (value: string) => void,
 * }} props
 */
const FilterPanel = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  filters = [],
  dateValue,
  onDateChange,
}) => {
  return (
    <div className="admin-filter-panel">
      <input
        type="text"
        className="admin-filter-panel__search"
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      {filters.map((filter) => (
        <select
          key={filter.key}
          className="admin-filter-panel__select"
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          aria-label={filter.label}
        >
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}

      {onDateChange && (
        <input
          type="date"
          className="admin-filter-panel__date"
          value={dateValue || ""}
          onChange={(e) => onDateChange(e.target.value)}
          aria-label="Filter by date"
        />
      )}
    </div>
  );
};

export default FilterPanel;
