const express = require('express');
const router = express.Router();
const Experience = require('../models/Experience');

// GET all experiences with search
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search && search.trim()) {
      query = {
        $or: [
          { title: { $regex: search.trim(), $options: 'i' } },
          { location: { $regex: search.trim(), $options: 'i' } }
        ]
      };
    }
    
    const experiences = await Experience.find(query).select('-timeSlots');
    res.json({
      success: true,
      data: experiences,
      count: experiences.length
    });
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching experiences' 
    });
  }
});

// GET single experience with availability
router.get('/:id', async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ 
        success: false, 
        message: 'Experience not found' 
      });
    }
    
    res.json({
      success: true,
      data: experience
    });
  } catch (error) {
    console.error('Error fetching experience:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching experience' 
    });
  }
});

// Check availability for specific date-time
router.get('/:id/availability', async (req, res) => {
  try {
    const { date, time } = req.query;
    
    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Date and time are required'
      });
    }

    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ 
        success: false, 
        message: 'Experience not found' 
      });
    }

    const availability = experience.checkAvailability(date, time, 1);
    
    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while checking availability' 
    });
  }
});

module.exports = router;