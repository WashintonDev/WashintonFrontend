import React from 'react'; 
import { Link } from 'react-router-dom';
import { Dropdown, Menu, Button, Input, Typography } from 'antd';

const { Title, Text } = Typography;

const NavBarMenu = ({ title, onAddCategory, onSearch, showSearch = true, showAdd = true, isRestockPage = false }) => {
    const operationsMenu = (
        <Menu>
            <Menu.Item disabled><Text>Reabastecimiento</Text></Menu.Item>
            <Menu.Item><Link to="/inventory/request-restock"><Text>Restock</Text></Link></Menu.Item>
            <Menu.Item disabled><Text>Traslados</Text></Menu.Item>
            <Menu.Item><Link to="/inventory/receipts"><Text>Receipts</Text></Link></Menu.Item>
            <Menu.Item disabled><Text>Batches</Text></Menu.Item>
            <Menu.Item><Link to="/inventory/product-batch"><Text>Batches</Text></Link></Menu.Item>
        </Menu>
    );

    const reportsMenu = (
        <Menu>
            <Menu.Item><Link to="/inventory/stock"><Text>Stock</Text></Link></Menu.Item>
            <Menu.Item><Link to="/inventory/operation-log"><Text>Movement History</Text></Link></Menu.Item>
        </Menu>
    );

    const settingsMenu = (
        <Menu>
            <Menu.Item disabled><Text>Warehouse Management</Text></Menu.Item>
            <Menu.Item><Link to="/inventory/warehouse"><Text>Warehouses</Text></Link></Menu.Item>
            <Menu.Item><Link to="/inventory/store"><Text>Stores</Text></Link></Menu.Item>
            <Menu.Item disabled><Text>Products</Text></Menu.Item>
            <Menu.Item><Link to="/inventory/category"><Text>Categories</Text></Link></Menu.Item>
            <Menu.Item><Link to="/sales/"><Text>Sales</Text></Link></Menu.Item>
            <Menu.Item><Link to="/inventory/product"><Text>Products</Text></Link></Menu.Item>
            <Menu.Item><Link to="/inventory/inventory"><Text>Inventory</Text></Link></Menu.Item>
            <Menu.Item><Link to="/inventory/restock-products"><Text>Restock Products</Text></Link></Menu.Item>
        </Menu>
    );

    return (
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
            <Title level={2} style={{ margin: 0 }}>{title}</Title>
            {!isRestockPage && showSearch && (
                <Input.Search
                    placeholder="Search..."
                    onChange={e => onSearch(e.target.value)} // Llama a onSearch instantáneamente
                    style={{ width: 200, marginLeft: '20px' }}
                />
            )}
            {!isRestockPage && showAdd && (
                <Button type="primary" onClick={onAddCategory} style={{ marginLeft: '20px' }}>
                    Add {title}
                </Button>
            )}
            <div style={{ marginLeft: 'auto' }}>
                <Dropdown overlay={operationsMenu} placement="bottomLeft" trigger={['click']}>
                    <Button>Operations</Button>
                </Dropdown>
                <Dropdown overlay={reportsMenu} placement="bottomLeft" trigger={['click']}>
                    <Button style={{ marginLeft: '10px' }}>Reports</Button>
                </Dropdown>
                <Dropdown overlay={settingsMenu} placement="bottomLeft" trigger={['click']}>
                    <Button style={{ marginLeft: '10px' }}>Settings</Button>
                </Dropdown>
            </div>
        </div>
    );
};

export default NavBarMenu;