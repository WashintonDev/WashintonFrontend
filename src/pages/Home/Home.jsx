// src/pages/Home/Home.jsx
import React from 'react';
import'../../assets/styles/login.css'
import NavBarHome from '../../components/NavBar Home';
import SalesByStoreChart from '../Sales/SaleChart';

const Home = () => {
  return (
    <div>
      <NavBarHome />
      <div className="home">

      <h1>Welcome to the Home Page</h1>
          <SalesByStoreChart />
           </div>
      </div>
     
  );
};

export default Home;