import { useEffect, useState } from "react";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";

const defaultCenter = {
  lat: 15.5057,
  lng: 80.0499,
};

function NearbyPlaces({ userLocation, onPlacesFound }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !userLocation) {
      return;
    }

    let cancelled = false;

    const findNearbyPlaces = async () => {
      try {
        console.log("Searching near:", userLocation);

        const { Place } =
          await google.maps.importLibrary("places");

        const request = {
          fields: [
            "displayName",
            "location",
            "formattedAddress",
            "rating",
            "id",
          ],

          locationRestriction: {
            center: userLocation,
            radius: 5000,
          },

          includedTypes: [
            "non_profit_organization",
            "association_or_organization",
          ],

          maxResultCount: 20,

          rankPreference: "DISTANCE",
        };

        console.log("Nearby search request:", request);

        const { places = [] } =
          await Place.searchNearby(request);

        console.log(
          "Google Places results:",
          places
        );

        if (cancelled) {
          return;
        }

        const ngos = places
          .filter((place) => place.location)
          .map((place, index) => {
            const latitude =
              place.location.lat();

            const longitude =
              place.location.lng();

            return {
              id:
                place.id ||
                `google-place-${index}`,

              name:
                place.displayName ||
                "Unnamed Organization",

              location:
                place.formattedAddress ||
                "Address unavailable",

              latitude,
              longitude,

              rating:
                place.rating || 0,

              distance:
                calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  latitude,
                  longitude
                ),

              verified: false,

              acceptedFoodTypes: [
                "Food Donations",
              ],
            };
          });

        console.log(
          "FoodSaver NGO results:",
          ngos
        );

        onPlacesFound(ngos);

      } catch (error) {

        console.error(
          "❌ Nearby Places error:",
          error
        );

        if (!cancelled) {
          onPlacesFound([]);
        }
      }
    };

    findNearbyPlaces();

    return () => {
      cancelled = true;
    };

  }, [map, userLocation, onPlacesFound]);

  return null;
}


// ========================================
// DISTANCE CALCULATION
// ========================================

function calculateDistance(
  lat1,
  lon1,
  lat2,
  lon2
) {
  if (
    lat1 == null ||
    lon1 == null ||
    lat2 == null ||
    lon2 == null
  ) {
    return 0;
  }

  const R = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(
      (lat1 * Math.PI) / 180
    ) *
      Math.cos(
        (lat2 * Math.PI) / 180
      ) *
      Math.sin(dLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return Number(
    (R * c).toFixed(1)
  );
}


// ========================================
// MAP CONTENT
// ========================================

function MapContent({
  userLocation,
  ngos,
}) {
  const center =
    userLocation || defaultCenter;

  return (
    <Map
      defaultCenter={defaultCenter}
      center={center}
      defaultZoom={13}
      gestureHandling="greedy"
      disableDefaultUI={false}
      mapId="DEMO_MAP_ID"
    >

      {/* USER LOCATION */}

      {userLocation && (
        <AdvancedMarker
          position={userLocation}
          title="Your Location"
        >
          <Pin
            background="#2E7D32"
            borderColor="#194A19"
            glyphColor="#FFFFFF"
          />
        </AdvancedMarker>
      )}


      {/* NGO MARKERS */}

      {ngos.map((ngo) => {

        if (
          ngo.latitude == null ||
          ngo.longitude == null
        ) {
          return null;
        }

        return (
          <AdvancedMarker
            key={ngo.id}
            position={{
              lat: ngo.latitude,
              lng: ngo.longitude,
            }}
            title={ngo.name}
          >

            <Pin
              background="#66A84F"
              borderColor="#194A19"
              glyphColor="#FFFFFF"
            />

          </AdvancedMarker>
        );

      })}

    </Map>
  );
}


// ========================================
// MAIN NGO MAP
// ========================================

function NGOMap({
  userLocation,
  ngos = [],
  onPlacesFound,
}) {
  const [placesNGOs, setPlacesNGOs] =
    useState([]);

  const displayedNGOs =
    placesNGOs.length > 0
      ? placesNGOs
      : ngos;

  const handlePlacesFound = (results) => {

    console.log(
      "NGOMap received:",
      results
    );

    setPlacesNGOs(results);

    if (onPlacesFound) {
      onPlacesFound(results);
    }
  };

  return (
    <div className="ngo-map-wrapper">

      <APIProvider
        apiKey={
          import.meta.env
            .VITE_GOOGLE_MAPS_API_KEY
        }
        libraries={["places"]}
      >

        <NearbyPlaces
          userLocation={userLocation}
          onPlacesFound={
            handlePlacesFound
          }
        />

        <MapContent
          userLocation={userLocation}
          ngos={displayedNGOs}
        />

      </APIProvider>

    </div>
  );
}

export default NGOMap;