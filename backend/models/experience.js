const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, required: true },
  totalSlots: { type: Number, required: true },
  bookedSlots: { type: Number, default: 0 }
});

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  timeSlots: [timeSlotSchema],
  maxQuantity: { type: Number, default: 10 }
});

// Check availability method
experienceSchema.methods.checkAvailability = function(date, time, quantity) {
  const slot = this.timeSlots.find(s => s.date === date && s.time === time);
  if (!slot) return { available: false, message: 'Slot not found' };
  
  const availableSlots = slot.totalSlots - slot.bookedSlots;
  return {
    available: availableSlots >= quantity,
    availableSlots,
    required: quantity
  };
};

// Book slots method
experienceSchema.methods.bookSlots = function(date, time, quantity) {
  const slot = this.timeSlots.find(s => s.date === date && s.time === time);
  if (!slot) throw new Error('Slot not found');
  
  if (slot.bookedSlots + quantity > slot.totalSlots) {
    throw new Error('Not enough slots available');
  }
  
  slot.bookedSlots += quantity;
  return this.save();
};

module.exports = mongoose.model('Experience', experienceSchema);