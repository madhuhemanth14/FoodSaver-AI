import React from "react";
import {
  Leaf,
  Brain,
  Heart,
  Users,
  Target,
  Globe
} from "lucide-react";

const About = () => {
  return (
    <section className="about-section" id="about">

      {/* Section Heading */}
      <div className="section-title">
        <h2>About FoodSaver AI</h2>

        <div className="title-decoration">
          <span></span>
          <Leaf size={18} />
          <span></span>
        </div>
      </div>


      {/* Main About Content */}
      <div className="about-container">

        {/* Left Side */}
        <div className="about-content">

          <p className="about-label">
            OUR MISSION
          </p>

          <h2>
            Turning surplus food into
            <span> meaningful change.</span>
          </h2>

          <p>
            FoodSaver AI is an AI-powered food sharing platform
            designed to reduce food waste and help people in need.
            Every day, large amounts of perfectly edible food are
            thrown away while many people struggle to access
            nutritious meals.
          </p>

          <p>
            Our platform connects food donors, NGOs, and volunteers
            through a simple digital system. Donors can list surplus
            food, while AI technology helps analyze food quality and
            estimate safe consumption time.
          </p>

          <p>
            We then help connect donations with nearby NGOs for
            efficient pickup and distribution.
          </p>

          <div className="about-highlight">
            <Heart size={25} />

            <div>
              <h3>
                Save Food. Share Hope.
              </h3>

              <p>
                Together, we can create a hunger-free and
                waste-free world.
              </p>
            </div>
          </div>

        </div>


        {/* Right Side */}
        <div className="about-cards">

          <div className="about-card">

            <div className="about-card-icon">
              <Brain size={28} />
            </div>

            <h3>
              AI Powered
            </h3>

            <p>
              AI helps analyze food quality and estimate
              safe consumption time.
            </p>

          </div>


          <div className="about-card">

            <div className="about-card-icon">
              <Users size={28} />
            </div>

            <h3>
              Community Driven
            </h3>

            <p>
              We connect donors, NGOs and volunteers
              to make food sharing easier.
            </p>

          </div>


          <div className="about-card">

            <div className="about-card-icon">
              <Target size={28} />
            </div>

            <h3>
              Our Mission
            </h3>

            <p>
              Reduce food waste while helping nutritious
              food reach people who need it.
            </p>

          </div>


          <div className="about-card">

            <div className="about-card-icon">
              <Globe size={28} />
            </div>

            <h3>
              Better Planet
            </h3>

            <p>
              Less food waste means fewer emissions
              and a more sustainable future.
            </p>

          </div>

        </div>

      </div>

    </section>
  );
};

export default About;