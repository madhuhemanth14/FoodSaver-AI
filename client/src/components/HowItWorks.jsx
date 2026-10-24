import { PackageOpen, Brain, MapPin, Truck, Heart } from "lucide-react";
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
      </div>

      <div className="steps-container">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div className="step-card" key={step.number}>
              <div className="step-card-header">
                <div className="step-icon">
                  <Icon size={24} />
                </div>
                <div className="step-number">{step.number}</div>
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-text">{step.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HowItWorks;
