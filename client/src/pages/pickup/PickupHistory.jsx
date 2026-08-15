import React from "react";
import "../../styles/pickup-history.css";

const pickupHistory = [
  {
    ngo: "Anna Daanam Trust",
    donationId: "FSA-DN-201122",
    driver: "Suresh Reddy · TS 07 CD 8821",
    quantity: "35 servings",
    pickupDate: "24 Jul 2026",
    deliveryDate: "24 Jul 2026",
  },
  {
    ngo: "Sunrise Orphan Care Home",
    donationId: "FSA-DN-199087",
    driver: "Ramesh Kumar · AP39AB1234",
    quantity: "52 servings",
    pickupDate: "20 Jul 2026",
    deliveryDate: "20 Jul 2026",
  },
  {
    ngo: "Helping Hands Shelter",
    donationId: "FSA-DN-197654",
    driver: "Arjun Rao · AP39XY7821",
    quantity: "28 servings",
    pickupDate: "17 Jul 2026",
    deliveryDate: "17 Jul 2026",
  },
  {
    ngo: "Food For All Foundation",
    donationId: "FSA-DN-194321",
    driver: "Kiran Kumar · AP39MN4521",
    quantity: "42 servings",
    pickupDate: "12 Jul 2026",
    deliveryDate: "12 Jul 2026",
  },
];

function PickupHistory() {
  return (
    <main className="pickup-history-page">
      <div className="pickup-history-container">

        <div className="pickup-history-header">
          <div>
            <h1>Pickup History</h1>
            <p>
              Completed donations and their final delivery outcome.
            </p>
          </div>
        </div>

        <section className="pickup-history-list">

          {pickupHistory.map((pickup) => (
            <article
              className="pickup-history-card"
              key={pickup.donationId}
            >
              <div className="pickup-history-card-header">

                <div>
                  <h2>{pickup.ngo}</h2>
                  <span className="pickup-donation-id">
                    {pickup.donationId}
                  </span>
                </div>

                <span className="pickup-success-badge">
                  Delivered Successfully
                </span>

              </div>

              <div className="pickup-history-info">

                <div className="pickup-info-item">
                  <span className="pickup-info-label">
                    Driver
                  </span>

                  <strong>
                    {pickup.driver}
                  </strong>
                </div>

                <div className="pickup-info-item">
                  <span className="pickup-info-label">
                    Food Quantity
                  </span>

                  <strong>
                    {pickup.quantity}
                  </strong>
                </div>

                <div className="pickup-info-item">
                  <span className="pickup-info-label">
                    Pickup Date
                  </span>

                  <strong>
                    {pickup.pickupDate}
                  </strong>
                </div>

                <div className="pickup-info-item">
                  <span className="pickup-info-label">
                    Delivery Date
                  </span>

                  <strong>
                    {pickup.deliveryDate}
                  </strong>
                </div>

              </div>
            </article>
          ))}

        </section>

      </div>
    </main>
  );
}

export default PickupHistory;