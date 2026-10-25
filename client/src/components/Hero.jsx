import { Link } from "react-router-dom";
import { Globe2, ArrowRight, Brain, Truck } from "lucide-react";
import heroImage from "../assets/hero-food-clean.png";
import { useAuth } from "../context/AuthContext";
import "./Hero.css";

const Hero = () => {
  const { user } = useAuth();

  return (
    <section className="hero" id="home">
      <div className="hero-content">

        {/* LEFT SIDE */}
        <div className="hero-left">
          {user ? (
            <p className="hero-welcome-pill">
              <Globe2 size={15} />
              Welcome back, {user.name}
            </p>
          ) : (
            <p className="small-heading">
              AI-POWERED FOOD SHARING PLATFORM
            </p>
          )}

          <h1>
            Don't Waste Food<br />
            <span>Share Hope</span>
          </h1>

          <p className="hero-description">
            FoodSaver AI connects surplus food donors with verified local NGOs through
            real-time freshness verification and coordinated pickups.
          </p>

          <div className="hero-buttons">
            <Link to="/donor/donate" className="primary-btn">
              Donate Food
            </Link>

            <Link to="/ngos" className="secondary-btn">
              Explore NGOs
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="hero-right">


          <div className="hero-image-frame">
            <img
              src={heroImage}
              alt="FoodSaver AI food donation"
              className="hero-food-image"
            />
          </div>

          {/* AI CARD */}
          <div className="hero-card hero-card--analysis">
            <div className="hero-card__icon hero-card__icon--green">
              <Brain size={18} />
            </div>

            <div>
              <strong>AI Freshness Verification</strong>

              <p>
                Real-time quality checks
                <br />
                <span className="hero-card__good">Safe to consume</span>
              </p>
            </div>
          </div>

          {/* PICKUP CARD */}
          <div className="hero-card hero-card--pickup">
            <div className="hero-card__icon hero-card__icon--truck">
              <Truck size={18} />
            </div>

            <div>
              <strong>NGO Pickup Coordination</strong>

              <p>
                Direct volunteer routing
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;