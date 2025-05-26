// scripts/fixCoinsType.js
const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect('mongodb://mongodb+srv://icons1:YiKz7TzJgJvYj9Kt@cluster0.ypaj4zp.mongodb.net/icons?retryWrites=true&w=majority&appName=Cluster0');

async function fixCoins() {
  await User.updateMany(
    { coins: { $type: "string" } }, 
    [{ $set: { coins: { $toInt: "$coins" } } }] 
  );
  console.log("Coins gefixt!");
  mongoose.disconnect();
}

fixCoins();