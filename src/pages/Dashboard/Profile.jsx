import { useEffect, useState } from 'react';
import { Layout, Card, Avatar, Typography, Descriptions, message, Row, Col } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import SideBarAdmin from '../../components/SideBarAdmin';

const { Title } = Typography;
const { Content } = Layout;

const Profile = () => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const user = localStorage.getItem('user');
        const role = localStorage.getItem('role');

        if (user && role) {
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
            <Layout style={{ minHeight: '100vh' }}>
                <SideBarAdmin />
                <Layout>
                    <Content style={{ padding: '24px', textAlign: 'center' }}>
                        <p>Cargando información del perfil...</p>
                    </Content>
                </Layout>
            </Layout>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <SideBarAdmin />
            <Layout>
                <Content style={{ padding: '24px' }}>
                    <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
                        <Col xs={24} sm={16} md={12} lg={8}>
                            <Card
                                style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
                                bodyStyle={{ padding: '24px' }}
                            >
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

                                <Descriptions bordered column={1}>
                                    <Descriptions.Item label="Email">
                                        {userData.email || 'No disponible'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Role">
                                        {userData.role || 'No disponible'}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>
                    </Row>
                </Content>
            </Layout>
        </Layout>
    );
};

export default Profile;