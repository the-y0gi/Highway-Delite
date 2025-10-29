import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { experiencesAPI } from '../services/api';

const HomePage = () => {
  const [experiences, setExperiences] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch experiences from API
  const fetchExperiences = async (search = '') => {
    try {
      setLoading(true);
      const response = await experiencesAPI.getAll(search);
      if (response.data.success) {
        setExperiences(response.data.data);
      } else {
        setError('Failed to fetch experiences');
      }
    } catch (err) {
      setError('Error loading experiences. Please try again.');
      console.error('Error fetching experiences:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchExperiences();
  }, []);

  // Search functionality
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchExperiences(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleViewDetails = (expId) => {
    navigate(`/experience/${expId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="flex justify-center items-center min-h-96">
          <div className="text-lg">Loading experiences...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div className="flex flex-col justify-center items-center min-h-96">
          <div className="text-lg text-red-500 mb-4">{error}</div>
          <button
            onClick={() => fetchExperiences()}
            className="bg-yellow-400 hover:bg-yellow-500 px-6 py-2 rounded-lg font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {experiences.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">
              {searchQuery ? `No experiences found for "${searchQuery}"` : 'No experiences available'}
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 text-yellow-600 hover:text-yellow-700 font-semibold"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {searchQuery ? `Search results for "${searchQuery}"` : 'All Experiences'}
              </h1>
              <p className="text-gray-600 mt-2">
                {experiences.length} experience{experiences.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {experiences.map((exp) => (
                <div key={exp._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition">
                  <img src={exp.image} alt={exp.title} className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg">{exp.title}</h3>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{exp.location}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{exp.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-500">From </span>
                        <span className="font-bold text-lg">₹{exp.price}</span>
                      </div>
                      <button
                        onClick={() => handleViewDetails(exp._id)}
                        className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-lg text-sm font-semibold transition"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default HomePage;