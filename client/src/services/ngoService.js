const dummyNGOs = [
  {
    id: 1,
    name: "Helping Hands",
    location: "Ongole",
    latitude: 15.5057,
    longitude: 80.0499,
    distance: 2.3,
    rating: 4.6,
    verified: true,
    acceptedFoodTypes: [
      "Rice",
      "Vegetables",
      "Fruits",
    ],
  },

  {
    id: 2,
    name: "Food For All",
    location: "Ongole",
    latitude: 15.5035,
    longitude: 80.0520,
    distance: 4.1,
    rating: 4.4,
    verified: true,
    acceptedFoodTypes: [
      "Cooked Food",
      "Bread",
      "Fruits",
    ],
  },

  {
    id: 3,
    name: "Care Foundation",
    location: "Ongole",
    latitude: 15.5090,
    longitude: 80.0470,
    distance: 5.7,
    rating: 4.2,
    verified: true,
    acceptedFoodTypes: [
      "Rice",
      "Dal",
      "Vegetables",
    ],
  },
];

/*
 * Temporary fallback.
 * We will replace this with Google Places results
 * in the next step.
 */
export const getNearbyNGOs = async () => {
  return dummyNGOs;
};

export const getNGOById = async (id) => {
  return dummyNGOs.find(
    (ngo) => ngo.id === Number(id)
  );
};