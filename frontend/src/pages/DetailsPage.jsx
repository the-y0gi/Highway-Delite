import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import Header from '../components/Header';
import { experiencesAPI } from '../services/api';

const DetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experience, setExperience] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);

  // Fetch experience details
  useEffect(() => {
    const fetchExperience = async () => {
      try {
        setLoading(true);
        const response = await experiencesAPI.getById(id);
        if (response.data.success) {
          const exp = response.data.data;
          setExperience(exp);
          
          // Extract unique dates from timeSlots
          const dates = [...new Set(exp.timeSlots.map(slot => slot.date))];
          setSelectedDate(dates[0]);
          
          // Set initial time slots for first date
          updateTimeSlots(exp.timeSlots, dates[0]);
        } else {
          setError('Experience not found');
        }
      } catch (err) {
        setError('Error loading experience details');
        console.error('Error fetching experience:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchExperience();
    }
  }, [id]);

  // Update time slots when date changes
  const updateTimeSlots = (timeSlots, date) => {
    const slotsForDate = timeSlots
      .filter(slot => slot.date === date)
      .map(slot => ({
        time: slot.time,
        availableSlots: slot.totalSlots - slot.bookedSlots,
        soldOut: (slot.totalSlots - slot.bookedSlots) === 0
      }));
    setAvailableSlots(slotsForDate);
    setSelectedTime(slotsForDate.find(slot => !slot.soldOut)?.time || '');
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    updateTimeSlots(experience.timeSlots, date);
  };

  const TAX_RATE = 0.059;

  const calculateTotal = () => {
    const subtotal = experience ? experience.price * quantity : 0;
    const tax = Math.round(subtotal * TAX_RATE);
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleConfirm = () => {
    const selectedSlot = availableSlots.find(slot => slot.time === selectedTime);
    
    if (!selectedSlot || selectedSlot.soldOut) {
      alert('Please select an available time slot');
      return;
    }

    if (quantity > selectedSlot.availableSlots) {
      alert(`Only ${selectedSlot.availableSlots} slots available for selected time`);
      return;
    }

    navigate('/checkout', {
      state: {
        experience,
        quantity,
        date: selectedDate,
        time: selectedTime,
        ...calculateTotal()
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center min-h-96">
          <div className="text-lg">Loading experience details...</div>
        </div>
      </div>
    );
  }

  if (error || !experience) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col justify-center items-center min-h-96">
          <div className="text-lg text-red-500 mb-4">{error || 'Experience not found'}</div>
          <button
            onClick={() => navigate('/')}
            className="bg-yellow-400 hover:bg-yellow-500 px-6 py-2 rounded-lg font-semibold"
          >
            Back to Experiences
          </button>
        </div>
      </div>
    );
  }

  // Get unique dates
  const dates = [...new Set(experience.timeSlots.map(slot => slot.date))];
  const { subtotal, tax, total } = calculateTotal();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-gray-700 hover:text-black transition"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Details</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <img
              src={experience.image}
              alt={experience.title}
              className="w-full h-96 object-cover rounded-2xl mb-6"
            />
            
            <h1 className="text-3xl font-bold mb-4">{experience.title}</h1>
            <p className="text-gray-600 mb-8">
              {experience.description} Helmet and Life jackets along with an expert will accompany in Kayaking.
            </p>

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Choose date</h2>
              <div className="flex flex-wrap gap-3">
                {dates.map((date) => (
                  <button
                    key={date}
                    onClick={() => handleDateSelect(date)}
                    className={`px-6 py-3 rounded-lg font-semibold transition ${
                      selectedDate === date
                        ? 'bg-yellow-400 text-black'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {new Date(date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Choose time</h2>
              <div className="flex flex-wrap gap-3">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => !slot.soldOut && setSelectedTime(slot.time)}
                    disabled={slot.soldOut}
                    className={`px-6 py-3 rounded-lg font-semibold transition relative ${
                      slot.soldOut
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : selectedTime === slot.time
                        ? 'bg-white border-2 border-black text-black'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {slot.time}
                    {!slot.soldOut && (
                      <span className="ml-2 text-xs text-red-500">
                        {slot.availableSlots} left
                      </span>
                    )}
                    {slot.soldOut && (
                      <span className="ml-2 text-xs">Sold out</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-100 rounded-2xl p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">Starts at</span>
                <span className="text-2xl font-bold">₹{experience.price}</span>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-full hover:bg-gray-200 transition"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-bold w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-full hover:bg-gray-200 transition"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₹{subtotal}</span>
              </div>

              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-300">
                <span className="text-gray-600">Taxes</span>
                <span className="font-semibold">₹{tax}</span>
              </div>

              <div className="flex items-center justify-between mb-6">
                <span className="text-xl font-bold">Total</span>
                <span className="text-2xl font-bold">₹{total}</span>
              </div>

              <button
                onClick={handleConfirm}
                disabled={!selectedTime || availableSlots.find(s => s.time === selectedTime)?.soldOut}
                className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetailsPage;