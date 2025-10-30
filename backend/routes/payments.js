
const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/booking');
const Experience = require('../models/Experience');
const Payment = require('../models/payment');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// POST create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, bookingRef } = req.body;
    
    if (!amount || !bookingRef) {
      return res.status(400).json({
        success: false,
        message: 'Amount and booking reference are required'
      });
    }

    // Verify booking exists and is pending
    const booking = await Booking.findOne({ bookingRef, status: 'pending' });
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or already processed'
      });
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `receipt_${bookingRef}`,
      notes: {
        bookingRef: bookingRef
      }
    };
    
    const order = await razorpay.orders.create(options);
    
    // Update booking with Razorpay order ID
    booking.razorpayOrderId = order.id;
    await booking.save();
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating payment order' 
    });
  }
});

// POST verify payment and confirm booking
router.post('/verify', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingRef } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingRef) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'All payment details are required'
      });
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');
    
    if (generatedSignature !== razorpay_signature) {
      await session.abortTransaction();
      
      // Update booking status to payment failed
      await Booking.findOneAndUpdate(
        { bookingRef },
        { status: 'payment_failed' },
        { session }
      );
      
      return res.status(400).json({ 
        success: false, 
        message: 'Payment verification failed' 
      });
    }

    // Get booking with session
    const booking = await Booking.findOne({ bookingRef }).session(session);
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Check availability again before confirming
    const experience = await Experience.findById(booking.experience).session(session);
    const availability = experience.checkAvailability(booking.date, booking.time, booking.quantity);
    
    if (!availability.available) {
      await session.abortTransaction();
      
      // Refund payment (in real scenario)
      await Booking.findOneAndUpdate(
        { bookingRef },
        { status: 'payment_failed' },
        { session }
      );
      
      return res.status(400).json({
        success: false,
        message: 'Slots no longer available. Payment will be refunded.'
      });
    }

    // Book the slots
    await experience.bookSlots(booking.date, booking.time, booking.quantity);

    // Update booking status
    booking.status = 'confirmed';
    await booking.save({ session });

    // Create payment record
    const payment = new Payment({
      booking: booking._id,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpaySignature: razorpay_signature,
      amount: booking.total,
      status: 'captured'
    });
    
    await payment.save({ session });

    await session.commitTransaction();
    
    res.json({ 
      success: true, 
      message: 'Payment verified and booking confirmed successfully',
      data: {
        bookingRef: booking.bookingRef,
        status: booking.status
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while verifying payment' 
    });
  } finally {
    session.endSession();
  }
});


module.exports = router;