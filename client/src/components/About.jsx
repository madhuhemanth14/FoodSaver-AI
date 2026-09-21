import aboutImage from "../assets/about-donation.png";
import "./About.css";

const About = () => {
  return (
    <section className="about-section" id="about">
      <div className="about-container">
        <div className="about-content">
          <p className="about-label">ABOUT FOODSAVER AI</p>

          <h2>Every plate of surplus food deserves a second chance.</h2>

          <p className="about-body">
            FoodSaver AI is an intelligent platform that connects
            restaurants, households, and event organizers with verified
            NGOs. Our AI checks the quality of every donation and our
            logistics network gets it to the people who need it most.
          </p>

          <a href="/#how-it-works" className="about-read-more">
            Read More →
          </a>

          <div className="about-stat-row">
            <div className="about-stat-card">
              <strong>99%</strong>
              <span>AI quality accuracy</span>
            </div>
            <div className="about-stat-card">
              <strong>30 min</strong>
              <span>Average pickup time</span>
            </div>
          </div>
        </div>

        <div className="about-visual">
          <img src={aboutImage} alt="A donor handing a box of food to an NGO volunteer" />
          <div className="about-badge">
            <strong>1/3</strong>
            <span>of all food produced is wasted globally</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
