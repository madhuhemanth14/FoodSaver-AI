import React from "react";
import {
  PackageOpen,
  Brain,
  MapPin,
  Users,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    number: "1",
    icon: PackageOpen,
    title: "You Donate",
    text: "Add surplus food with details and image.",
  },
  {
    number: "2",
    icon: Brain,
    title: "AI Analysis",
    text: "Our AI checks quality and predicts safe consumption time.",
  },
  {
    number: "3",
    icon: MapPin,
    title: "We Connect",
    text: "We find nearby NGOs and schedule a pickup.",
  },
  {
    number: "4",
    icon: Users,
    title: "Food Reaches Those in Need",
    text: "Nutritious food reaches people who need it the most.",
  },
];

const HowItWorks = () => {
  return (
    <section className="how-section" id="how-it-works">
      <div className="section-title">
        <h2>How FoodSaver AI Works</h2>
        <div className="title-decoration">
          <span></span>
          🍃
          <span></span>
        </div>
      </div>

      <div className="steps-container">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <React.Fragment key={step.number}>
              <div className="step-card">
                <div className="step-icon">
                  <Icon size={40} />
                </div>

                <div className="step-number">{step.number}</div>

                <h3>{step.title}</h3>

                <p>{step.text}</p>
              </div>

              {index < steps.length - 1 && (
                <div className="step-arrow">
                  <ArrowRight size={25} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
};

export default HowItWorks;