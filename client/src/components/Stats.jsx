import React from "react";
import {
  Utensils,
  Users,
  Cloud,
  Building2,
} from "lucide-react";

const stats = [
  {
    icon: Utensils,
    number: "12,540+",
    label: "Kg Food Saved",
  },
  {
    icon: Users,
    number: "25,000+",
    label: "Meals Served",
  },
  {
    icon: Cloud,
    number: "18,200+",
    label: "Kg CO₂ Reduced",
  },
  {
    icon: Building2,
    number: "320+",
    label: "NGOs Connected",
  },
];

const Stats = () => {
  return (
    <section className="stats-section" id="impact">
      <div className="stats-container">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="stat" key={stat.label}>
              <Icon size={42} />

              <div>
                <h3>{stat.number}</h3>
                <p>{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Stats;