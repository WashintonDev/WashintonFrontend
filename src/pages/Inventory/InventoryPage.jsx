import React, { useEffect, useState } from 'react';
import { Table, Modal, Form, Input, notification, Button, Space, Tooltip, Tag, Image, Select } from 'antd';
const { Option } = Select;
import { API_URL_INVENTORIES, API_URL_CATEGORIES } from '../../services/ApisConfig';
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


    useEffect(() => {
        fetchInventories();
        fetchCategories(); // Obtener las categorías
    }, []);

    const fetchInventories = async () => {
        try {
            const response = await fetch(API_URL_INVENTORIES);
            if (!response.ok) throw new Error('Error fetching inventories');
            const data = await response.json();
            const sortedInventories = data.sort((a, b) => a.inventory_id - b.inventory_id);
            setInventories(sortedInventories);
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

    const handleAdd = () => {
        setEditingInventory(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (inventory) => {
        setEditingInventory(inventory);
        form.setFieldsValue({
            stock: inventory.stock,
        });
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

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingInventory) {
                await fetch(`${API_URL_INVENTORIES}${editingInventory.inventory_id}/`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                });
                notification.success({ message: 'Stock updated successfully' });
            }
            fetchInventories();
            setIsModalVisible(false);
        } catch (error) {
            notification.error({ message: error.message || 'Error saving inventory' });
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleSearch = (value) => {
        setSearchText(value);
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


    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat.category_id === categoryId);
        return category ? category.name : 'Unknown';
    };

    const columns = [
        {
            title: 'No.',
            key: 'index',
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
            width: 60,
        },
        {
            title: 'Product Name',
            key: 'productName',
            render: (text, record) => <span>{record.product?.name}</span>,
        },
        {
            title: 'SKU',
            dataIndex: 'product.sku',
            key: 'sku',
            render: (text, record) => <span><Tag color="orange">{record.product?.sku}</Tag></span>,
        },
        {
            title: 'Price',
            dataIndex: 'product.price',
            key: 'price',
            render: (text, record) => (
                <span>
                    <DollarOutlined style={{ color: 'green' }} /> {record.product?.price}
                </span>
            ),
        },
        {
            title: 'Stock',
            dataIndex: 'stock',
            key: 'stock',
        },
        {
            title: 'Location',
            key: 'location',
            render: (text, record) => (
                <span>
                    {record.warehouse ? record.warehouse.name : record.store.name}
                </span>
            ),
        },
        {
            title: 'Specifications', // Nueva columna para las especificaciones
            key: 'specifications',
            render: (text, record) => (
                <span>
                    <Tag color="blue">{record.product?.type}</Tag>
                    <Tag color="green">{getCategoryName(record.product?.category_id)}</Tag>
                </span>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            render: (text, record) => (
                <Tag color={record.product?.status === 'active' ? 'green' : 'red'}>
                    {record.product?.status}
                </Tag>
            ),
        },
        {
            title: 'Image',
            key: 'image',
            render: (text, record) => (
                <Image
                    preview={false}
                    width={50}
                    height={50}
                    src={record.product?.image || 'https://via.placeholder.com/50'}
                    onClick={() => showImage(record.product?.image || 'https://via.placeholder.com/800')}
                    style={{ cursor: 'pointer' }}
                />
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Edit" placement="bottom">
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete" placement="bottom">
                        <Button
                            danger
                            type="link"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record.inventory_id)}
                        />
                    </Tooltip>
                </Space>
            ),
            width: 120,
        },
    ];

    return (
        <div>
            <Navbar
                title="Inventories"
                buttonText="Add Inventory"
                onAddCategory={handleAdd}
                onSearch={handleSearch}
            />

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

            <Table
                dataSource={filteredInventories}
                columns={columns}
                rowKey="inventory_id"
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: filteredInventories.length,
                    showSizeChanger: true,
                    onChange: (page, pageSize) => {
                        setPagination({ current: page, pageSize });
                    },
                }}
                style={{ maxWidth: '90%', margin: '0 auto', fontSize: '0.9em' }}
                bordered
            />

            <Modal
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
            </Modal>

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
