import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Calendar, Clock, Users, MapPin } from 'lucide-react';
import Header from '../components/Header';
import { bookingsAPI } from '../services/api';

const ConfirmedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const bookingRef = location.state?.bookingRef;

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingRef) {
        setLoading(false);
        return;
      }

      try {
        const response = await bookingsAPI.getByRef(bookingRef);
        if (response.data.success) {
          setBooking(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingRef]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleViewBooking = () => {
    // Could navigate to a booking details page in future
    alert(`Booking Reference: ${booking?.bookingRef}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center min-h-96">
          <div className="text-lg">Loading booking details...</div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col justify-center items-center min-h-96">
          <div className="text-lg text-red-500 mb-4">Booking not found</div>
          <button
            onClick={handleBackToHome}
            className="bg-yellow-400 hover:bg-yellow-500 px-6 py-2 rounded-lg font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-white" strokeWidth={3} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-lg text-gray-600 mb-4">
              Thank you for your booking. Your adventure awaits!
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 inline-block">
              <p className="text-sm font-semibold text-yellow-800">
                Booking Reference: <span className="font-mono">{booking.bookingRef}</span>
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Booking Details</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold">
                      {new Date(booking.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-semibold">{booking.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Participants</p>
                    <p className="font-semibold">{booking.quantity} person{booking.quantity > 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Experience Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Experience</p>
                  <p className="font-semibold text-lg">{booking.experience.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold">{booking.experience.location}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="text-gray-700">{booking.experience.description}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
            <ul className="text-green-700 space-y-1 text-sm">
              <li>• You will receive a confirmation email shortly</li>
              <li>• Please arrive 15 minutes before your scheduled time</li>
              <li>• Bring a valid ID for verification</li>
              <li>• Contact support if you have any questions</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleViewBooking}
              className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              View Booking Details
            </button>
            <button
              onClick={handleBackToHome}
              className="bg-yellow-400 hover:bg-yellow-500 px-8 py-3 rounded-lg font-semibold transition"
            >
              Book Another Experience
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConfirmedPage;