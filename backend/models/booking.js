const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  experience: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Experience',
    required: true
  },
  bookingRef: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { 
    type: String, 
    required: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  date: { type: String, required: true },
  time: { type: String, required: true },
  quantity: { 
    type: Number, 
    required: true,
    min: [1, 'Quantity must be at least 1'],
    max: [10, 'Cannot book more than 10 tickets']
  },
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'payment_failed'],
    default: 'pending'
  },
  razorpayOrderId: String,
  createdAt: { type: Date, default: Date.now }
});

// Generate booking reference before save
bookingSchema.pre('save', function(next) {
  if (!this.bookingRef) {
    this.bookingRef = 'HUF' + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);