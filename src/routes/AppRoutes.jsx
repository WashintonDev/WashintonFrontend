// src/routes/AppRoutes.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/exampleLayout';
import Home from '../pages/Home/Home';
import About from '../pages/About/About';
import Login from '../components/login';

const AppRoutes = () => (
  <Router>
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        
      </Routes>
    </MainLayout>
  </Router>
);

export default AppRoutes;