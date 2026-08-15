import React from "react";
import { Heart, MapPin, ArrowRight } from "lucide-react";
import heroImage from "../assets/hero-food.png";

const Hero = () => {
  return (
    <section className="hero" id="home">
      <div className="hero-content">

        {/* ================= LEFT SIDE ================= */}
        <div className="hero-left">

          <p className="small-heading">
            AI-POWERED FOOD SHARING PLATFORM
          </p>

          <h1>
            Don't Waste Food –
            <br />
            <span>
              Share Hope.
              <span className="hero-leaf">🍃</span>
            </span>
          </h1>

          <p className="hero-description">
            FoodSaver AI connects surplus food with people in need using
            AI technology and smart logistics to build a hunger-free,
            waste-free world.
          </p>

          {/* Buttons */}
          <div className="hero-buttons">

            <button className="primary-btn">
              Donate Food
              <Heart size={19} />
            </button>

            <button className="secondary-btn">
              Find NGO Near You
              <MapPin size={19} />
            </button>

          </div>

          {/* Donor information */}
          <div className="donor-info">

            <div className="avatars">
              <div>👨🏻</div>
              <div>👩🏻</div>
              <div>👨🏻</div>
              <div>👩🏻</div>
              <div>👨🏻</div>
            </div>

            <p>
              Join <strong>5,000+</strong> donors who are
              <br />
              making a difference daily
            </p>

          </div>
        </div>


        {/* ================= RIGHT SIDE ================= */}
        <div className="hero-right">

          <div className="hero-background-circle"></div>

          <img
            src={heroImage}
            alt="FoodSaver AI food donation"
            className="hero-food-image"
          />

        </div>

      </div>

      {/* Bottom decorative shape */}
      <div className="hero-bottom-wave"></div>

    </section>
  );
};

export default Hero;