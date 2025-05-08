const mongoose = require('mongoose');

const DeliverySchema = new mongoose.Schema({
  address: String,
  deadline: Date,
  priority: { type: String, enum: ['High', 'Medium', 'Low'] },
  productType: String, 
  delivered: { type: Boolean, default: false },
});

module.exports = mongoose.model('Delivery', DeliverySchema);
