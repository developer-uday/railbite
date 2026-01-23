import Counter from "../models/Counter.js";

/**
 * Get next sequential number for a given counter
 * @param {String} counterName - Name of the counter (e.g., 'orderId')
 * @returns {Promise<Number>} - Next sequence number
 */
export const getNextSequence = async (counterName) => {
  try {
    const counter = await Counter.findOneAndUpdate(
      { name: counterName },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );
    return counter.sequence_value;
  } catch (err) {
    console.error('Error getting next sequence:', err);
    throw err;
  }
};

/**
 * Generate formatted order ID
 * @returns {Promise<String>} - Formatted order ID (e.g., ORD-000001)
 */
export const generateOrderId = async () => {
  const nextNum = await getNextSequence("orderId");
  return `${String(nextNum).padStart(6, "0")}`;
};
