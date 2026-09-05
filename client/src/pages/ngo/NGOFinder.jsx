import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { rolePrefix } from "../../utils/roles";

const API_URL = "http://localhost:5000/api/ngos";

export default function NGOFinder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const base = rolePrefix(user?.role);
  const [ngos, setNgos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [capacityFilter, setCapacityFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch real NGOs from MongoDB through Express
  useEffect(() => {
    let ignore = false;

    const fetchNGOs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const result = await response.json();

        if (!ignore) {
          setNgos(result.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch NGOs:", err);

        if (!ignore) {
          setError(
            "Unable to load NGOs. Make sure the backend server is running."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchNGOs();

    return () => {
      ignore = true;
    };
  }, []);

  // Search + filters
  const filteredNGOs = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return ngos.filter((ngo) => {
      const matchesSearch =
        !term ||
        ngo.name?.toLowerCase().includes(term) ||
        ngo.address?.toLowerCase().includes(term) ||
        ngo.city?.toLowerCase().includes(term) ||
        ngo.state?.toLowerCase().includes(term) ||
        ngo.acceptedFood?.some((food) =>
          food.toLowerCase().includes(term)
        );

      const matchesStatus =
        statusFilter === "All" || ngo.status === statusFilter;

      const matchesCapacity =
        capacityFilter === "All" || ngo.capacity === capacityFilter;

      return matchesSearch && matchesStatus && matchesCapacity;
    });
  }, [ngos, searchTerm, statusFilter, capacityFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setCapacityFilter("All");
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Find NGOs</h1>
          <p style={styles.subtitle}>
            Find nearby organizations that accept food donations.
          </p>
        </div>

        <div style={styles.count}>
          {filteredNGOs.length} NGO
          {filteredNGOs.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Search + Filters */}
      <div style={styles.filterBox}>
        <input
          type="text"
          placeholder="Search NGOs, city, address or food type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.select}
        >
          <option value="All">All Status</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
        </select>

        <select
          value={capacityFilter}
          onChange={(e) => setCapacityFilter(e.target.value)}
          style={styles.select}
        >
          <option value="All">All Capacity</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <button onClick={clearFilters} style={styles.clearButton}>
          Clear
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={styles.message}>
          <div style={styles.spinner}></div>
          <p>Loading NGOs from MongoDB...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={styles.errorBox}>
          <strong>Unable to load NGOs</strong>
          <p>{error}</p>

          <button
            onClick={() => window.location.reload()}
            style={styles.retryButton}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filteredNGOs.length === 0 && (
        <div style={styles.message}>
          <h3>No NGOs found</h3>
          <p>Try changing your search or filters.</p>
        </div>
      )}

      {/* NGO Cards */}
      {!loading && !error && filteredNGOs.length > 0 && (
        <div style={styles.grid}>
          {filteredNGOs.map((ngo) => (
            <div key={ngo._id} style={styles.card}>
              {/* Card Header */}
              <div style={styles.cardHeader}>
                <div style={styles.avatar}>
                  {ngo.shortName ||
                    ngo.name
                      ?.split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)}
                </div>

                <div style={styles.cardTitle}>
                  <h2>{ngo.name}</h2>

                  <div style={styles.rating}>
                    ⭐ {ngo.rating ?? 0}
                    <span style={styles.reviews}>
                      ({ngo.reviews ?? 0} reviews)
                    </span>
                  </div>
                </div>

                <span
                  style={{
                    ...styles.status,
                    ...(ngo.status === "Open"
                      ? styles.open
                      : styles.closed),
                  }}
                >
                  {ngo.status}
                </span>
              </div>

              {/* Address */}
              <div style={styles.info}>
                <span>📍</span>
                <span>{ngo.address}</span>
              </div>

              {/* Phone */}
              <div style={styles.info}>
                <span>📞</span>
                <span>{ngo.phone}</span>
              </div>

              {/* Distance */}
              <div style={styles.info}>
                <span>📏</span>
                <span>{ngo.distance ?? 0} km away</span>
              </div>

              {/* Capacity */}
              <div style={styles.capacityRow}>
                <strong>Capacity:</strong>

                <span
                  style={{
                    ...styles.capacity,
                    ...(ngo.capacity === "High"
                      ? styles.highCapacity
                      : ngo.capacity === "Medium"
                      ? styles.mediumCapacity
                      : styles.lowCapacity),
                  }}
                >
                  {ngo.capacity}
                </span>
              </div>

              {/* Accepted Food */}
              <div style={styles.foodSection}>
                <strong>Accepts:</strong>

                <div style={styles.tags}>
                  {ngo.acceptedFood?.map((food) => (
                    <span key={food} style={styles.tag}>
                      {food}
                    </span>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div style={styles.actions}>
                <button
                  style={styles.mapButton}
                  onClick={() => {
                    if (
                      ngo.latitude !== undefined &&
                      ngo.longitude !== undefined
                    ) {
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${ngo.latitude},${ngo.longitude}`,
                        "_blank"
                      );
                    }
                  }}
                >
                  View on Map
                </button>

                <button
                  style={styles.pickupButton}
                  onClick={() => {
                    navigate(`${base}/pickups/request`, { state: { ngo } });
                  }}
                >
                  Schedule Pickup
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- */
/* Styles                         */
/* ----------------------------- */

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px",
    background: "#F8FAF8",
    fontFamily: "Poppins, Arial, sans-serif",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    gap: "20px",
  },

  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: 700,
    color: "#2E7D32",
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#666",
    fontSize: "15px",
  },

  count: {
    background: "#E8F5E9",
    color: "#2E7D32",
    padding: "10px 16px",
    borderRadius: "20px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  filterBox: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    padding: "18px",
    background: "#FFFFFF",
    borderRadius: "14px",
    marginBottom: "24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },

  searchInput: {
    flex: "1 1 280px",
    minWidth: "240px",
    padding: "12px 14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },

  select: {
    padding: "12px 14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    background: "#fff",
    fontSize: "14px",
    cursor: "pointer",
  },

  clearButton: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#eeeeee",
    cursor: "pointer",
    fontWeight: 600,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },

  card: {
    background: "#FFFFFF",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 3px 14px rgba(0,0,0,0.07)",
    border: "1px solid #E8EEE8",
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "18px",
  },

  avatar: {
    width: "48px",
    height: "48px",
    minWidth: "48px",
    borderRadius: "50%",
    background: "#E8F5E9",
    color: "#2E7D32",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
  },

  cardTitle: {
    flex: 1,
    minWidth: 0,
  },

  cardTitleH2: {
    margin: 0,
  },

  rating: {
    marginTop: "5px",
    fontSize: "14px",
    fontWeight: 600,
  },

  reviews: {
    marginLeft: "5px",
    color: "#777",
    fontWeight: 400,
  },

  status: {
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600,
  },

  open: {
    background: "#E8F5E9",
    color: "#2E7D32",
  },

  closed: {
    background: "#FFEBEE",
    color: "#C62828",
  },

  info: {
    display: "flex",
    gap: "9px",
    marginBottom: "10px",
    color: "#555",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  capacityRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "14px",
    marginBottom: "14px",
    fontSize: "14px",
  },

  capacity: {
    padding: "4px 9px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
  },

  highCapacity: {
    background: "#E8F5E9",
    color: "#2E7D32",
  },

  mediumCapacity: {
    background: "#FFF8E1",
    color: "#F57F17",
  },

  lowCapacity: {
    background: "#FFEBEE",
    color: "#C62828",
  },

  foodSection: {
    marginBottom: "18px",
    fontSize: "14px",
  },

  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
    marginTop: "8px",
  },

  tag: {
    background: "#F1F8F1",
    color: "#2E7D32",
    padding: "5px 9px",
    borderRadius: "6px",
    fontSize: "12px",
  },

  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "18px",
  },

  mapButton: {
    flex: 1,
    padding: "11px",
    border: "1px solid #2E7D32",
    background: "#FFFFFF",
    color: "#2E7D32",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
  },

  pickupButton: {
    flex: 1,
    padding: "11px",
    border: "none",
    background: "#2E7D32",
    color: "#FFFFFF",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
  },

  message: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#FFFFFF",
    borderRadius: "14px",
    color: "#666",
  },

  errorBox: {
    padding: "25px",
    background: "#FFEBEE",
    color: "#B71C1C",
    borderRadius: "12px",
    textAlign: "center",
  },

  retryButton: {
    marginTop: "10px",
    padding: "10px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#C62828",
    color: "#FFFFFF",
    cursor: "pointer",
  },

  spinner: {
    width: "30px",
    height: "30px",
    border: "4px solid #E8F5E9",
    borderTop: "4px solid #2E7D32",
    borderRadius: "50%",
    margin: "0 auto 15px",
  },
};