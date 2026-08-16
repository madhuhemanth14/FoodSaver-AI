import React, { useEffect, useState } from "react";
import "../../styles/ngo-map.css";
import NGOMap from "../../components/ngo/NGOMap";
import { getNGOs } from "../../services/ngoService";

function NGOMapPage() {
  const [ngos, setNgos] = useState([]);
  const [selectedNGO, setSelectedNGO] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadNGOs = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getNGOs();

        if (!cancelled) {
          setNgos(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load NGOs:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load NGOs from the server."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadNGOs();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="ngo-map-page">
      <div className="ngo-map-page-container">

        {/* Header */}
        <div className="ngo-map-page-header">
          <div>
            <h1>Nearby Organisations</h1>

            <p>
              Find food donation organisations near your location.
            </p>
          </div>

          <div className="ngo-map-page-badge">
            <span></span>
            {loading ? "Loading..." : `${ngos.length} Organisations`}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="ngo-map-page-error">
            {error}
          </div>
        )}

        {/* Map Card */}
        <section className="ngo-map-card">

          <div className="ngo-map-card-header">
            <div>
              <h2>NGO Map</h2>

              <p>
                Green markers represent organisations available
                for food donations.
              </p>
            </div>

            <div className="ngo-map-legend">
              <span className="ngo-map-green-dot"></span>
              NGO
            </div>
          </div>

          {loading ? (
            <div className="ngo-map-loading">
              <p>Loading NGOs from MongoDB...</p>
            </div>
          ) : ngos.length === 0 ? (
            <div className="ngo-map-loading">
              <p>No NGOs found.</p>
            </div>
          ) : (
            <NGOMap
              ngos={ngos}
              selectedNGO={selectedNGO}
              onSelectNGO={setSelectedNGO}
            />
          )}

        </section>

      </div>
    </main>
  );
}

export default NGOMapPage;