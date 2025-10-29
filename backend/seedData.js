// const mongoose = require('mongoose');
// const Experience = require('./models/Experience');
// require('dotenv').config();

// const dates = ['2025-10-29', '2025-10-30', '2025-10-31', '2025-11-01', '2025-11-02', '2025-11-03'];
// const timeSlots = [
//   { time: '07:00 am', slots: 4 },
//   { time: '09:00 am', slots: 2 },
//   { time: '11:00 am', slots: 5 },
//   { time: '1:00 pm', slots: 3 }
// ];

// const generateTimeSlots = () => {
//   const slots = [];
//   dates.forEach(date => {
//     timeSlots.forEach(timeSlot => {
//       slots.push({
//         date: date,
//         time: timeSlot.time,
//         totalSlots: timeSlot.slots,
//         bookedSlots: 0
//       });
//     });
//   });
//   return slots;
// };

// const experiences = [
//   {
//     title: 'Kayaking',
//     location: 'Udupi',
//     price: 999,
//     image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop',
//     description: 'Curated small-group experience. Certified guide. Safety first with gear included.',
//     timeSlots: generateTimeSlots(),
//     maxQuantity: 6
//   },
//   {
//     title: 'Nandi Hills Sunrise',
//     location: 'Bangalore',
//     price: 899,
//     image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
//     description: 'Curated small-group experience. Certified guide. Safety first with gear included.',
//     timeSlots: generateTimeSlots(),
//     maxQuantity: 8
//   },
//   {
//     title: 'Coffee Trail',
//     location: 'Coorg',
//     price: 1299,
//     image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop',
//     description: 'Curated small-group experience. Certified guide. Safety first with gear included.',
//     timeSlots: generateTimeSlots(),
//     maxQuantity: 10
//   },
//   {
//     title: 'Kayaking',
//     location: 'Udupi, Karnataka',
//     price: 999,
//     image: 'https://images.unsplash.com/photo-1604438888344-c9eb4783609b?w=600&h=400&fit=crop',
//     description: 'Curated small-group experience. Certified guide. Safety first with gear included.',
//     timeSlots: generateTimeSlots(),
//     maxQuantity: 6
//   },
//   {
//     title: 'Nandi Hills Sunrise',
//     location: 'Bangalore',
//     price: 899,
//     image: 'https://images.unsplash.com/photo-1540206395-68808572332f?w=600&h=400&fit=crop',
//     description: 'Curated small-group experience. Certified guide. Safety first with gear included.',
//     timeSlots: generateTimeSlots(),
//     maxQuantity: 8
//   },
//   {
//     title: 'Boat Cruise',
//     location: 'Sunderban',
//     price: 999,
//     image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=600&h=400&fit=crop',
//     description: 'Curated small-group experience. Certified guide. Safety first with gear included.',
//     timeSlots: generateTimeSlots(),
//     maxQuantity: 12
//   },
//   {
//     title: 'Bunjee Jumping',
//     location: 'Manali',
//     price: 999,
//     image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&h=400&fit=crop',
//     description: 'Curated small-group experience. Certified guide. Safety first with gear included.',
//     timeSlots: generateTimeSlots(),
//     maxQuantity: 4
//   },
//   {
//     title: 'Coffee Trail',
//     location: 'Coorg',
//     price: 1299,
//     image: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=600&h=400&fit=crop',
//     description: 'Curated small-group experience. Certified guide. Safety first with gear included.',
//     timeSlots: generateTimeSlots(),
//     maxQuantity: 10
//   }
// ];

// const seedDatabase = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log('Connected to MongoDB');
    
//     await Experience.deleteMany({});
//     console.log('Cleared existing experiences');
    
//     await Experience.insertMany(experiences);
//     console.log('Database seeded successfully with 8 experiences');
    
//     // Verify inserted data
//     const count = await Experience.countDocuments();
//     console.log(`Total experiences in database: ${count}`);
    
//     // Show sample data
//     const sampleExp = await Experience.findOne();
//     console.log('\nSample Experience Time Slots:');
//     sampleExp.timeSlots.slice(0, 5).forEach(slot => {
//       console.log(`Date: ${slot.date}, Time: ${slot.time}, Slots: ${slot.totalSlots}`);
//     });
    
//     process.exit();
//   } catch (error) {
//     console.error('Error seeding database:', error);
//     process.exit(1);
//   }
// };

// seedDatabase();