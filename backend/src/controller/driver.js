const Order = require('../models/order');
const Driver = require('../models/driver')
const { prioritizeDeliveries } = require('../services/route-optimizer');
const { getDistanceMatrix } = require('../services/googleMaps');

exports.getDriverRoute = async (req, res) => {
    try {
      const driverId = req.params.id;
      const driverLatLng = { lat: 28.6139, lng: 77.2090 };
  
      const orders = await Order.find({ status: 'pending' });
  
      if (orders.length === 0) {
        return res.status(404).json({ message: 'No pending orders found.' });
      }
  
      const prioritized = prioritizeDeliveries(orders).slice(0, 5);
  
      const matrix = await getDistanceMatrix(driverLatLng, prioritized);
  
      const enriched = prioritized.map((order, index) => ({
        order_id: order.order_id,
        product_type: order.product_type,
        delivery_priority: order.delivery_priority,
        customer_lat: order.customer_lat,
        customer_long: order.customer_long,
        distance: matrix.rows[0].elements[index].distance.text,
        duration: matrix.rows[0].elements[index].duration.text,
        score: prioritized[index].score,
        delivery_deadline: prioritized[index].delivery_deadline,
      }));
      res.json({ driver_location: driverLatLng, optimizedRoute: enriched });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to get optimized route' });
    }
  };


  exports.loginOrCreateDriver = async (req, res) => {
    console.log('I am called')
    const { email, name } = req.body;
  
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
  
    let driver = await Driver.findOne({ email });
  
    if (!driver) {
      driver = await Driver.create({ email, name });
    }
  
    res.json({
      message: `Welcome ${driver.name || 'Driver'} 👋`,
      driver_id: driver?._id,
      email: driver.email
    });
  };

exports.acceptOrder = async (req, res) => {
    const { driver_id } = req.body;
    const order_id = req.params.id;
  
    if (!driver_id) return res.status(400).json({ error: "Missing driver_id" });
  
    const order = await Order.findOne({ order_id });
  
    if (!order || order.status !== 'pending') {
      return res.status(404).json({ error: "Order not available" });
    }
  
    order.driver_id = driver_id;
    order.status = 'accepted';
    await order.save();
  
    res.json({ message: "Order accepted", order });
  };

exports.getActiveRoute = async (req, res) => {
    try {
      const driverId = req.params.id;
  
      const acceptedOrders = await Order.find({
        driver_id: driverId,
        status: 'accepted',
      });
      console.log(acceptedOrders,'XX') 
  
      if (!acceptedOrders.length) {
        return res.status(200).json({ message: 'No accepted orders' });
      }
  
      const driverLatLng = { lat: 28.6139, lng: 77.2090 }; // Simulated current location
  
      const prioritized = prioritizeDeliveries(acceptedOrders);
      const matrix = await getDistanceMatrix(driverLatLng, prioritized);
  
      const enriched = prioritized.map((order, index) => ({
        order_id: order.order_id,
        product_type: order.product_type,
        delivery_priority: order.delivery_priority,
        customer_lat: order.customer_lat,
        customer_long: order.customer_long,
        distance: matrix.rows[0].elements[index]?.distance?.text || 'N/A',
        duration: matrix.rows[0].elements[index]?.duration?.text || 'N/A'
      }));
  
      res.json({
        driver_location: driverLatLng,
        optimizedDeliveryRoute: enriched,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to calculate active delivery route' });
    }
  };

  exports.completeOrder = async (req, res) => {
    try {
      const orderId = req.params.id;
  
      const order = await Order.findOne({ order_id: orderId });
      if (!order) return res.status(404).json({ error: "Order not found" });
  
      if (order.status === 'delivered') {
        return res.status(400).json({ message: "Order already delivered" });
      }
  
      order.status = 'delivered';
      order.delivered_at = new Date();
  
      await order.save();
  
      res.json({ message: "Order marked as delivered", order });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to complete order" });
    }
  };

  exports.getDeliveryHistory = async (req, res) => {
    try {
      const driverId = req.params.id;
  
      const deliveredOrders = await Order.find({
        driver_id: driverId,
        status: 'delivered',
      });
  
      const total = deliveredOrders.length;
  
      let onTime = 0;
      let totalDuration = 0;
  
      deliveredOrders.forEach((order) => {
        const deadline = new Date(order.delivery_deadline);
        const deliveredAt = new Date(order.delivered_at);
        const orderPlaced = new Date(order.order_time);
  
        // On-time delivery check
        if (!isNaN(deliveredAt) && !isNaN(deadline) && deliveredAt <= deadline) {
          onTime++;
        }
  
        // Duration calculation only if valid
        if (!isNaN(deliveredAt) && !isNaN(orderPlaced)) {
          const duration = (deliveredAt - orderPlaced) / 60000; // in minutes
          totalDuration += duration;
        }
      });
      console.log('deliveredOrders:', deliveredOrders);
  
      res.json({
        summary: {
          total,
          onTimeRate: total > 0 ? Math.round((onTime / total) * 100) : 0,
          avgDeliveryMins: total > 0 ? Math.round(totalDuration / total) : 0,
        },
        orders: deliveredOrders,
      });
    } catch (err) {
      console.error('[getDeliveryHistory] Error:', err);
      res.status(500).json({ error: 'Failed to fetch delivery history' });
    }
  };

  exports.rejectOrder = async (req, res) => {
    try {
      const orderId = req.params.id;
  
      const order = await Order.findOne({ order_id: orderId });
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      // If the driver already accepted it, allow them to release it
      order.driver_id = null;
      order.status = 'pending';
  
      await order.save();
  
      res.json({ message: 'Order rejected/cancelled successfully', order });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to reject order' });
    }
  };
  
  
