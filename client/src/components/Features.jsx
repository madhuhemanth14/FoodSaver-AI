import { Brain, Clock, MapPin, Truck, Bell, BarChart3 } from "lucide-react";
import "./Features.css";

const features = [
  {
    icon: Brain,
    title: "AI Food Analysis",
    text: "Our AI scans every donation to verify freshness and quality before it's matched with an NGO.",
  },
  {
    icon: Clock,
    title: "Expiry Prediction",
    text: "Machine learning predicts exactly how long each donation stays safe to eat, down to the hour.",
  },
  {
    icon: MapPin,
    title: "Nearby NGO Finder",
    text: "Automatically match every donation with the closest verified NGO for the fastest possible impact.",
  },
  {
    icon: Truck,
    title: "Smart Pickup Scheduling",
    text: "Pickups are scheduled and optimized around routes, traffic, and NGO availability in real time.",
  },
  {
    icon: Bell,
    title: "Real-time Notifications",
    text: "Donors and NGOs stay in sync with live status updates from pickup to delivery.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    text: "Track your donation history, meals provided, and environmental impact in one clean dashboard.",
  },
];

const Features = () => {
  return (
    <section className="features-section" id="features">
      <div className="section-title">
        <p className="section-eyebrow">WHAT WE OFFER</p>
        <h2>Key Features</h2>
      </div>

      <div className="features-grid">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div className="feature-card" key={feature.title}>
              <div className="feature-icon">
                <Icon size={22} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Features;
