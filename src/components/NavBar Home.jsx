import React from 'react'; 
import { Link } from 'react-router-dom';
import { Dropdown, Menu, Button, Input } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { signOut } from "firebase/auth";
import logo from "../assets/images/logowashsmall.png";
import { auth } from '../pages/login/firebaseConfig'; // Asegúrate de importar tu configuración de Firebase
import { useNavigate } from "react-router-dom"; // Para la navegación

const NavBarHome = ({ title, onSearch, showSearch = true }) => {
    const navigate = useNavigate(); // Hook de navegación para redirigir a la página de login

    const handleLogout = async () => {
        try {
            await signOut(auth); // Firebase sign out
            localStorage.removeItem("user"); // Eliminar usuario del localStorage
            navigate('/login'); // Redirige a la página de login
        } catch (error) {
            console.error('Error logging out', error);
        }
    };

    const settingsMenu = (
        <Menu>
            <Menu.Item 
                key="profile" 
                icon={<UserOutlined />} 
                onClick={() => navigate('/profile')}
            >
                Profile
            </Menu.Item>
            <Menu.Item 
                key="settings" 
                icon={<SettingOutlined />} 
                onClick={() => navigate('/settings')}
            >
                Settings
            </Menu.Item>
            <Menu.Item 
                key="logout" 
                icon={<LogoutOutlined />} 
                onClick={handleLogout}
            >
                Log Out
            </Menu.Item>
        </Menu>
    );

    return (
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
            {/* Logo en lugar del título */}
            <div style={{ marginRight: '20px' }}>
                <img src={logo} alt="Logo" style={{ height: '40px' }} />
            </div>
            
            {/* Barra de búsqueda fija */}
            {showSearch && (
                <Input.Search
                    placeholder="Buscar..."
                    onChange={e => onSearch(e.target.value)} 
                    style={{ width: 200, marginLeft: '20px' }}
                />
            )}

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                <Dropdown overlay={settingsMenu} placement="bottomLeft" trigger={['click']}>
                    <Button icon={<UserOutlined />} style={{ marginLeft: '10px' }}>
                        Profile
                    </Button>
                </Dropdown>
            </div>
        </div>
    );
};

export default NavBarHome;
