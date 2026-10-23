// One-time / idempotent setup script for the single authorized FoodSaver AI
// Admin account. Run manually (see server/package.json's "seed:admin"
// script) — this is intentionally NOT reachable from any HTTP route, so a
// public signup form can never trigger it.
//
// Usage:
//   ADMIN_SEED_PASSWORD=<a real password> npm run seed:admin
//
// Safe to re-run: if the account already exists, it does nothing (never
// creates a duplicate, never overwrites the existing password/role).

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const connectDB = require("../config/db");
const User = require("../models/User");

dotenv.config();

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "hello.foodsaverai@gmail.com").toLowerCase();
const ADMIN_NAME = process.env.ADMIN_NAME || "FoodSaver AI Admin";
const ADMIN_SEED_PASSWORD = process.env.ADMIN_SEED_PASSWORD;

async function seedAdmin() {
  if (!ADMIN_SEED_PASSWORD) {
    console.error(
      "ADMIN_SEED_PASSWORD is not set. Set it to the password you want the admin account to have, then re-run this script."
    );
    process.exitCode = 1;
    return;
  }

  await connectDB();

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    if (existing.role !== "admin") {
      console.log(
        `An account already exists for ${ADMIN_EMAIL} but its role is "${existing.role}", not "admin". ` +
          "This script never changes an existing account — update it manually in the database if that's intentional."
      );
    } else {
      console.log(`Admin account for ${ADMIN_EMAIL} already exists. Nothing to do.`);
    }
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_SEED_PASSWORD, 10);

  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: "admin",
  });

  console.log(`Admin account created for ${ADMIN_EMAIL}.`);
  await mongoose.disconnect();
}

seedAdmin().catch((error) => {
  console.error("Failed to seed admin account:", error);
  process.exitCode = 1;
});
