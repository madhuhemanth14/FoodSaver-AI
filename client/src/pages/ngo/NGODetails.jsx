import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NGOMap from "../../components/ngo/NGOMap";
import { getNGOById } from "../../services/ngoService";
import "../../styles/ngo-details.css";

export default function NGODetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    getNGOById(id)
      .then((data) => {
        if (cancelled) return;
        if (!data) setNotFound(true);
        setNgo(data);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="ngo-details-page">
        <p>Loading NGO details...</p>
      </div>
    );
  }

  if (notFound || !ngo) {
    return (
      <div className="ngo-details-page">
        <button type="button" className="ngo-details-page__back" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="ngo-finder-page__state">
          <span className="ngo-finder-page__state-icon" role="img" aria-hidden="true">🏢</span>
          <p className="ngo-finder-page__state-title">NGO not found</p>
          <p>This NGO may have been removed or the link is incorrect.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ngo-details-page">
      <button type="button" className="ngo-details-page__back" onClick={() => navigate(-1)}>
        ← Back to NGO Finder
      </button>

      <div className="ngo-details-page__card">
        <div className="ngo-details-page__image">
          <span role="img" aria-hidden="true">🏢</span>
        </div>

        <div className="ngo-details-page__body">
          <div className="ngo-details-page__title-row">
            <h1 className="ngo-details-page__name">{ngo.name}</h1>
            <span>{ngo.verified ? "🟢 Verified" : "Unverified"}</span>
          </div>
          <span className="ngo-details-page__rating">⭐ {ngo.rating.toFixed(1)}</span>

          <div className="ngo-details-page__info-grid">
            <div className="ngo-details-page__info-item">
              📍 <span><strong>Address</strong>{ngo.address}</span>
            </div>
            <div className="ngo-details-page__info-item">
              📞 <span><strong>Phone</strong>{ngo.phone}</span>
            </div>
            <div className="ngo-details-page__info-item">
              ✉️ <span><strong>Email</strong>{ngo.email}</span>
            </div>
            <div className="ngo-details-page__info-item">
              📏 <span><strong>Distance</strong>{ngo.distance} km away</span>
            </div>
            <div className="ngo-details-page__info-item">
              🕒 <span><strong>Opening Hours</strong>{ngo.openingHours}</span>
            </div>
          </div>

          <div>
            <p className="ngo-details-page__section-label">Accepted Food</p>
            <ul className="ngo-details-page__food-list">
              {ngo.acceptedFoodTypes.map((food) => (
                <li key={food} className="ngo-details-page__food-item">✓ {food}</li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            className="ngo-details-page__cta"
            onClick={() => navigate("/pickup/request", { state: { ngo } })}
          >
            Schedule Pickup
          </button>
        </div>
      </div>

      <div className="ngo-details-page__map">
        <NGOMap ngos={[ngo]} selectedNGO={ngo} />
      </div>
    </div>
  );
}
