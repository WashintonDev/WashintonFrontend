import React from "react";
import { Link } from "react-router-dom";
import { Dropdown, Menu, Button, Input } from "antd";
import useLogout from "../hooks/Logout";
const NavBarMenu = ({ title, onAddCategory, onSearch, showSearch = true, showAdd = true }) => {
    const logout = useLogout();
    const operationsMenu = (
        <Menu>
            <Menu.Item disabled style={{ cursor: "not-allowed", color: "#bdbdbd" }}>Batches</Menu.Item>
            <Menu.Item>
                <Link to="/inventory/product-batch">Batches</Link>
            </Menu.Item>
        </Menu>
    );


    const settingsMenu = (
        <Menu>
            <Menu.Item disabled style={{ cursor: "not-allowed", color: "#bdbdbd" }}>Warehouse Management</Menu.Item>
            <Menu.Item>
                <Link to="/inventory/warehouse">Warehouses</Link>
            </Menu.Item>
            <Menu.Item>
                <Link to="/inventory/store">Stores</Link>
            </Menu.Item>
            <Menu.Item disabled style={{ cursor: "not-allowed", color: "#bdbdbd" }}>Products</Menu.Item>
            <Menu.Item>
                <Link to="/inventory/product">Products</Link>
            </Menu.Item>
            <Menu.Item>
                <Link to="/inventory">Inventory</Link>
            </Menu.Item>
            <Menu.Item>
                <Link to="/inventory/category">Categories</Link>
            </Menu.Item>
            <Menu.Item>
                <Link to="/sales/">Sales</Link>
            </Menu.Item>
            <Menu.Item><Link to="/sales/sales-report">Sales report</Link></Menu.Item>
            <Menu.Item>
                <Link to="/inventory/restock-products">Restock Products</Link>
            </Menu.Item>
        </Menu>
    );

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "15px 25px",
          background: "#356CA0",
          borderBottom: "2px solid #ddd",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#fff",
            fontSize: "28px",
            fontFamily: "Poppins, sans-serif",
            fontWeight: "bold",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          {title}
        </h2>
        {showSearch && (
          <Input.Search
            placeholder="Search..."
            onChange={(e) => onSearch(e.target.value)}
            style={{
              width: 250,
              marginLeft: "20px",
              borderRadius: "8px",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          />
        )}
        {showAdd && (
          <Button
            type="primary"
            onClick={onAddCategory}
            style={{
              marginLeft: "20px",
              color: "#fff",
              background: "#5A9BD6",
              fontWeight: "bold",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Add {title}
          </Button>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: "10px" }}>
          <Dropdown
            overlay={operationsMenu}
            placement="bottomLeft"
            trigger={["click"]}
          >
            <Button
              style={{
                background: "#fff",
                border: "1px solid #5A9BD6",
                color: "#5A9BD6",
                fontWeight: "bold",
                borderRadius: "8px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#5A9BD6";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.color = "#5A9BD6";
              }}
            >
              Operations
            </Button>
          </Dropdown>

          <Dropdown
            overlay={settingsMenu}
            placement="bottomLeft"
            trigger={["click"]}
          >
            <Button
              style={{
                background: "#fff",
                border: "1px solid #5A9BD6",
                color: "#5A9BD6",
                fontWeight: "bold",
                borderRadius: "8px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#5A9BD6";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.color = "#5A9BD6";
              }}
            >
              Settings
            </Button>
          </Dropdown>
          {/* Botón de logout */}
          <Button
            type="danger"
            onClick={logout}
            style={{
              marginLeft: "20px",
              color: "#fff",
              background: "#ff4d4f",
              fontWeight: "bold",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Logout
          </Button>
        </div>
      </div>
    );
};

export default NavBarMenu;
