// backend/utils/createAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  
  const email = 'admin@kayonigraphics.co.ke'; // 👈 Change this
  const password = 'SecurePass2026!'; // 👈 Change this!

  // Check if exists
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('✅ Admin already exists');
    process.exit(0);
  }

  const admin = new User({ email, password, role: 'admin' });
  await admin.save();
  console.log('✅ Admin user created:', email);
  process.exit(0);
};

createAdmin();