import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AnalysisHistoryCard from "../components/AnalysisHistoryCard";
import { getAnalysisHistory } from "../services/aiAnalysisService";
import { FRESHNESS_STATES } from "../data/mockAnalysis";
import "../styles/analysis-history.css";

const AnalysisHistory = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [freshnessFilter, setFreshnessFilter] = useState("All");
  const [foodTypeFilter, setFoodTypeFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("recent");

  useEffect(() => {
    let isMounted = true;
    getAnalysisHistory().then((data) => {
      if (isMounted) {
        setRecords(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const foodTypes = useMemo(
    () => ["All", ...new Set(records.map((r) => r.foodType))],
    [records]
  );

  const filteredRecords = useMemo(() => {
    let list = [...records];

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter((r) => r.foodType.toLowerCase().includes(term));
    }
    if (freshnessFilter !== "All") {
      list = list.filter((r) => r.freshness === freshnessFilter);
    }
    if (foodTypeFilter !== "All") {
      list = list.filter((r) => r.foodType === foodTypeFilter);
    }

    list.sort((a, b) => {
      const dateA = new Date(a.analyzedAt).getTime();
      const dateB = new Date(b.analyzedAt).getTime();
      return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
    });

    return list;
  }, [records, searchTerm, freshnessFilter, foodTypeFilter, sortOrder]);

  const handleViewDetails = (id) => navigate(`/analysis/${id}`);

  return (
    <div className="ah-page">
      <header className="ah-page__header">
        <h1 className="ah-page__title">AI Analysis History</h1>
        <p className="ah-page__subtitle">Review past food analyses from FoodSaver AI.</p>
      </header>

      <div className="ah-controls">
        <input
          type="search"
          className="ah-controls__search"
          placeholder="Search by food name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="ah-controls__select"
          value={freshnessFilter}
          onChange={(e) => setFreshnessFilter(e.target.value)}
          aria-label="Filter by freshness"
        >
          <option value="All">All Freshness</option>
          {FRESHNESS_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        <select
          className="ah-controls__select"
          value={foodTypeFilter}
          onChange={(e) => setFoodTypeFilter(e.target.value)}
          aria-label="Filter by food type"
        >
          {foodTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          className="ah-controls__select"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          aria-label="Sort order"
        >
          <option value="recent">Most Recent</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {isLoading ? (
        <p className="ah-page__status">Loading history...</p>
      ) : filteredRecords.length === 0 ? (
        <div className="ah-empty">
          <p className="ah-empty__title">No analyses found</p>
          <p className="ah-empty__hint">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="ah-list">
          {filteredRecords.map((record) => (
            <AnalysisHistoryCard key={record.id} record={record} onViewDetails={handleViewDetails} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalysisHistory;
