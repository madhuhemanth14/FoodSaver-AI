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
    text: "We instantly match your donation with the closest verified NGO.",
  },
  {
    number: "4",
    icon: Truck,
    title: "Pickup Scheduled",
    text: "A pickup is scheduled and tracked in real time until collection.",
  },
  {
    number: "5",
    icon: Heart,
    title: "Food Delivered",
    text: "Your donation reaches people who need it most, still fresh.",
  },
];

const HowItWorks = () => {
  return (
    <section className="how-section" id="how-it-works">
      <div className="section-title">
        <p className="section-eyebrow">THE PROCESS</p>
        <h2>How FoodSaver AI Works</h2>
        <span className="section-leaf">🌿</span>
      </div>

      <div className="steps-container">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div className="step-card" key={step.number}>
              <div className="step-icon">
                <Icon size={26} />
              </div>
              <div className="step-title">
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3>
              </div>
              <p>{step.text}</p>
              {index < steps.length - 1 && <span className="step-connector" />}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HowItWorks;
