// src/components/Footer/Footer.jsx
import React from 'react';
import { Layout, Row, Col, Typography, Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/login.css';

const { Footer } = Layout;
const { Text, Link } = Typography;

const AppFooter = () => {
    const navigate = useNavigate();

    const goToHome = () => {
        navigate('/');
    };

    return (
        <Footer className="footer">
            <Row justify="space-between" align="middle">
                <Col xs={24} sm={8}>
                    <Button
                        type="link"
                        icon={<HomeOutlined />}
                        onClick={goToHome}
                    >
                        Volver al Inicio
                    </Button>
                </Col>

                <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                    <Text>© 2024 Washinton</Text>
                </Col>

                <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
                    <Link href="/privacy-policy" className="footer-link">
                        Política de Privacidad
                    </Link>
                    <Link href="/terms" className="footer-link">
                        Términos y Condiciones
                    </Link>
                </Col>
            </Row>
        </Footer>
    );
};

export default AppFooter;