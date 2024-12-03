import React from 'react';
import { Layout, Menu, Button, Card, Typography, Row, Col, Dropdown } from 'antd';
import { BarChartOutlined, BoxPlotOutlined, ClockCircleOutlined, MobileOutlined, CarOutlined, TeamOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useLogout from '../../hooks/Logout';
import '../../assets/styles/Home.css';
import Image from '../../assets/images/inventoryWarehouse.webp';
import Logo from '../../assets/images/logowashsmall.png';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

export default function Home() {
  const logout = useLogout();

  const settingsMenu = (
    <Menu>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Header
        style={{
          position: 'fixed',
          width: '100%',
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="logo" style={{ float: 'left' }}>
          <img
            src={Logo}
            alt="Washinton Logo"
            style={{ height: '55px', width: 'auto' }}
          />
        </div>
        <Menu mode="horizontal" style={{ float: 'right', borderBottom: 0 }}>
          <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout}>
            Log Out
          </Menu.Item>
        </Menu>
      </Header>

      <Content style={{ paddingTop: '64px' }}>
        <section
          className="hero-section"
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: 'white',
            backgroundImage: `url(${Image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', filter: 'blur(5px)' }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Title level={1} className="hero-title" style={{ color: 'white', fontSize: '3em', fontWeight: 'bold' }}>
              Washinton
            </Title>
            <Paragraph className="hero-paragraph" style={{ color: 'white', fontSize: '1.5em'}}>
              The ultimate solution for managing cleaning inventory. Optimize your business today!
            </Paragraph>
            <Button
              type="primary"
              size="large"
              className="hero-button"
              style={{ backgroundColor: '#27408b', borderColor: '#27408b', fontSize: '1.2em', padding: '10px 20px' }}
              onClick={() => window.location.href = '/inventory'}
            >
              Get Started
            </Button>
          </div>
        </section>

        <section id="features" className="features-section" style={{ padding: '60px 20px', backgroundColor: '#f8f9fa' }}>
          <Title level={2} className="section-title" style={{ color: '#4169e1', fontSize: '2em', fontWeight: 'bold' }}>
            Main Features
          </Title>
          <Row gutter={[24, 24]}>
            <FeatureCard
              icon={<BoxPlotOutlined className="feature-icon" style={{ color: '#4169e1', fontSize: '2em' }} />}
              title="Product Catalog"
              description="Create and manage a complete list of cleaning products with detailed information."
            />
            <FeatureCard
              icon={<BarChartOutlined className="feature-icon" style={{ color: '#4169e1', fontSize: '2em' }} />}
              title="Real-Time Stock Management"
              description="Monitor the quantity of products in the warehouse with real-time updates."
            />
            <FeatureCard
              icon={<CarOutlined className="feature-icon" style={{ color: '#4169e1', fontSize: '2em' }} />}
              title="Product Transfer"
              description="Efficiently manage the transfer of products from the main warehouse to the stores."
            />
            <FeatureCard
              icon={<ClockCircleOutlined className="feature-icon" style={{ color: '#4169e1', fontSize: '2em' }} />}
              title="Automatic Alerts"
              description="Receive notifications about low inventory levels."
            />
            <FeatureCard
              icon={<MobileOutlined className="feature-icon" style={{ color: '#4169e1', fontSize: '2em' }} />}
              title="Mobile Integration"
              description="Scan SKUs, order codes, and make the most of the mobile camera."
            />
            <FeatureCard
              icon={<TeamOutlined className="feature-icon" style={{ color: '#4169e1', fontSize: '2em' }} />}
              title="Wearable Integration"
              description="Measure the efficiency of cleaning staff and notify new job proposals."
            />
          </Row>
        </section>

        <section id="about" className="about-section" style={{ padding: '60px 20px', backgroundColor: '#ffffff' }}>
          <Title level={2} className="section-title" style={{ color: '#4169e1', fontSize: '2em', fontWeight: 'bold' }}>
            About Washinton
          </Title>
          <Paragraph className="about-paragraph" style={{ fontSize: '1.2em' }}>
            Washinton is a comprehensive solution designed to optimize inventory management in the cleaning sector. Our system allows centralized stock control, facilitating decision-making and improving operational efficiency across multiple locations.
          </Paragraph>
        </section>
      </Content>
    </Layout>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <Col xs={24} sm={12} lg={8}>
      <Card
        hoverable
        className="feature-card"
        style={{ borderColor: '#4169e1', borderRadius: '10px', overflow: 'hidden' }}
      >
        <div className="feature-icon-container" style={{ textAlign: 'center', marginBottom: '20px' }}>
          {icon}
        </div>
        <Title level={4} className="feature-title" style={{ color: '#4169e1', textAlign: 'center' }}>
          {title}
        </Title>
        <Paragraph className="feature-description" style={{ textAlign: 'center' }}>
          {description}
        </Paragraph>
      </Card>
    </Col>
  );
}