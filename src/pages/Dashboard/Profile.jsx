import  { useEffect, useState } from 'react';
import { Card, Avatar, Typography, Descriptions, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import NavBarHome from '../../components/NavBar Home';

const { Title } = Typography;

const Profile = () => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const user = localStorage.getItem('user');
        const role = localStorage.getItem('role');
        

        if (user && role ) {
            setUserData({
                email: user,
                role
            });
        } else {
            message.warning("No hay suficientes datos del usuario en localStorage.");
        }
    }, []);

    if (!userData) {
        return (
            <div>
                <NavBarHome />
                <div style={{ padding: '24px', textAlign: 'center' }}>
                    <p>Cargando información del perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <NavBarHome />
            <div style={{ padding: '0px', margin: '240px'}}>
                <Card>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <Avatar
                            size={64}
                            icon={<UserOutlined />}
                            style={{ backgroundColor: '#87d068' }}
                        />
                        <Title level={3} style={{ marginTop: '16px' }}>
                            {userData.email || 'Usuario'}
                        </Title>
                    </div>

                    <Descriptions bordered>
                        <Descriptions.Item label="Email" span={3}>
                            {userData.email || 'No disponible'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Role" span={3}>
                            {userData.role || 'No disponible'}
                        </Descriptions.Item> 
                    </Descriptions>
                </Card>
            </div>
        </div>
    );
};

export default Profile;