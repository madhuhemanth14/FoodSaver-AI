const mongoose = require("mongoose");
const dotenv = require("dotenv");
const NGO = require("../models/NGO");

dotenv.config();

/*
|--------------------------------------------------------------------------
| NGO Seed Data
|--------------------------------------------------------------------------
| IMPORTANT:
| GeoJSON coordinates are:
|
| coordinates: [longitude, latitude]
|
| NOT:
|
| coordinates: [latitude, longitude]
|--------------------------------------------------------------------------
*/

const ngos = [
  {
    name: "Akshaya Seva Foundation",
    shortName: "AS",
    rating: 4.8,
    reviews: 212,
    address: "12-4-56, Ashok Nagar, Hyderabad, Telangana 500020",
    city: "Hyderabad",
    state: "Telangana",
    distance: 1.2,
    phone: "+91 90000 11122",
    status: "Open",
    capacity: "High",
    verified: true,
    acceptedFood: [
      "Cooked Meals",
      "Vegetables",
      "Fruits",
    ],
    latitude: 17.4156,
    longitude: 78.4482,

    location: {
      type: "Point",
      coordinates: [78.4482, 17.4156],
    },
  },

  {
    name: "Anna Daanam Trust",
    shortName: "AD",
    rating: 4.6,
    reviews: 158,
    address: "3-9-201, Nallakunta, Hyderabad, Telangana 500044",
    city: "Hyderabad",
    state: "Telangana",
    distance: 2.4,
    phone: "+91 90000 22233",
    status: "Open",
    capacity: "Medium",
    verified: true,
    acceptedFood: [
      "Cooked Meals",
      "Packaged Food",
      "Fruits",
    ],
    latitude: 17.4078,
    longitude: 78.5044,

    location: {
      type: "Point",
      coordinates: [78.5044, 17.4078],
    },
  },

  {
    name: "Prasadam Seva Samithi",
    shortName: "PS",
    rating: 4.3,
    reviews: 61,
    address: "5-6-77, Secunderabad, Telangana 500003",
    city: "Secunderabad",
    state: "Telangana",
    distance: 2.9,
    phone: "+91 90000 77788",
    status: "Open",
    capacity: "High",
    verified: true,
    acceptedFood: [
      "Cooked Meals",
      "Bakery",
    ],
    latitude: 17.4399,
    longitude: 78.4983,

    location: {
      type: "Point",
      coordinates: [78.4983, 17.4399],
    },
  },

  {
    name: "Helping Hands Foundation",
    shortName: "HH",
    rating: 4.7,
    reviews: 184,
    address: "6-3-1109, Somajiguda, Hyderabad, Telangana 500082",
    city: "Hyderabad",
    state: "Telangana",
    distance: 3.2,
    phone: "+91 98765 43210",
    status: "Open",
    capacity: "High",
    verified: true,
    acceptedFood: [
      "Cooked Meals",
      "Vegetables",
      "Fruits",
    ],
    latitude: 17.4239,
    longitude: 78.4576,

    location: {
      type: "Point",
      coordinates: [78.4576, 17.4239],
    },
  },

  {
    name: "Green Plate Initiative",
    shortName: "GP",
    rating: 4.5,
    reviews: 97,
    address: "8-2-293, Banjara Hills, Hyderabad, Telangana 500034",
    city: "Hyderabad",
    state: "Telangana",
    distance: 4.1,
    phone: "+91 90000 45678",
    status: "Open",
    capacity: "Medium",
    verified: true,
    acceptedFood: [
      "Vegetables",
      "Fruits",
      "Packaged Food",
    ],
    latitude: 17.4126,
    longitude: 78.4488,

    location: {
      type: "Point",
      coordinates: [78.4488, 17.4126],
    },
  },

  {
    name: "Nourish Community Kitchen",
    shortName: "NC",
    rating: 4.4,
    reviews: 76,
    address: "10-2-345, Mehdipatnam, Hyderabad, Telangana 500028",
    city: "Hyderabad",
    state: "Telangana",
    distance: 4.8,
    phone: "+91 90000 56789",
    status: "Open",
    capacity: "Low",
    verified: true,
    acceptedFood: [
      "Cooked Meals",
      "Bakery",
      "Dairy",
    ],
    latitude: 17.3962,
    longitude: 78.4398,

    location: {
      type: "Point",
      coordinates: [78.4398, 17.3962],
    },
  },

  {
    name: "Food For All Foundation",
    shortName: "FA",
    rating: 4.2,
    reviews: 53,
    address: "2-1-89, Himayatnagar, Hyderabad, Telangana 500029",
    city: "Hyderabad",
    state: "Telangana",
    distance: 5.3,
    phone: "+91 90000 67890",
    status: "Open",
    capacity: "Medium",
    verified: true,
    acceptedFood: [
      "Cooked Meals",
      "Packaged Food",
    ],
    latitude: 17.4007,
    longitude: 78.4862,

    location: {
      type: "Point",
      coordinates: [78.4862, 17.4007],
    },
  },

  {
    name: "Sunrise Orphan Care Home",
    shortName: "SO",
    rating: 4.6,
    reviews: 112,
    address: "4-7-221, Kukatpally, Hyderabad, Telangana 500072",
    city: "Hyderabad",
    state: "Telangana",
    distance: 6.1,
    phone: "+91 90000 78901",
    status: "Open",
    capacity: "High",
    verified: true,
    acceptedFood: [
      "Cooked Meals",
      "Fruits",
      "Dairy",
    ],
    latitude: 17.4849,
    longitude: 78.4138,

    location: {
      type: "Point",
      coordinates: [78.4138, 17.4849],
    },
  },

  {
    name: "Care & Share NGO",
    shortName: "CS",
    rating: 4.1,
    reviews: 48,
    address: "7-1-54, Ameerpet, Hyderabad, Telangana 500016",
    city: "Hyderabad",
    state: "Telangana",
    distance: 6.8,
    phone: "+91 90000 89012",
    status: "Closed",
    capacity: "Low",
    verified: true,
    acceptedFood: [
      "Vegetables",
      "Fruits",
    ],
    latitude: 17.4375,
    longitude: 78.4483,

    location: {
      type: "Point",
      coordinates: [78.4483, 17.4375],
    },
  },

  {
    name: "Hope Food Relief Centre",
    shortName: "HF",
    rating: 4.5,
    reviews: 89,
    address: "1-8-501, Begumpet, Hyderabad, Telangana 500016",
    city: "Hyderabad",
    state: "Telangana",
    distance: 7.4,
    phone: "+91 90000 90123",
    status: "Open",
    capacity: "High",
    verified: true,
    acceptedFood: [
      "Cooked Meals",
      "Bakery",
      "Packaged Food",
    ],
    latitude: 17.4447,
    longitude: 78.4677,

    location: {
      type: "Point",
      coordinates: [78.4677, 17.4447],
    },
  },
];

/*
|--------------------------------------------------------------------------
| Seed Database
|--------------------------------------------------------------------------
*/

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    // Remove existing NGOs
    await NGO.deleteMany({});

    console.log("Existing NGOs deleted");

    // Insert all NGOs
    const insertedNGOs = await NGO.insertMany(ngos);

    console.log(
      `${insertedNGOs.length} NGOs inserted successfully`
    );

    console.log("\nInserted NGOs:");

    insertedNGOs.forEach((ngo, index) => {
      console.log(
        `${index + 1}. ${ngo.name} | ${ngo._id}`
      );
    });

    console.log("\nNGO seeding completed successfully!");
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await mongoose.connection.close();

    console.log("MongoDB connection closed");
  }
};

seedDatabase();