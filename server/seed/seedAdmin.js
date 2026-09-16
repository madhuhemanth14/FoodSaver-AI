const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      return;
    }

    const admin = await User.create({
      name: 'FoodSaver Admin',
      email: 'admin@foodsaver.ai',
      password: 'Admin@123',
      phone: '+91 90000 00000',
      role: 'admin',
      isVerified: true,
      isActive: true
    });

    console.log('Admin created successfully:');
    console.log('  Email:', admin.email);
    console.log('  Password: Admin@123');
    console.log('  ID:', admin._id);
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

seedAdmin();
