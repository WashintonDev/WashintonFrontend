import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Layout,
  Typography,
  Row,
  Col,
  Avatar,
  Dropdown,
  Menu,
  Input,
  Spin,
  Alert,
  Table,
  Card,
} from "antd";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserOutlined,
  TeamOutlined,
  ShopOutlined,
  SettingOutlined,
  LogoutOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import {
  API_URL_USERS,
  API_URL_ROLES,
  API_URL_STORES,
  API_URL_PRODUCT_BATCH,
  API_URL_BATCH,
} from "@/services/ApisConfig";
import StatCard from "../../components/StatCard";
import ChartContainer from "../../components/ChartContainer";
import SideBarAdmin from '../../components/SideBarAdmin'; // Asegúrate de que esta ruta es correcta

const { Header, Content } = Layout;
const { Title } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    activeAdmins: 0,
    storesCount: 0,
    productBatchData: [],
  });
  const [selectedChart, setSelectedChart] = useState('bar');
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, rolesRes, storesRes, productBatchRes, batchesRes] = await Promise.all([
          axios.get(API_URL_USERS),
          axios.get(API_URL_ROLES),
          axios.get(API_URL_STORES),
          axios.get(API_URL_PRODUCT_BATCH),
          axios.get(API_URL_BATCH),
        ]);

        const totalUsers = usersRes.data.length;
        const adminRole = rolesRes.data.find(role => role.name === 'admin');
        const activeAdmins = adminRole
          ? usersRes.data.filter(user => user.role_id === adminRole.role_id && user.status === 'active').length
          : 0;
        const storesCount = storesRes.data.length;

        const receivedBatches = batchesRes.data.filter(batch => batch.status === 'received').map(batch => batch.batch_id);
        const productBatchData = productBatchRes.data
          .filter(item => receivedBatches.includes(item.batch_id))
          .map(item => ({
            batch_name: item.batch.batch_name,
            quantity: item.quantity,
            product_name: item.product.name,
            value: item.quantity * item.product.price,
          }))
          .filter(item => item.quantity !== null && item.value !== null);

        setDashboardData({
          totalUsers,
          activeAdmins,
          storesCount,
          productBatchData: productBatchData.length ? productBatchData : [],
        });
        setLoading(false);
        setChartKey(prevKey => prevKey + 1);
      } catch (error) {
        console.error("Error fetching data", error);
        setError("Failed to fetch dashboard data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const userMenu = (
    <Menu>
      <Menu.Item key="1" icon={<SettingOutlined />}>
        Settings
      </Menu.Item>
      <Menu.Item key="2" icon={<LogoutOutlined />}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: 'Batch Name',
      dataIndex: 'batch_name',
      key: 'batch_name',
    },
    {
      title: 'Product Name',
      dataIndex: 'product_name',
      key: 'product_name',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (value) => `$${value.toFixed(2)}`,
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <SideBarAdmin />
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Title level={3} style={{ margin: 0 }}>Inventory Management Dashboard</Title>
            <Input.Search 
              placeholder="Search..." 
              style={{ width: 300 }} 
              onSearch={value => console.log(value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Dropdown overlay={userMenu} placement="bottomRight" arrow>
              <Avatar style={{ backgroundColor: '#1890ff', cursor: 'pointer' }} icon={<UserOutlined />} />
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: '4px' }}>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={24} md={12} lg={6}>
                  <StatCard
                    title="Total Registered Users"
                    value={dashboardData.totalUsers}
                    icon={<UserOutlined />}
                    color="#52c41a"
                  />
                </Col>
                <Col xs={24} sm={24} md={12} lg={6}>
                  <StatCard
                    title="Active System Administrators"
                    value={dashboardData.activeAdmins}
                    icon={<TeamOutlined />}
                    color="#f5222d"
                  />
                </Col>
                <Col xs={24} sm={24} md={12} lg={6}>
                  <StatCard
                    title="Registered Store Locations"
                    value={dashboardData.storesCount}
                    icon={<ShopOutlined />}
                    color="#1890ff"
                  />
                </Col>
                <Col xs={24} sm={24} md={12} lg={6}>
                  <StatCard
                    title="Total Inventory Value"
                    value={dashboardData.productBatchData.reduce((sum, item) => sum + item.value, 0).toFixed(2)}
                    icon={<DollarOutlined />}
                    color="#faad14"
                    prefix="$"
                  />
                </Col>
              </Row>
            </motion.div>
          </AnimatePresence>
          <Card title="Product Batch Analysis" style={{ marginTop: 24 }}>
            <ChartContainer
              key={chartKey}
              data={dashboardData.productBatchData}
              selectedChart={selectedChart}
              setSelectedChart={setSelectedChart}
            />
          </Card>
          <Card title="Product Batch Details" style={{ marginTop: 24 }}>
            <Table 
              columns={columns} 
              dataSource={dashboardData.productBatchData} 
              rowKey="batch_name" 
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;