import { useState } from "react";
import { Star } from "lucide-react";
import "./Testimonials.css";

const testimonials = [
  {
    quote:
      "The AI quality checks give us total confidence in every donation we receive. It's changed how we plan our meal drives.",
    name: "Rahul Mehta",
    role: "NGO Coordinator · Green Table Foundation",
  },
  {
    quote:
      "Scheduling a pickup used to take a dozen phone calls. Now it takes two minutes and the food actually gets there fresh.",
    name: "Ananya Rao",
    role: "Restaurant Owner · Spice Route Kitchen",
  },
  {
    quote:
      "We can see exactly which NGO received each donation and when it was delivered. That kind of transparency builds trust with our donors.",
    name: "Vikram Shah",
    role: "Operations Lead · Hope Foundation",
  },
  {
    quote:
      "FoodSaver AI helped us cut our event catering waste nearly in half. It's a genuinely simple way to do the right thing.",
    name: "Priya Nair",
    role: "Event Organizer · Nair & Co Events",
  },
];

const Testimonials = () => {
  const [active, setActive] = useState(0);
  const testimonial = testimonials[active];

  return (
    <section className="testimonials-section">
      <div className="section-title">
        <p className="section-eyebrow">TESTIMONIALS</p>
        <h2>Loved by Donors &amp; NGOs</h2>
      </div>

      <div className="testimonial-card">
        <div className="testimonial-stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={16} fill="#f5a623" color="#f5a623" />
          ))}
        </div>

        <p className="testimonial-quote">&ldquo;{testimonial.quote}&rdquo;</p>

        <div className="testimonial-author">
          <div className="testimonial-avatar">{testimonial.name.charAt(0)}</div>
          <div>
            <strong>{testimonial.name}</strong>
            <span>{testimonial.role}</span>
          </div>
        </div>
      </div>

      <div className="testimonial-dots">
        {testimonials.map((t, i) => (
          <button
            key={t.name}
            type="button"
            className={`testimonial-dot${i === active ? " testimonial-dot--active" : ""}`}
            aria-label={`Show testimonial from ${t.name}`}
            onClick={() => setActive(i)}
          />
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
