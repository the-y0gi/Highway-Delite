import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import DetailsPage from './pages/DetailsPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ConfirmedPage from './pages/ConfirmedPage.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/experience/:id" element={<DetailsPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/confirmed" element={<ConfirmedPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;