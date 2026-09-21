import { Utensils, Package, Building2, Leaf, Cloud } from "lucide-react";
import "./Stats.css";

const stats = [
  { icon: Utensils, number: "15K+", label: "Meals Shared" },
  { icon: Package, number: "8K+", label: "Donations" },
  { icon: Building2, number: "500+", label: "NGOs Connected" },
  { icon: Leaf, number: "20 Tons", label: "Food Saved" },
  { icon: Cloud, number: "12 Tons", label: "CO₂ Reduced" },
];

const Stats = () => {
  return (
    <section className="stats-section" id="impact">
      <div className="stats-container">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div className="stat" key={stat.label}>
              <div className="stat-icon">
                <Icon size={20} />
              </div>
              <div>
                <strong>{stat.number}</strong>
                <span>{stat.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Stats;
