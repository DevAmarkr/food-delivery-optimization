const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_id: String,
  restaurant_id: String,
  restaurant_lat: Number,
  restaurant_long: Number,
  customer_lat: Number,
  customer_long: Number,
  order_time: String,
  delivery_priority: String,
  product_type: String,
  delivery_deadline: String,
  status: String,
  driver_id: { type: String, default: null },
  delivered_at: { type: Date, default: null },
});

module.exports = mongoose.model('Orders', orderSchema);