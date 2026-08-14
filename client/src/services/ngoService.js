const dummyNGOs = [
  {
    id: 1,
    name: "Helping Hands",
    location: "Ongole",
    distance: 2.3,
    rating: 4.6,
    verified: true,
    acceptedFoodTypes: [
      "Rice",
      "Vegetables",
      "Fruits"
    ]
  },

  {
    id: 2,
    name: "Food For All",
    location: "Ongole",
    distance: 4.1,
    rating: 4.4,
    verified: true,
    acceptedFoodTypes: [
      "Cooked Food",
      "Bread",
      "Fruits"
    ]
  },

  {
    id: 3,
    name: "Care Foundation",
    location: "Ongole",
    distance: 5.7,
    rating: 4.2,
    verified: true,
    acceptedFoodTypes: [
      "Rice",
      "Dal",
      "Vegetables"
    ]
  }
];

export const getNearbyNGOs = async () => {
  return dummyNGOs;
};

export const getNGOById = async (id) => {
  return dummyNGOs.find(
    (ngo) => ngo.id === Number(id)
  );
};