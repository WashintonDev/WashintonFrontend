// src/pages/Home/Home.jsx
import React from 'react';
import'../../assets/styles/login.css'
import NavBarHome from '../../components/NavBarHome';

const Home = () => {
  return (
    <div>
      <NavBarHome />
      <div className="home">

      <h1>Welcome to the Home Page</h1>
      <p>Here you can find the best products for your home</p>  
          </div>
      </div>
     
  );
};

export default Home;