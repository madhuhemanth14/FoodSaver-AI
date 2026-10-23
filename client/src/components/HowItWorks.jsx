import { PackageOpen, Brain, MapPin, Truck, Heart, Leaf } from "lucide-react";
import "./HowItWorks.css";

const steps = [
  {
    number: "1",
    icon: PackageOpen,
    title: "Upload Food",
    text: "Snap a photo and add details of your surplus food in seconds.",
  },
  {
    number: "2",
    icon: Brain,
    title: "AI Checks Food Quality",
    text: "Our AI verifies freshness and predicts a safe consumption window.",
  },
  {
    number: "3",
    icon: MapPin,
    title: "Nearest NGO Found",
    text: "The system matches with a verified local food relief partner.",
  },
  {
    number: "4",
    icon: Truck,
    title: "Quick Pickup",
    text: "NGO schedules a convenient pickup before the food expires.",
  },
  {
    number: "5",
    icon: Heart,
    title: "Hunger Reduced",
    text: "Wholesome meals reach people who need them most.",
  },
];

const HowItWorks = () => {
  return (
    <section className="how-section" id="how-it-works">
      <div className="section-title">
        <p className="section-eyebrow">THE PROCESS</p>
        <h2>How FoodSaver AI Works</h2>
        <span className="section-leaf" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Leaf size={18} color="var(--primary, #2e7d32)" />
        </span>
      </div>

      <div className="steps-container">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div className="step-card" key={step.number}>
              <div className="step-number">{step.number}</div>
              <div className="step-icon">
                <Icon size={30} />
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              {index < steps.length - 1 && <span className="step-arrow" />}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HowItWorks;
