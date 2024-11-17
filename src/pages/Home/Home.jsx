import  { useState } from 'react';
import NavBarHome from '../../components/NavBarHome';
import '../../assets/styles/login.css';

const Home = () => {
    const [collapsed, setCollapsed] = useState(true);
  

    return (
        <div>
            <NavBarHome collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className={`home ${collapsed ? 'collapsed' : ''}`}>
                <h1>Welcome to the Home Page</h1>
                <p>Here you can find the best products for your home</p>
            </div>
        </div>
    );
};

export default Home;
