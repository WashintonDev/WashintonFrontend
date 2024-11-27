import React, { useState } from 'react';
import { Dropdown, Menu, Button, Input, Layout } from 'antd';
import {
    UserOutlined, LogoutOutlined, FundProjectionScreenOutlined, SolutionOutlined,
    FormOutlined, ShoppingOutlined, MenuFoldOutlined, ExclamationCircleOutlined,
    TruckOutlined, FundOutlined,
    SendOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from "react-router-dom";
import useLogout from '../hooks/Logout';
import "../assets/styles/login.css";

const { Sider } = Layout;

const NavBarHome = ({ onSearch, showSearch = true }) => {
    const [collapsed, setCollapsed] = useState(true); 
    const navigate = useNavigate();
    const logout = useLogout();

    // Función de logout
    const settingsMenu = (
        <Menu>
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout}>
                Log Out
            </Menu.Item>
        </Menu>
    );

    return (
        <Layout>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                width={250}
                style={{ height: '100vh', position: 'fixed', left: 0  }}
                expandIcon = {null}
                
            >
                <Menu
                    mode="inline"
                    style={{ height: '100%', borderRight: 50 , paddingTop:'50px'}}
                    defaultOpenKeys={['accountSettings']}
                    expandIcon={null}
                >
                    <Menu.Item key="dashboard" icon={<FundProjectionScreenOutlined />}>
                        <Link to="/admin">Dashboard</Link>
                    </Menu.Item>

            <Menu.Item key="orders" icon={<SolutionOutlined />}>
              <Link to="/orders">Orders</Link>
            </Menu.Item>

            <Menu.Item key="reports" icon={<FormOutlined />}>
              <Link to="/reports">Reports</Link>
            </Menu.Item>

            <Menu.SubMenu key="sales" icon={<ShoppingOutlined />}>
              <Menu.Item key="sales">
                <Link to="/sales">Profile</Link>
              </Menu.Item>
              <Menu.Item key="sales-report">
                <Link to="/sales-report">Settings</Link>
              </Menu.Item>
            </Menu.SubMenu>
            <Menu.SubMenu key="Dispatch" icon={<SendOutlined />}>
              <Menu.Item key="History Global">
                <Link to="/suppliers/history-supplier">History</Link>
              </Menu.Item>
              <Menu.Item key="calendar">
                <Link to="/dispatch">Calendar</Link>
              </Menu.Item>
            </Menu.SubMenu>

            <Menu.SubMenu
              key="accountSettings"
              icon={<UserOutlined />}
              title="Account Settings"
              expandIcon={null}
            >
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

            <Menu.SubMenu
              key="Analytics"
              icon={<FundOutlined />}
              title="Analytics"
              expandIcon={null}
            >
              <Menu.Item key="SalesGraphs">Level 1</Menu.Item>
              <Menu.Item key="SalesGraphs">Level 2</Menu.Item>
              <Menu.Item key="SalesGraphs">Level 3</Menu.Item>
            </Menu.SubMenu>

            <Menu.SubMenu
              key="warehouse"
              icon={<TruckOutlined />}
              title="Warehouse"
              expandIcon={null}
            >
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
              <Menu.Item
                key="important"
                icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
              >
                Important
              </Menu.Item>
              <Menu.Item
                key="warning"
                icon={<ExclamationCircleOutlined style={{ color: "orange" }} />}
              >
                Warning
              </Menu.Item>
              <Menu.Item
                key="information"
                icon={<ExclamationCircleOutlined style={{ color: "blue" }} />}
              >
                Information
              </Menu.Item>
            </Menu.ItemGroup>
          </Menu>
        </Sider>

        <Layout>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 20px",
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #ddd",
            }}
          >
            <Button
              icon={<MenuFoldOutlined />}
              shape="square"
              onClick={() => setCollapsed(!collapsed)}
            />

            {showSearch && (
              <Input.Search
                placeholder="Search"
                style={{ marginLeft: "10px" }}
              />
            )}

            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Dropdown
                overlay={settingsMenu}
                placement="bottomLeft"
                trigger={["click"]}
              >
                <Button
                  icon={<UserOutlined />}
                  shape="circle"
                  style={{ marginLeft: "10px" }}
                />
              </Dropdown>
            </div>
          </div>
        </Layout>
      </Layout>
    );
};

export default NavBarHome;