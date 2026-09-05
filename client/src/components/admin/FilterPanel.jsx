import { useState } from "react";
import { Search, Filter } from "lucide-react";
import "./FilterPanel.css";

export default function FilterPanel({ filters = [], onFilter, searchPlaceholder = "Search..." }) {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});

  const handleSearch = (val) => {
    setSearch(val);
    onFilter?.({ ...activeFilters, search: val });
  };

  const handleFilterChange = (key, val) => {
    const updated = { ...activeFilters, [key]: val };
    setActiveFilters(updated);
    onFilter?.({ ...updated, search });
  };

  return (
    <div className="filter-panel">
      <div className="filter-panel__search">
        <Search size={16} />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      <div className="filter-panel__filters">
        {filters.map((f) => (
          <div key={f.key} className="filter-panel__select-wrap">
            <Filter size={14} />
            <select
              value={activeFilters[f.key] || ""}
              onChange={(e) => handleFilterChange(f.key, e.target.value)}
            >
              <option value="">{f.label}</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
