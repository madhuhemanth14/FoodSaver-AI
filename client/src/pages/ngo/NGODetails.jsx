import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { rolePrefix } from "../../utils/roles";
import NGOMap from "../../components/ngo/NGOMap";
import BackButton from "../../components/common/BackButton";
import { getNGOById } from "../../services/ngoService";
import {
  MapPin,
  Building2,
  Phone,
  Navigation,
  Activity,
  Package,
  Check,
  Star,
  ShieldCheck,
} from "lucide-react";
import "../../styles/ngo-details.css";

export default function NGODetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const base = rolePrefix(user?.role);

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
        <BackButton fallback="/ngos" label="Back to Directory" />

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
      <BackButton fallback="/ngos" label="Back to Directory" />

      <div className="ngo-details-page__body">

        <div className="ngo-details-page__title-row">
          <h1 className="ngo-details-page__name">
            {ngo.name}
          </h1>

          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.85rem", fontWeight: 600, color: ngo.verified ? "#15803d" : "#64748b" }}>
            {ngo.verified ? (
              <>
                <ShieldCheck size={16} /> Verified Partner
              </>
            ) : "Unverified"}
          </span>
        </div>

        <div className="ngo-details-page__rating" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Star size={16} fill="#c98a12" color="#c98a12" /> {ngo.rating || 0}
          <span style={{ color: "var(--fs-text-muted)", fontWeight: 400 }}>
            ({ngo.reviews || 0} reviews)
          </span>
        </div>

        <div className="ngo-details-page__info-grid">

          <div className="ngo-details-page__info-item">
            <MapPin size={18} style={{ color: "var(--fs-primary)", flexShrink: 0, marginTop: 2 }} />
            <span>
              <strong>Address</strong>
              {ngo.address}
            </span>
          </div>

          <div className="ngo-details-page__info-item">
            <Building2 size={18} style={{ color: "var(--fs-primary)", flexShrink: 0, marginTop: 2 }} />
            <span>
              <strong>City</strong>
              {ngo.city}, {ngo.state}
            </span>
          </div>

          <div className="ngo-details-page__info-item">
            <Phone size={18} style={{ color: "var(--fs-primary)", flexShrink: 0, marginTop: 2 }} />
            <span>
              <strong>Phone</strong>
              {ngo.phone}
            </span>
          </div>

          <div className="ngo-details-page__info-item">
            <Navigation size={18} style={{ color: "var(--fs-primary)", flexShrink: 0, marginTop: 2 }} />
            <span>
              <strong>Distance</strong>
              {ngo.distance} km away
            </span>
          </div>

          <div className="ngo-details-page__info-item">
            <Activity size={18} style={{ color: "var(--fs-primary)", flexShrink: 0, marginTop: 2 }} />
            <span>
              <strong>Status</strong>
              {ngo.status}
            </span>
          </div>

          <div className="ngo-details-page__info-item">
            <Package size={18} style={{ color: "var(--fs-primary)", flexShrink: 0, marginTop: 2 }} />
            <span>
              <strong>Capacity</strong>
              {ngo.capacity}
            </span>
          </div>

        </div>

        <div>
          <p className="ngo-details-page__section-label">
            Accepted Food Categories
          </p>

          <ul className="ngo-details-page__food-list">
            {ngo.acceptedFood?.map((food) => (
              <li
                key={food}
                className="ngo-details-page__food-item"
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Check size={14} style={{ color: "var(--fs-primary)" }} /> {food}
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          className="ngo-details-page__cta"
          onClick={() =>
            navigate(`${base}/pickups/request`, {
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