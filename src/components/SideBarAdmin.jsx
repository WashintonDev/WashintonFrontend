import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  ShopOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const SideBarAdmin = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="light" style={{ background: '#fff' }}>
      <div className="logo" style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)' }} />
      <Menu theme="light" mode="inline" selectedKeys={[location.pathname]}>
        <Menu.Item key="/admin" icon={<UserOutlined />}>
          <Link to="/admin">Admin</Link>
        </Menu.Item>
        <Menu.Item key="/admin/rolem" icon={<TeamOutlined />}>
          <Link to="/admin/rolem">Roles</Link>
        </Menu.Item>
        <Menu.Item key="/admin/profile" icon={<ShopOutlined />}>
          <Link to="/admin/profile">Profile</Link>
        </Menu.Item>
        <Menu.Item key="/admin/inventory" icon={<DollarOutlined />}>
          <Link to="/admin/inventory">Inventory</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default SideBarAdmin;