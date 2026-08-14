import { useState } from "react";
import { useNavigate } from "react-router-dom";

import NGOList from "../../components/ngo/NGOList";
import NGOSearch from "../../components/ngo/NGOSearch";

const dummyNGOs = [
  {
    id: 1,
    name: "Helping Hands",
    location: "Ongole",
    distance: 2.3,
    rating: 4.6,
    verified: true,
    acceptedFoodTypes: [
      "Rice",
      "Vegetables",
      "Fruits"
    ]
  },

  {
    id: 2,
    name: "Food For All",
    location: "Ongole",
    distance: 4.1,
    rating: 4.4,
    verified: true,
    acceptedFoodTypes: [
      "Cooked Food",
      "Bread",
      "Fruits"
    ]
  },

  {
    id: 3,
    name: "Care Foundation",
    location: "Ongole",
    distance: 5.7,
    rating: 4.2,
    verified: true,
    acceptedFoodTypes: [
      "Rice",
      "Dal",
      "Vegetables"
    ]
  }
];

function NGOFinder() {

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");

  const filteredNGOs = dummyNGOs.filter((ngo) =>
    ngo.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (ngo) => {
    navigate("/ngos/details", {
      state: { ngo }
    });
  };

  const handleUseLocation = () => {

    if (!navigator.geolocation) {

      alert(
        "Geolocation is not supported by your browser."
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(

      (position) => {

        console.log(
          "Latitude:",
          position.coords.latitude
        );

        console.log(
          "Longitude:",
          position.coords.longitude
        );

        alert(
          "Location detected successfully!"
        );
      },

      () => {

        alert(
          "Unable to access your location."
        );

      }
    );
  };

  return (

    <main className="ngo-finder">

      <section className="ngo-header">

        <h1>
          Find Nearby NGOs
        </h1>

        <p>
          Find trusted organizations to donate
          your surplus food and make an impact.
        </p>

      </section>

      <section className="location-section">

        <p>
          📍 Your Location
        </p>

        <button
          className="location-btn"
          onClick={handleUseLocation}
        >
          Use My Location
        </button>

      </section>

      <NGOSearch
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
      />

      <section className="ngo-section">

        <h2>
          Nearby NGOs
        </h2>

        <NGOList
          ngos={filteredNGOs}
          onViewDetails={handleViewDetails}
        />

      </section>

    </main>
  );
}

export default NGOFinder;