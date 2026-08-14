import { useState } from "react";
import { useNavigate } from "react-router-dom";

import NGOMap from "../../components/ngo/NGOMap";
import NGOList from "../../components/ngo/NGOList";
import NGOSearch from "../../components/ngo/NGOSearch";


// ========================================
// FALLBACK NGO DATA
// ========================================

const dummyNGOs = [
  {
    id: 1,
    name: "Helping Hands",
    location: "Ongole",

    latitude: 15.5057,
    longitude: 80.0499,

    distance: 2.3,
    rating: 4.6,
    verified: true,

    acceptedFoodTypes: [
      "Rice",
      "Vegetables",
      "Fruits",
    ],
  },

  {
    id: 2,
    name: "Food For All",
    location: "Ongole",

    latitude: 15.5035,
    longitude: 80.0520,

    distance: 4.1,
    rating: 4.4,
    verified: true,

    acceptedFoodTypes: [
      "Cooked Food",
      "Bread",
      "Fruits",
    ],
  },

  {
    id: 3,
    name: "Care Foundation",
    location: "Ongole",

    latitude: 15.5090,
    longitude: 80.0470,

    distance: 5.7,
    rating: 4.2,
    verified: true,

    acceptedFoodTypes: [
      "Rice",
      "Dal",
      "Vegetables",
    ],
  },
];


// ========================================
// NGO FINDER
// ========================================

function NGOFinder() {

  const navigate = useNavigate();

  // User's GPS location
  const [userLocation, setUserLocation] =
    useState(null);

  // NGOs returned by Google Places
  const [nearbyNGOs, setNearbyNGOs] =
    useState([]);

  // Loading state
  const [loadingNGOs, setLoadingNGOs] =
    useState(false);

  // Search
  const [searchTerm, setSearchTerm] =
    useState("");


  // ========================================
  // DISPLAY DATA
  // ========================================

  const ngosToDisplay =
    nearbyNGOs.length > 0
      ? nearbyNGOs
      : dummyNGOs;


  // ========================================
  // SEARCH FILTER
  // ========================================

  const filteredNGOs =
    ngosToDisplay.filter((ngo) =>
      ngo.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );


  // ========================================
  // GOOGLE PLACES CALLBACK
  // ========================================

  const handlePlacesFound = (places) => {

    console.log(
      "NGOs received from Google:",
      places
    );

    setNearbyNGOs(places);

    // Google finished searching
    setLoadingNGOs(false);
  };


  // ========================================
  // VIEW NGO DETAILS
  // ========================================

  const handleViewDetails = (ngo) => {

    navigate("/ngos/details", {
      state: {
        ngo,
      },
    });

  };


  // ========================================
  // GET USER LOCATION
  // ========================================

  const handleUseLocation = () => {

    if (!navigator.geolocation) {

      alert(
        "Geolocation is not supported by your browser."
      );

      return;
    }


    // Start loading
    setLoadingNGOs(true);


    navigator.geolocation.getCurrentPosition(

      // SUCCESS
      (position) => {

        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };


        setUserLocation(location);


        console.log(
          "Latitude:",
          location.lat
        );

        console.log(
          "Longitude:",
          location.lng
        );


        alert(
          "Location detected successfully!"
        );

      },


      // ERROR
      (error) => {

        console.error(
          "Location error:",
          error
        );


        setLoadingNGOs(false);


        alert(
          "Unable to access your location. Please allow location permission."
        );

      }

    );

  };


  // ========================================
  // UI
  // ========================================

  return (

    <main className="ngo-finder">


      {/* ==================================
          HEADER
          ================================== */}

      <section className="ngo-header">

        <h1>
          Find Nearby NGOs
        </h1>

        <p>
          Find trusted organizations to donate
          your surplus food and make an impact.
        </p>

      </section>


      {/* ==================================
          LOCATION
          ================================== */}

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


      {/* ==================================
          GOOGLE MAP
          ================================== */}

      <NGOMap
        userLocation={userLocation}
        ngos={filteredNGOs}
        onPlacesFound={handlePlacesFound}
      />


      {/* ==================================
          SEARCH
          ================================== */}

      <NGOSearch
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
      />


      {/* ==================================
          NGO LIST
          ================================== */}

      <section className="ngo-section">

        <h2>
          Nearby NGOs
        </h2>


        {loadingNGOs ? (

          <p className="ngo-loading">
            🔍 Finding nearby organizations...
          </p>

        ) : filteredNGOs.length === 0 ? (

          <p className="ngo-empty">
            No nearby organizations found.
          </p>

        ) : (

          <NGOList
            ngos={filteredNGOs}
            onViewDetails={handleViewDetails}
          />

        )}

      </section>

    </main>
  );
}

export default NGOFinder;