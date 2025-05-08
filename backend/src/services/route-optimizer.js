function prioritizeDeliveries(orders) {
    return orders
      .map(order => {
        let score = 0;
        if (order.delivery_priority === 'High') score += 10;
        if (order.product_type.toLowerCase().includes('ice')) score += 5;
  
        const deadline = new Date(order.delivery_deadline);
        const now = new Date();
        const minutesLeft = (deadline - now) / 60000;
        score -= minutesLeft / 15;
  
        return { ...order._doc, score };
      })
      .sort((a, b) => b.score - a.score);
  }
  
  module.exports = { prioritizeDeliveries };