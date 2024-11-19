import React, { useEffect, useState } from 'react';
import { Card, Avatar, Typography, Descriptions } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import NavBarHome from '../../components/NavBarHome';

const { Title } = Typography;

const Profile = () => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        // Obtener los datos del usuario desde localStorage
        const userString = localStorage.getItem('user');
        if (userString) {
            try {
                const user = JSON.parse(userString);
                setUserData(user); // Guardamos el objeto de usuario
            } catch (error) {
                console.error("Error al parsear los datos del usuario:", error);
            }
        }
    }, []);

    if (!userData) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <NavBarHome />
            <div style={{ padding: '24px' }}>
                <Card>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <Avatar
                            size={64}
                            src={userData.photoURL}
                            icon={!userData.photoURL && <UserOutlined />}
                        />
                        <Title level={3} style={{ marginTop: '16px' }}>
                            {userData.displayName || userData.email}
                        </Title>
                    </div>

                    <Descriptions bordered>
                        <Descriptions.Item label="Email" span={3}>
                            {userData.email}
                        </Descriptions.Item>
                        <Descriptions.Item label="Firebase User ID" span={3}>
                            {userData.firebase_user_ID || 'N/A'} {/* Aquí mostramos el ID de Firebase */}
                        </Descriptions.Item>
                        <Descriptions.Item label="Role" span={3}>
                            {userData.isAdmin ? 'Administrator' : 'User'}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
