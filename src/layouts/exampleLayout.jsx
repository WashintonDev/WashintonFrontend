import React from 'react';

const MainLayout = ({ children }) => {
  return (
    <div>
      <header>
        <h1>Mi Aplicación</h1>
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/Login">Sing in</a></li>
          </ul>
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <p>&copy; 2024 Mi Empresa</p>
      </footer>
    </div>
  );
};

export default MainLayout;
