import { useEffect, useRef, useState } from "react";
import "../../styles/ngo-map.css";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let googleMapsScriptPromise = null;

/**
 * Loads the Google Maps JS SDK exactly once per page, regardless of how
 * many NGOMap instances mount. Resolves with `window.google`.
 */
function loadGoogleMaps() {
  if (window.google?.maps) return Promise.resolve(window.google);
  if (googleMapsScriptPromise) return googleMapsScriptPromise;

  googleMapsScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=marker`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error("Failed to load Google Maps script."));
    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
}

/**
 * NGOMap
 *
 * Renders NGO locations (and, if available, the donor's current location)
 * on a Google Map. Falls back to a friendly message instead of crashing
 * when VITE_GOOGLE_MAPS_API_KEY is missing or the script fails to load.
 *
 * Props:
 *  - ngos: Array<{ id, name, latitude, longitude, address }>
 *  - userLocation: { latitude, longitude } | null
 *  - selectedNGO: object | null
 *  - onNGOSelect: (ngo) => void
 */
export default function NGOMap({ ngos = [], userLocation, selectedNGO, onNGOSelect }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const [status, setStatus] = useState(GOOGLE_MAPS_API_KEY ? "loading" : "no-key");

  // Initialize the map once.
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setStatus("no-key");
      return;
    }

    let cancelled = false;

    loadGoogleMaps()
      .then((google) => {
        if (cancelled || !mapContainerRef.current) return;

        const center = userLocation
          ? { lat: userLocation.latitude, lng: userLocation.longitude }
          : ngos[0]
          ? { lat: ngos[0].latitude, lng: ngos[0].longitude }
          : { lat: 20.5937, lng: 78.9629 }; // India, sensible default

        mapRef.current = new google.maps.Map(mapContainerRef.current, {
          center,
          zoom: userLocation ? 12 : 5,
          disableDefaultUI: false,
          fullscreenControl: false,
          streetViewControl: false,
          mapId: "FOODSAVER_NGO_MAP",
        });

        infoWindowRef.current = new google.maps.InfoWindow();
        setStatus("ready");
      })
      .catch(() => setStatus("error"));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw markers whenever the NGO list, user location, or selection changes.
  useEffect(() => {
    if (status !== "ready" || !mapRef.current || !window.google) return;
    const google = window.google;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    if (userLocation) {
      const donorMarker = new google.maps.Marker({
        position: { lat: userLocation.latitude, lng: userLocation.longitude },
        map: mapRef.current,
        title: "Your location",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#2E7D32",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });
      markersRef.current.push(donorMarker);
    }

    ngos.forEach((ngo) => {
      if (typeof ngo.latitude !== "number" || typeof ngo.longitude !== "number") return;

      const isSelected = selectedNGO?._id === ngo._id;
      const marker = new google.maps.Marker({
        position: { lat: ngo.latitude, lng: ngo.longitude },
        map: mapRef.current,
        title: ngo.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 11 : 8,
          fillColor: isSelected ? "#66BB6A" : "#2E7D32",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      marker.addListener("click", () => {
        onNGOSelect?.(ngo);
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(
            `<div class="ngo-map__info-window"><strong>${ngo.name}</strong>${
              ngo.address ? ngo.address : ""
            }</div>`
          );
          infoWindowRef.current.open(mapRef.current, marker);
        }
      });

      markersRef.current.push(marker);
    });
  }, [status, ngos, userLocation, selectedNGO, onNGOSelect]);

  // Pan to the selected NGO.
  useEffect(() => {
    if (status !== "ready" || !mapRef.current || !selectedNGO) return;
    mapRef.current.panTo({ lat: selectedNGO.latitude, lng: selectedNGO.longitude });
    mapRef.current.setZoom(13);
  }, [status, selectedNGO]);

  if (status === "no-key") {
    return (
      <div className="ngo-map">
        <div className="ngo-map__fallback">
          <span className="ngo-map__fallback-icon" role="img" aria-label="Map unavailable">
            🗺️
          </span>
          <p className="ngo-map__fallback-title">Map isn't configured yet</p>
          <p className="ngo-map__fallback-text">
            Add a Google Maps API key to <code>VITE_GOOGLE_MAPS_API_KEY</code> in your
            <code>.env</code> file to see NGOs plotted on the map.
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="ngo-map">
        <div className="ngo-map__fallback">
          <span className="ngo-map__fallback-icon" role="img" aria-label="Map error">
            ⚠️
          </span>
          <p className="ngo-map__fallback-title">Map couldn't load</p>
          <p className="ngo-map__fallback-text">
            Please check your internet connection or API key restrictions and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ngo-map">
      <div
        ref={mapContainerRef}
        className="ngo-map__canvas"
        role="region"
        aria-label="Map showing nearby NGOs"
      />
    </div>
  );
}
