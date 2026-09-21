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
            Don&apos;t Waste Food —<br />
            <span>Share Hope.</span>
          </h1>

          <p className="hero-description">
            FoodSaver AI connects surplus food with people in need using AI
            technology and smart logistics to build a hunger-free,
            waste-free world — one donation at a time.
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

          <div className="donor-info">
            <div className="avatars">
              <div>👨🏻</div>
              <div>👩🏻</div>
              <div>👨🏻</div>
              <div>👩🏻</div>
              <div>👩🏻</div>
            </div>

            <p>
              Join <strong>5,000+</strong> donors making a difference daily
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="hero-right">

          <div className="hero-background-circle"></div>

          <div className="hero-image-frame">
            <img
              src={heroImage}
              alt="FoodSaver AI food donation"
              className="hero-food-image"
            />
          </div>

          {/* AI CARD */}
          <div className="hero-card hero-card--analysis">
            <div className="hero-card__icon hero-card__icon--pink">
              <Brain size={18} />
            </div>

            <div>
              <strong>AI Food Analysis</strong>

              <p>
                Quality:
                <span className="hero-card__good"> Good ✅</span>
                <br />
                Safe to eat for <strong>12 hrs</strong>
              </p>
            </div>
          </div>

          {/* PICKUP CARD */}
          <div className="hero-card hero-card--pickup">
            <div className="hero-card__icon hero-card__icon--truck">
              <Truck size={18} />
            </div>

            <div>
              <strong>Pickup in Progress</strong>

              <p>
                Estimated time <strong>30 mins</strong>
              </p>
            </div>
          </div>

          {/* FOOD SAVED */}
          <div className="hero-food-saved">
            <span>Food Saved</span>
            <strong>12,540+</strong>
            <small>kg</small>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;