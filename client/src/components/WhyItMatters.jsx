import React from "react";

const reasons = [
  {
    icon: "🗑️",
    title: "1/3 of food is wasted",
    text: "Every day tons of edible food goes to waste.",
  },
  {
    icon: "🥕",
    title: "Your surplus can fill stomachs",
    text: "Share food, share hope, create impact.",
  },
  {
    icon: "🌍",
    title: "Together for a better planet",
    text: "Less waste, less pollution, better tomorrow.",
  },
];

const WhyItMatters = () => {
  return (
    <section className="why-section" id="features">
      <div className="section-title">
        <h2>Why It Matters</h2>

        <div className="title-decoration">
          <span></span>
          🍃
          <span></span>
        </div>
      </div>

      <div className="reason-container">
        {reasons.map((reason) => (
          <div className="reason-card" key={reason.title}>
            <div className="reason-icon">{reason.icon}</div>

            <div>
              <h3>{reason.title}</h3>
              <p>{reason.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyItMatters;