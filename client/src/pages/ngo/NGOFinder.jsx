import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/ngo-finder.css";
import NGO_DATA from "../../data/mockNGOs";

const FOOD_TYPES = [
  "Cooked Meals",
  "Vegetables",
  "Fruits",
  "Bakery",
  "Dairy",
  "Packaged Food",
];

function NGOFinder() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [distance, setDistance] = useState("Any distance");
  const [rating, setRating] = useState("Any rating");
  const [capacity, setCapacity] = useState("Any capacity");
  const [selectedFood, setSelectedFood] = useState([]);
  const [openNow, setOpenNow] = useState(false);
  const [acceptingOnly, setAcceptingOnly] = useState(false);

  const filteredNGOs = useMemo(() => {
    return NGO_DATA.filter((ngo) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        ngo.name.toLowerCase().includes(searchText) ||
        ngo.address.toLowerCase().includes(searchText) ||
        ngo.acceptedFood.some((food) =>
          food.toLowerCase().includes(searchText)
        );

      const matchesDistance =
        distance === "Any distance" ||
        (distance === "Within 2 km" && ngo.distance <= 2) ||
        (distance === "Within 5 km" && ngo.distance <= 5) ||
        (distance === "Within 10 km" && ngo.distance <= 10);

      const matchesRating =
        rating === "Any rating" ||
        (rating === "4.5+" && ngo.rating >= 4.5) ||
        (rating === "4.0+" && ngo.rating >= 4.0);

      const matchesCapacity =
        capacity === "Any capacity" || ngo.capacity === capacity;

      const matchesFood =
        selectedFood.length === 0 ||
        selectedFood.some((food) => ngo.acceptedFood.includes(food));

      const matchesOpen = !openNow || ngo.status === "Open";

      const matchesAccepting =
        !acceptingOnly || ngo.acceptedFood.length > 0;

      return (
        matchesSearch &&
        matchesDistance &&
        matchesRating &&
        matchesCapacity &&
        matchesFood &&
        matchesOpen &&
        matchesAccepting
      );
    });
  }, [
    search,
    distance,
    rating,
    capacity,
    selectedFood,
    openNow,
    acceptingOnly,
  ]);

  const toggleFood = (food) => {
    setSelectedFood((current) =>
      current.includes(food)
        ? current.filter((item) => item !== food)
        : [...current, food]
    );
  };

  const resetFilters = () => {
    setSearch("");
    setDistance("Any distance");
    setRating("Any rating");
    setCapacity("Any capacity");
    setSelectedFood([]);
    setOpenNow(false);
    setAcceptingOnly(false);
  };

  const handleViewDetails = (ngo) => {
    navigate(`/ngos/${ngo.id}`);
  };

  const handleSchedule = (ngo) => {
    navigate(`/pickup/request?ngoId=${ngo.id}`);
  };

  return (
    <main className="ngo-page">
      <div className="ngo-container">

        {/* HEADER */}
        <section className="ngo-page-header">
          <h1>Nearby NGOs</h1>

          <p>
            Find NGOs and shelters ready to receive surplus food near you.
          </p>
        </section>

        {/* SEARCH */}
        <section className="ngo-search-box">
          <span className="ngo-search-icon">🔍</span>

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, area, city, or food type..."
          />
        </section>

        {/* FILTERS */}
        <section className="ngo-filter-panel">

          <div className="ngo-filter-group">
            <label>Distance</label>

            <select
              value={distance}
              onChange={(event) => setDistance(event.target.value)}
            >
              <option>Any distance</option>
              <option>Within 2 km</option>
              <option>Within 5 km</option>
              <option>Within 10 km</option>
            </select>
          </div>

          <div className="ngo-filter-group">
            <label>Rating</label>

            <select
              value={rating}
              onChange={(event) => setRating(event.target.value)}
            >
              <option>Any rating</option>
              <option>4.5+</option>
              <option>4.0+</option>
            </select>
          </div>

          <div className="ngo-filter-group">
            <label>Capacity</label>

            <select
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
            >
              <option>Any capacity</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          <div className="ngo-food-filter">
            <label>Food type accepted</label>

            <div className="ngo-food-options">
              {FOOD_TYPES.map((food) => (
                <button
                  type="button"
                  key={food}
                  className={`ngo-food-chip ${
                    selectedFood.includes(food) ? "selected" : ""
                  }`}
                  onClick={() => toggleFood(food)}
                >
                  {food}
                </button>
              ))}
            </div>
          </div>

          <div className="ngo-checkboxes">

            <label>
              <input
                type="checkbox"
                checked={openNow}
                onChange={(event) =>
                  setOpenNow(event.target.checked)
                }
              />
              <span>Open now</span>
            </label>

            <label>
              <input
                type="checkbox"
                checked={acceptingOnly}
                onChange={(event) =>
                  setAcceptingOnly(event.target.checked)
                }
              />
              <span>Accepting only</span>
            </label>

          </div>

          <button
            type="button"
            className="ngo-reset-button"
            onClick={resetFilters}
          >
            Reset
          </button>

        </section>

        {/* RESULTS */}
        <div className="ngo-results-header">
          <span>{filteredNGOs.length} NGOs found</span>

          <button
            type="button"
            className="ngo-map-link"
            onClick={() => navigate("/map")}
          >
            🗺️ View Map
          </button>
        </div>
        

    

        {/* NGO GRID */}
        {filteredNGOs.length > 0 ? (
          <section className="ngo-grid">

            {filteredNGOs.map((ngo) => (
              <article className="ngo-card" key={ngo.id}>

                <div className="ngo-card-top">

                  <div className="ngo-avatar">
                    {ngo.shortName}
                  </div>

                  <div className="ngo-title-section">
                    <h2>{ngo.name}</h2>

                    <div className="ngo-rating">
                      <span className="ngo-star">★</span>

                      <span>{ngo.rating}</span>

                      <span className="ngo-review-count">
                        ({ngo.reviews})
                      </span>
                    </div>
                  </div>

                  <span
                    className={`ngo-open-status ${
                      ngo.status === "Open" ? "open" : "closed"
                    }`}
                  >
                    {ngo.status}
                  </span>

                </div>

                <div className="ngo-address">
                  <span>📍</span>
                  <span>{ngo.address}</span>
                </div>

                <div className="ngo-contact-row">

                  <span>
                    🚚 {ngo.distance} km away
                  </span>

                  <span>
                    📞 {ngo.phone}
                  </span>

                </div>

                <div className="ngo-accepting-section">

                  <span className="ngo-accepting-label">
                    Accepting Food
                  </span>

                  <div className="ngo-card-foods">
                    {ngo.acceptedFood.map((food) => (
                      <span
                        className="ngo-card-food-chip"
                        key={food}
                      >
                        {food}
                      </span>
                    ))}
                  </div>

                </div>

                <div className="ngo-card-actions">

                  <button
                    type="button"
                    className="ngo-details-button"
                    onClick={() => handleViewDetails(ngo)}
                  >
                    View Details
                  </button>

                  <button
                    type="button"
                    className="ngo-schedule-button"
                    onClick={() => handleSchedule(ngo)}
                  >
                    Schedule Pickup
                  </button>

                </div>

              </article>
            ))}

          </section>
        ) : (
          <div className="ngo-empty-state">

            <div className="ngo-empty-icon">
              🔍
            </div>

            <h2>No NGOs found</h2>

            <p>
              Try changing your search or filters to find nearby NGOs.
            </p>

            <button
              type="button"
              onClick={resetFilters}
            >
              Clear Filters
            </button>

          </div>
        )}

      </div>
    </main>
  );
}

export default NGOFinder;