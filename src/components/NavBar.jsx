import React from 'react'; 
import { Link } from 'react-router-dom';
import { Dropdown, Menu, Button, Input } from 'antd';

const NavBarMenu = ({ title, onAddCategory, onSearch, showSearch = true, showAdd = true }) => {
    const operationsMenu = (
        <Menu>
            <Menu.Item disabled>Reabastecimiento</Menu.Item>
            <Menu.Item><Link to="/inventory/request-restock">Restock</Link></Menu.Item>
            <Menu.Item disabled>Traslados</Menu.Item>
            <Menu.Item><Link to="/inventory/receipts">Receipts</Link></Menu.Item>
            <Menu.Item disabled>Batches</Menu.Item>
            <Menu.Item><Link to="/inventory/product-batch">Batches</Link></Menu.Item>
        </Menu>
    );

    const reportsMenu = (
        <Menu>
            <Menu.Item><Link to="/inventory/stock">Stock</Link></Menu.Item>
            <Menu.Item><Link to="/inventory/operation-log">Movement History</Link></Menu.Item>
        </Menu>
    );

    const settingsMenu = (
        <Menu>
            <Menu.Item disabled>Warehouse Management</Menu.Item>
            <Menu.Item><Link to="/inventory/warehouse">Warehouses</Link></Menu.Item>
            <Menu.Item><Link to="/inventory/store">Stores</Link></Menu.Item>
            <Menu.Item disabled>Supplier Management</Menu.Item>
            <Menu.Item><Link to="/supplier">Suppliers</Link></Menu.Item>
            <Menu.Item disabled>Products</Menu.Item>
            <Menu.Item><Link to="/inventory/category">Categories</Link></Menu.Item>
            <Menu.Item><Link to="/inventory/product">Products</Link></Menu.Item>
            <Menu.Item><Link to="/inventory/inventory">Inventory</Link></Menu.Item>
            <Menu.Item><Link to="/inventory/restock-products">Restock Products</Link></Menu.Item>
        </Menu>
    );

    return (
        <div style={{ display: 'flex', alignItems: 'center', padding: '10px 20px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
            <h2 style={{ margin: 0 }}>{title}</h2>
            {showSearch && (
                <Input.Search
                    placeholder="Buscar..."
                    onChange={e => onSearch(e.target.value)} // Llama a onSearch instantáneamente
                    style={{ width: 200, marginLeft: '20px' }}
                />
            )}
            {showAdd && (
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