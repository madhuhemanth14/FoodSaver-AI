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
    const loadNGO = async () => {
      try {
        setLoading(true);
        setNotFound(false);

        const data = await getNGOById(id);

        if (!data) {
          setNotFound(true);
          return;
        }

        setNgo(data);
      } catch (error) {
        console.error("Failed to load NGO:", error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadNGO();
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
        <button
          type="button"
          className="ngo-details-page__back"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <p className="ngo-finder-page__state-title">
          NGO not found
        </p>

        <p>
          This NGO may have been removed or the link is incorrect.
        </p>
      </div>
    );
  }

  return (
    <div className="ngo-details-page">

      <button
        type="button"
        className="ngo-details-page__back"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="ngo-details-page__body">

        <div className="ngo-details-page__title-row">
          <h1 className="ngo-details-page__name">
            {ngo.name}
          </h1>

          <span>
            {ngo.verified ? "🟢 Verified" : "Unverified"}
          </span>
        </div>

        <div className="ngo-details-page__rating">
          ⭐ {ngo.rating || 0}
          <span>
            ({ngo.reviews || 0} reviews)
          </span>
        </div>

        <div className="ngo-details-page__info">

          <div className="ngo-details-page__info-item">
            📍
            <span>
              <strong>Address</strong>
              {ngo.address}
            </span>
          </div>

          <div className="ngo-details-page__info-item">
            🏙️
            <span>
              <strong>City</strong>
              {ngo.city}, {ngo.state}
            </span>
          </div>

          <div className="ngo-details-page__info-item">
            📞
            <span>
              <strong>Phone</strong>
              {ngo.phone}
            </span>
          </div>

          <div className="ngo-details-page__info-item">
            📏
            <span>
              <strong>Distance</strong>
              {ngo.distance} km away
            </span>
          </div>

          <div className="ngo-details-page__info-item">
            🟢
            <span>
              <strong>Status</strong>
              {ngo.status}
            </span>
          </div>

          <div className="ngo-details-page__info-item">
            📦
            <span>
              <strong>Capacity</strong>
              {ngo.capacity}
            </span>
          </div>

        </div>

        <div>
          <p className="ngo-details-page__section-label">
            Accepted Food
          </p>

          <ul className="ngo-details-page__food-list">
            {ngo.acceptedFood?.map((food) => (
              <li
                key={food}
                className="ngo-details-page__food-item"
              >
                ✓ {food}
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          className="ngo-details-page__cta"
          onClick={() =>
            navigate("/pickup/request", {
              state: { ngo },
            })
          }
        >
          Schedule Pickup
        </button>

      </div>

      <div className="ngo-details-page__map">
        <NGOMap
          ngos={[ngo]}
          selectedNGO={ngo}
        />
      </div>

    </div>
  );
}