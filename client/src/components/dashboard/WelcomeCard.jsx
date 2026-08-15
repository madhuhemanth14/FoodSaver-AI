import "./WelcomeCard.css";

/**
 * Personalized welcome banner shown at the top of the dashboard.
 * @param {{ name?: string, kgSaved?: number }} props
 */
const WelcomeCard = ({ name = "Yamini", kgSaved = 45 }) => {
  return (
    <section className="welcome-card">
      <div className="welcome-card__text">
        <h1 className="welcome-card__title">Welcome back, {name} 👋</h1>
        <p className="welcome-card__subtitle">Let's save some food today 🌱</p>
      </div>
      <div className="welcome-card__highlight">
        <span className="welcome-card__highlight-value">{kgSaved} kg</span>
        <span className="welcome-card__highlight-label">
          of food helped saved
        </span>
      </div>
    </section>
  );
};

export default WelcomeCard;
