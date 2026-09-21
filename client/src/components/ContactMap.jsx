import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

// Same pattern as components/ngo/NGOMap.jsx (a separate script-load promise
// per component, guarded so multiple mounts never insert the script twice).
// Kept local to this component instead of importing NGOMap's loader so the
// existing NGO map is never touched.
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// The address FoodSaver AI already shows in the Contact section — geocoded
// at runtime rather than hardcoding a lat/lng, so it always reflects
// whatever address is configured here.
export const OFFICE_ADDRESS =
  "4th Floor, Greenway Tower, Hyderabad, Telangana, India";

let googleMapsScriptPromise = null;

function loadGoogleMaps() {
  if (window.google?.maps) return Promise.resolve(window.google);
  if (googleMapsScriptPromise) return googleMapsScriptPromise;

  googleMapsScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error("Failed to load Google Maps script."));
    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
}

/**
 * ContactMap
 *
 * Address -> Google Geocoding -> lat/lng -> Map -> Marker.
 * Falls back to a plain address panel instead of crashing when
 * VITE_GOOGLE_MAPS_API_KEY is missing, the script fails to load, or the
 * address can't be geocoded.
 */
const ContactMap = () => {
  const mapContainerRef = useRef(null);
  const [status, setStatus] = useState(
    GOOGLE_MAPS_API_KEY ? "loading" : "unavailable"
  );

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || !mapContainerRef.current) return;
    let cancelled = false;

    loadGoogleMaps()
      .then((google) => {
        if (cancelled || !mapContainerRef.current) return;

        new google.maps.Geocoder().geocode(
          { address: OFFICE_ADDRESS },
          (results, geoStatus) => {
            if (cancelled) return;

            if (geoStatus !== "OK" || !results?.[0]) {
              setStatus("unavailable");
              return;
            }

            const location = results[0].geometry.location;
            const map = new google.maps.Map(mapContainerRef.current, {
              center: location,
              zoom: 15,
              disableDefaultUI: true,
              zoomControl: true,
            });

            new google.maps.Marker({
              map,
              position: location,
              title: "FoodSaver AI",
            });

            setStatus("ready");
          }
        );
      })
      .catch(() => {
        if (!cancelled) setStatus("unavailable");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (status !== "ready") {
    return (
      <div className="contact-map-preview">
        <MapPin size={16} />
        <span>{OFFICE_ADDRESS}</span>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className="contact-map-preview contact-map-preview--live"
    />
  );
};

export default ContactMap;
