import React, { useEffect, useState } from 'react';
import { Table, Modal, Form, Input, notification, Button, Space, Tooltip, Tag, Image, Select, Card, Row, Col, List, Pagination } from 'antd';
const { Option } = Select;
import { API_URL_INVENTORIES, API_URL_CATEGORIES, API_URL_PRODUCTS, API_URL_STORES, API_URL_WAREHOUSES } from '../../services/ApisConfig';
import { EditOutlined, DeleteOutlined, DollarOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar';

const InventoryPage = () => {
    const [inventories, setInventories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [editingInventory, setEditingInventory] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [statusFilter, setStatusFilter] = useState('all');
    const [fieldFilter, setFieldFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('ascend');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [totalStock, setTotalStock] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(16);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [products, setProducts] = useState([]);
    const [stores, setStores] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [addForm] = Form.useForm();

    useEffect(() => {
        fetchInventories();
        fetchCategories(); // Obtener las categorías
    }, []);

    // const fetchInventories = async () => {
    //     try {
    //         const response = await fetch(API_URL_INVENTORIES);
    //         if (!response.ok) throw new Error('Error fetching inventories');
    //         const data = await response.json();
    //         const sortedInventories = data.sort((a, b) => a.inventory_id - b.inventory_id);
    //         setInventories(sortedInventories);
    //     } catch (error) {
    //         notification.error({ message: error.message || 'Error fetching inventories' });
    //     }
    // };

    const fetchInventories = async () => {
        try {
            const response = await fetch(API_URL_INVENTORIES);
            if (!response.ok) throw new Error('Error fetching inventories');
            const data = await response.json();
            const sortedInventories = data.sort((a, b) => a.inventory_id - b.inventory_id);
    
            // Calcula el stock total por producto y guarda los inventarios
            const totalStockMap = calculateTotalStockPerProduct(sortedInventories);
            setInventories(
                sortedInventories.map((inventory) => ({
                    ...inventory,
                    totalStock: totalStockMap[inventory.product.product_id],
                }))
            );
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching inventories' });
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(API_URL_CATEGORIES);
            if (!response.ok) throw new Error('Error fetching categories');
            const data = await response.json();
            setCategories(data); // Almacena las categorías
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching categories' });
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch(API_URL_PRODUCTS); // Ajusta la URL según tu API
            if (!response.ok) throw new Error('Error fetching products');
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching products' });
        }
    };

    const fetchStores = async () => {
        try {
            const response = await fetch(API_URL_STORES);
            if (!response.ok) throw new Error('Error fetching stores');
            const data = await response.json();
            setStores(data);
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching stores' });
        }
    };
    
    const fetchWarehouses = async () => {
        try {
            const response = await fetch(API_URL_WAREHOUSES);
            if (!response.ok) throw new Error('Error fetching warehouses');
            const data = await response.json();
            setWarehouses(data);
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching warehouses' });
        }
    };

    const handleAddInventory = () => {
        setIsAddModalVisible(true);
        fetchProducts();
        fetchStores();
        fetchWarehouses();
    };
    
    const handleAddCancel = () => {
        setIsAddModalVisible(false);
        addForm.resetFields();
    };

    const handleAddOk = async () => {
        try {
            const values = await addForm.validateFields();
            await fetch(API_URL_INVENTORIES, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });
            notification.success({ message: 'Inventory added successfully' });
            fetchInventories();
            setIsAddModalVisible(false);
            addForm.resetFields();
        } catch (error) {
            notification.error({ message: error.message || 'Error adding inventory' });
        }
    };
    
    const handleProductChange = (productId) => {
        setSelectedProductId(productId);
    };

    // Calcula el stock total por producto
    const calculateTotalStockPerProduct = (inventories) => {
        const totalStockMap = {};
        inventories.forEach((inventory) => {
            const productId = inventory.product.product_id;
            if (!totalStockMap[productId]) {
                totalStockMap[productId] = 0;
            }
            totalStockMap[productId] += inventory.stock || 0;
        });
        return totalStockMap;
    };

    const handleAdd = () => {
        setEditingInventory(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    // const handleEdit = (inventory) => {
    //     setEditingInventory(inventory);
    //     form.setFieldsValue({
    //         stock: inventory.stock,
    //     });
    //     setIsModalVisible(true);
    // };

    const handleCardClick = (inventory) => {
        // Filtrar las ubicaciones específicas para este producto
        const productLocations = inventories
            .filter((item) => item.product.product_id === inventory.product.product_id)
            .map((item) => ({
                id: item.inventory_id,
                name: item.warehouse?.name || item.store?.name,
                stock: item.stock,
            }));
        // Configurar el modal con las ubicaciones del producto seleccionado
        setSelectedProduct(inventory.product);
        setEditingInventory({ ...inventory, locations: productLocations });
        setTotalStock(calculateTotalStock({ ...inventory, locations: productLocations }));
        setIsModalVisible(true);
    };

    const handleDelete = async (inventory_id) => {
        try {
            await fetch(`${API_URL_INVENTORIES}${inventory_id}/`, { method: 'DELETE' });
            notification.success({ message: 'Inventory deleted successfully' });
            fetchInventories();
        } catch (error) {
            notification.error({ message: error.message || 'Error deleting inventory' });
        }
    };

    const handleAccept = async () => {
        try {
            const updatePromises = editingInventory.locations.map(async (location) => {
                const values = {
                    stock: location.stock,
                };
                const url = `${API_URL_INVENTORIES}${location.id}/`;
                console.log('Updating stock at URL:', url); // Línea de depuración
                await fetch(url, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                });
            });
    
            await Promise.all(updatePromises);
            notification.success({ message: 'Stocks updated successfully' });
            fetchInventories();
            setIsModalVisible(false);
        } catch (error) {
            notification.error({ message: error.message || 'Error updating stocks' });
        }
    };

    // const handleOk = async () => {
    //     try {
    //         const values = await form.validateFields();
    //         if (editingInventory) {
    //             await fetch(`${API_URL_INVENTORIES}${editingInventory.inventory_id}/`, {
    //                 method: 'PATCH',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //                 body: JSON.stringify(values),
    //             });
    //             notification.success({ message: 'Stock updated successfully' });
    //         }
    //         fetchInventories();
    //         setIsModalVisible(false);
    //     } catch (error) {
    //         notification.error({ message: error.message || 'Error saving inventory' });
    //     }
    // };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleStockChange = (locationId, newStock) => {
        const updatedLocations = editingInventory.locations.map((location) =>
            location.id === locationId ? { ...location, stock: parseInt(newStock) || 0 } : location
        );
        setEditingInventory({ ...editingInventory, locations: updatedLocations });
        setTotalStock(calculateTotalStock({ ...editingInventory, locations: updatedLocations }));
    };
    
    const calculateTotalStock = (product) => {
        return product?.locations.reduce((total, location) => total + (location.stock || 0), 0);
    };

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    const showImage = (image) => {
        setSelectedImage(image);
        setImageModalVisible(true);
    };

    // const filteredInventories = inventories.filter(inventory => {
    //     const productName = inventory.product?.name || '';
    //     return productName.toLowerCase().includes(searchText.toLowerCase());
    // });

    const filteredInventories = inventories
    .filter(inventory => {
        const productName = inventory.product?.name || '';
        const status = inventory.product?.status || 'inactive';

        if (statusFilter !== 'all' && status !== statusFilter) return false;
        return productName.toLowerCase().includes(searchText.toLowerCase());
    })
    .sort((a, b) => {
        if (fieldFilter && sortOrder) {
            const fieldA = a.product?.[fieldFilter] || '';
            const fieldB = b.product?.[fieldFilter] || '';
            if (sortOrder === 'ascend') return fieldA > fieldB ? 1 : -1;
            return fieldA < fieldB ? 1 : -1;
        }
        return 0;
    });

    const paginatedInventories = filteredInventories.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat.category_id === categoryId);
        return category ? category.name : 'Unknown';
    };


    return (
        <div>
            <Navbar
                title="Inventories"
                buttonText="Add Inventory"
                onAddCategory={handleAddInventory}
                onSearch={handleSearch}
            />

            <Modal
                title="Add Inventory"
                visible={isAddModalVisible}
                onCancel={handleAddCancel}
                footer={[
                    <Button key="cancel" onClick={handleAddCancel}>Cancel</Button>,
                    <Button key="add" type="primary" onClick={handleAddOk}>Add</Button>
                ]}
            >
                <Form form={addForm} layout="vertical">
                    <Form.Item
                        name="product_id"
                        label="Product"
                        rules={[{ required: true, message: 'Please select a product!' }]}
                    >
                        <Select onChange={handleProductChange}>
                            {products.map((product) => (
                                <Option key={product.product_id} value={product.product_id}>
                                    {product.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="location_id"
                        label="Location"
                        rules={[{ required: true, message: 'Please select a location!' }]}
                    >
                        <Select>
                            {warehouses
                                .filter((warehouse) => !inventories.some((inventory) => inventory.product.product_id === selectedProductId && inventory.warehouse_id === warehouse.warehouse_id))
                                .map((warehouse) => (
                                    <Option key={warehouse.warehouse_id} value={warehouse.warehouse_id}>
                                        {warehouse.name}
                                    </Option>
                                ))}
                            {stores
                                .filter((store) => !inventories.some((inventory) => inventory.product.product_id === selectedProductId && inventory.store_id === store.store_id))
                                .map((store) => (
                                    <Option key={store.store_id} value={store.store_id}>
                                        {store.name}
                                    </Option>
                                ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="stock"
                        label="Stock"
                        rules={[{ required: true, message: 'Please input the stock!' }]}
                    >
                        <Input type="number" />
                    </Form.Item>
                </Form>
            </Modal>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px', marginBottom: '16px' }}>
                <div>
                    {/* <label style={{ display: 'block', marginBottom: '4px', color: 'gray', opacity: 0.7, fontStyle: 'italic', fontFamily: 'Arial', fontSize: '13px' }}>
                        Select:
                    </label> */}
                    <Select
                        // placeholder="select:"
                        defaultValue="all"
                        onChange={(value) => setStatusFilter(value)}
                        style={{ width: 150 }}
                    >
                        <Option value="all">All</Option>
                        <Option value="active">Active</Option>
                        <Option value="inactive">Inactive</Option>
                    </Select>
                </div>

                <div>
                    {/* <label style={{ display: 'block', marginBottom: '4px', color: 'gray', opacity: 0.7, fontStyle: 'italic', fontFamily: 'Arial', fontSize: '13px' }}>
                        Sort by:
                    </label> */}
                    <Select
                        placeholder="sort by:"
                        onChange={(value) => setFieldFilter(value)}
                        style={{ width: 150 }}
                    >
                        <Option value="sku">SKU</Option>
                        <Option value="price">Price</Option>
                        <Option value="stock">Stock</Option>
                        <Option value="location">Location</Option>
                    </Select>
                </div>

                <div>
                    {/* <label style={{ display: 'block', marginBottom: '4px', color: 'gray', opacity: 0.7, fontStyle: 'italic', fontFamily: 'Arial', fontSize: '13px' }}>
                        Order by:
                    </label> */}
                    <Select
                        placeholder="order by:"
                        // defaultValue="ascend"
                        onChange={(value) => setSortOrder(value)}
                        style={{ width: 150 }}
                    >
                        <Option value="ascend">Asc</Option>
                        <Option value="descend">Desc</Option>
                    </Select>
                </div>
            </div>

            <Row gutter={[16, 16]}>
                {paginatedInventories.map((inventory) => (
                    <Col key={`${inventory.product?.product_id}-${inventory.inventory_id}`} span={6}>
                        <Card
                            hoverable
                            onClick={() => handleCardClick(inventory)}
                            bodyStyle={{ padding: '12px' }}
                        >
                            <Row gutter={16}>
                                <Col span={6}>
                                    <Image
                                        src={inventory.product?.image || 'https://via.placeholder.com/150'}
                                        alt={inventory.product?.name}
                                        preview={false}
                                        style={{ width: '100%', objectFit: 'cover' }}
                                    />
                                </Col>
                                <Col span={18}>
                                    <Card.Meta
                                        title={inventory.product?.name}
                                        description={
                                            <div style={{ lineHeight: '1.2' }}>
                                                <DollarOutlined style={{ color: 'green' }} />
                                                <strong> {inventory.product?.price}</strong>
                                                <p></p>
                                                <p style={{ margin: '4px 0' }}>
                                                    SKU: <Tag color="yellow">{inventory.product?.sku}</Tag>
                                                </p>
                                                <div style={{ margin: '4px 0' }}>
                                                    <p style={{ margin: '4px 0' }}>Specifications:</p>
                                                    <Tag color="blue">{inventory.product?.type}</Tag>
                                                    <Tag color="orange" style={{ marginLeft: '-5px' }}>
                                                        {getCategoryName(inventory.product?.category_id)}
                                                    </Tag>
                                                </div>
                                                <p style={{ margin: '8px 0' }}>
                                                    Status:{' '}
                                                    <Tag
                                                        color={inventory.product?.status === 'active' ? 'green' : 'red'}
                                                    >
                                                        {inventory.product?.status}
                                                    </Tag>
                                                </p>
                                                <p style={{ margin: '8px 0' }}>
                                                    Total Stock: <strong>{inventory.totalStock}</strong>
                                                </p>
                                            </div>
                                        }
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                ))}
            </Row>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredInventories.length}
                    onChange={handlePageChange}
                    showSizeChanger
                    pageSizeOptions={['16', '32', '48', '64']}
                />
            </div>

            {/* <Modal
                title={editingInventory ? 'Edit Inventory' : 'Add Inventory'}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="stock" label="Stock" rules={[{ required: true, message: 'Please input the stock!' }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal> */}

            {selectedProduct && (
                <Modal
                    title={`Update Stock - ${selectedProduct.name}`}
                    visible={isModalVisible}
                    onCancel={handleCancel}
                    footer={[
                        <Button key="cancel" onClick={handleCancel}>Cancel</Button>,
                        <Button key="accept" type="primary" onClick={handleAccept}>Accept</Button>
                    ]}
                >
                    {editingInventory.locations.map((location) => (
                        <div key={location.id}>
                            <p>{location.name}</p>
                            <Input
                                type="number"
                                value={location.stock}
                                onChange={(e) => handleStockChange(location.id, e.target.value)}
                            />
                        </div>
                    ))}
                    <p style={{ display: 'flex', justifyContent: 'right'}}>Total Stock: <strong> {totalStock}</strong></p>
                </Modal>
            )}

            <Modal
                visible={imageModalVisible}
                footer={null}
                onCancel={() => setImageModalVisible(false)}
                width={800}
                title={selectedImage ? "Product Image" : "No Image"}
            >
                {selectedImage ? (
                    <Image
                        src={selectedImage}
                        alt="Product"
                        style={{ width: '100%', height: 'auto' }}
                    />
                ) : (
                    <Image
                        src="https://via.placeholder.com/800"
                        alt="Placeholder"
                        style={{ width: '100%', height: 'auto' }}
                    />
                )}
            </Modal>
        </div>
    );
};

export default InventoryPage;
