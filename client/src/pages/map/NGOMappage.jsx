import React, { useState } from "react";
import "../../styles/ngo-map-page.css";
import NGOMap from "../../components/ngo/NGOMap";
import NGO_DATA from "../../data/mockNGOs";

function NGOMapPage() {
  const [selectedNGO, setSelectedNGO] = useState(null);

  return (
    <main className="ngo-map-page">
      <div className="ngo-map-page-container">

        <div className="ngo-map-page-header">
          <div>
            <h1>Nearby Organisations</h1>

            <p>
              Find food donation organisations near your location.
            </p>
          </div>

          <div className="ngo-map-page-badge">
            <span></span>
            {NGO_DATA.length} Organisations
          </div>
        </div>

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

          <NGOMap
            ngos={NGO_DATA}
            selectedNGO={selectedNGO}
            onSelectNGO={setSelectedNGO}
          />

        </section>

      </div>
    </main>
  );
}

export default NGOMapPage;