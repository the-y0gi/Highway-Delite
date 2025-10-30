const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const Experience = require('../models/experience');


// POST create booking with availability check - 
router.post('/', async (req, res) => {
  try {
    const { experienceId, fullName, email, date, time, quantity, subtotal, tax, total } = req.body;
    
    // Validate required fields
    if (!experienceId || !fullName || !email || !date || !time || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check experience exists
    const experience = await Experience.findById(experienceId);
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }

    // Check availability
    const availability = experience.checkAvailability(date, time, quantity);
    if (!availability.available) {
      return res.status(400).json({
        success: false,
        message: `Only ${availability.availableSlots} slots available for selected time`
      });
    }

    // Validate date (should not be in past)
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book for past dates'
      });
    }

    // MANUALLY GENERATE bookingRef
    const bookingRef = 'HUF' + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Create booking
    const booking = new Booking({
      experience: experienceId,
      bookingRef: bookingRef, // Explicitly set bookingRef
      fullName: fullName.trim(),
      email: email.trim(),
      date,
      time,
      quantity,
      subtotal,
      tax,
      total
    });

    await booking.save();
    
    // Populate experience details for response
    await booking.populate('experience');
    
    res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: errors.join(', ')
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating booking' 
    });
  }
});

// GET booking by reference
router.get('/:ref', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingRef: req.params.ref })
      .populate('experience');
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching booking' 
    });
  }
});

// Cancel booking
router.put('/:ref/cancel', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingRef: req.params.ref });
    
    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed bookings can be cancelled'
      });
    }

    // Free up slots
    const experience = await Experience.findById(booking.experience);
    if (experience) {
      const slot = experience.timeSlots.find(s => 
        s.date === booking.date && s.time === booking.time
      );
      if (slot) {
        slot.bookedSlots = Math.max(0, slot.bookedSlots - booking.quantity);
        await experience.save();
      }
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while cancelling booking' 
    });
  }
});

module.exports = router;