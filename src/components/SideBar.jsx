import React, { useState } from 'react';
import { Layout, Menu, Badge } from 'antd';
import {
    FundProjectionScreenOutlined,
    SolutionOutlined,
    FormOutlined,
    ShoppingOutlined,
    UserOutlined,
    FundOutlined,
    TruckOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Sider } = Layout;

const SideBar = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Layout>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                width={250}
                style={{ height: '100vh', position: 'fixed', left: 0 }}
                expandIcon={null}
            >
                <Menu
                    mode="inline"
                    style={{ height: '100%', borderRight: 50 }}
                    defaultOpenKeys={['accountSettings']}
                    expandIcon={null}
                >
                    <Menu.Item key="dashboard" icon={<FundProjectionScreenOutlined />}>
                        <Link to="/dashboard">Dashboard</Link>
                    </Menu.Item>

                    <Menu.Item key="orders" icon={<SolutionOutlined />}>
                        <Link to="/orders">Orders</Link>
                    </Menu.Item>

                    <Menu.Item key="reports" icon={<FormOutlined />}>
                        <Link to="/reports">Reports</Link>
                    </Menu.Item>

                    <Menu.Item key="sales" icon={<ShoppingOutlined />}>
                        Sales <Badge count={4} style={{ backgroundColor: '#52c41a' }} />
                    </Menu.Item>

                    <Menu.SubMenu key="accountSettings" icon={<UserOutlined />} title="Account Settings" expandIcon={null}>
                        <Menu.Item key="profile">
                            <Link to="/profile">Profile</Link>
                        </Menu.Item>
                        <Menu.Item key="Settings">
                            <Link to="/Settings">Settings</Link>
                        </Menu.Item>
                        <Menu.Item key="changePassword">
                            <Link to="/change-password">Change Password</Link>
                        </Menu.Item>
                    </Menu.SubMenu>

                    <Menu.SubMenu key="Analytics" icon={<FundOutlined />} title="Analytics" expandIcon={null}>
                        <Menu.Item key="SalesGraphs">Level 1</Menu.Item>
                        <Menu.Item key="SalesGraphs">Level 2</Menu.Item>
                        <Menu.Item key="SalesGraphs">Level 3</Menu.Item>
                    </Menu.SubMenu>

                    <Menu.SubMenu key="warehouse" icon={<TruckOutlined />} title="Warehouse" expandIcon={null}>
                        <Menu.Item key="warehouse">
                            <Link to="/warehouse">Profile</Link>
                        </Menu.Item>
                        <Menu.Item key="inventory">
                            <Link to="/inventory">Inventory</Link>
                        </Menu.Item>
                        <Menu.Item key="suppliers">
                            <Link to="/suppliers">Suppliers</Link>
                        </Menu.Item>
                    </Menu.SubMenu>

                    <Menu.Divider />

                    <Menu.ItemGroup title="" expandIcon={null}>
                        <Menu.Item key="important" icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}>
                            Important
                        </Menu.Item>
                        <Menu.Item key="warning" icon={<ExclamationCircleOutlined style={{ color: 'orange' }} />}>
                            Warning
                        </Menu.Item>
                        <Menu.Item key="information" icon={<ExclamationCircleOutlined style={{ color: 'blue' }} />}>
                            Information
                        </Menu.Item>
                    </Menu.ItemGroup>
                </Menu>
            </Sider>
        </Layout>
    );
};

export default SideBar;</Menu.Item>