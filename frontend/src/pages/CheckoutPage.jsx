import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import { bookingsAPI, paymentsAPI } from '../services/api';

// Load Razorpay script
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { experience, quantity, date, time, subtotal, tax, total } = location.state || {};

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    promoCode: '',
    agreed: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    if (!formData.agreed || !formData.fullName || !formData.email) {
      setError('Please fill all required fields and agree to terms');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 1. Create booking
      const bookingData = {
        experienceId: experience._id,
        fullName: formData.fullName,
        email: formData.email,
        date: date,
        time: time,
        quantity: quantity,
        subtotal: subtotal,
        tax: tax,
        total: total
      };

      const bookingResponse = await bookingsAPI.create(bookingData);
      
      if (!bookingResponse.data.success) {
        throw new Error(bookingResponse.data.message || 'Failed to create booking');
      }

      const booking = bookingResponse.data.data;
      const bookingRef = booking.bookingRef;

      // 2. Create Razorpay order
      const orderResponse = await paymentsAPI.createOrder({
        amount: total,
        bookingRef: bookingRef
      });

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || 'Failed to create payment order');
      }

      const order = orderResponse.data.data;

      // 3. Load Razorpay
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        throw new Error('Razorpay SDK failed to load');
      }

      // 4. Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Highway Delite',
        description: `Booking for ${experience.title}`,
        image: '/logo.png',
        order_id: order.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await paymentsAPI.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingRef: bookingRef
            });

            if (verifyResponse.data.success) {
              navigate('/confirmed', {
                state: {
                  bookingRef: bookingRef,
                  experience: experience,
                  quantity: quantity,
                  date: date,
                  time: time,
                  total: total
                }
              });
            } else {
              throw new Error(verifyResponse.data.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setError('Payment verification failed. Please contact support.');
            setLoading(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
        },
        notes: {
          bookingRef: bookingRef,
          experience: experience.title
        },
        theme: {
          color: '#F59E0B'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      razorpay.open();
      setLoading(false);

    } catch (error) {
      console.error('Payment process error:', error);
      setError(error.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (!experience) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-lg text-gray-600 mb-4">No booking data found.</p>
          <button
            onClick={() => navigate('/')}
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-gray-700 hover:text-black transition"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Checkout</span>
        </button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-100 rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Personal Information</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Full name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="test@test.com"
                    className="w-full px-4 py-3 bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">Promo code (optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.promoCode}
                    onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                    placeholder="Enter promo code"
                    className="flex-1 px-4 py-3 bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <button className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition whitespace-nowrap">
                    Apply
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreed}
                  onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 mt-1"
                  required
                />
                <span className="text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="/terms" className="text-yellow-600 hover:text-yellow-700 underline">
                    terms and conditions
                  </a>{' '}
                  and{' '}
                  <a href="/safety" className="text-yellow-600 hover:text-yellow-700 underline">
                    safety policy
                  </a>
                  <span className="text-red-500"> *</span>
                </span>
              </label>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-100 rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Booking Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Experience</span>
                  <span className="font-semibold text-right">{experience.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Location</span>
                  <span className="font-semibold">{experience.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-semibold">{new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Time</span>
                  <span className="font-semibold">{time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Quantity</span>
                  <span className="font-semibold">{quantity} person{quantity > 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="border-t border-gray-300 pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{subtotal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Taxes (5.9%)</span>
                  <span className="font-semibold">₹{tax}</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-gray-300">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading || !formData.agreed || !formData.fullName || !formData.email}
                className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed py-4 rounded-lg font-semibold transition mt-6"
              >
                {loading ? 'Processing...' : `Pay ₹${total}`}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Secure payment powered by Razorpay
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;