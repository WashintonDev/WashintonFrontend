import React, { useEffect, useState } from 'react';
import { Table, Modal, Form, Input, notification, Button, Space, Tooltip, Tag, Image } from 'antd';
import { API_URL_PRODUCTS, API_URL_CATEGORIES } from '../../services/api';
import { EditOutlined, DeleteOutlined, DollarOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar';

const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch(API_URL_CATEGORIES);
            if (!response.ok) throw new Error('Error fetching categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching categories' });
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch(API_URL_PRODUCTS);
            if (!response.ok) throw new Error('Error fetching products');
            const data = await response.json();
            const sortedProducts = data.sort((a, b) => a.product_id - b.product_id);
            setProducts(sortedProducts);
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching products' });
        }
    };

    const handleAdd = () => {
        setEditingProduct(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        form.setFieldsValue({
            name: product.name,
            sku: product.sku,
            description: product.description,
            price: product.price,
            type: product.type,
            image: product.image
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (product_id) => {
        try {
            await fetch(`${API_URL_PRODUCTS}${product_id}/`, { method: 'DELETE' });
            notification.success({ message: 'Product deleted successfully' });
            fetchProducts();
        } catch (error) {
            notification.error({ message: error.message || 'Error deleting product' });
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingProduct) {
                const response = await fetch(`${API_URL_PRODUCTS}${editingProduct.product_id}/`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...values,
                        image: values.image,
                    }),
                });
                if (!response.ok) {
                    throw new Error('Error updating product');
                }
                notification.success({ message: 'Product updated successfully' });
            } else {
                await fetch(API_URL_PRODUCTS, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                });
                notification.success({ message: 'Product created successfully' });
            }
            fetchProducts();
            setIsModalVisible(false);
        } catch (error) {
            notification.error({ message: error.message || 'Error saving product' });
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.description.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: 'No.',
            key: 'index',
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
            width: 60,
        },
        {
            title: 'Product Name',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            width: 400,
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            ellipsis: true,
            render: (text, record) => (
                <Tag color="orange">{record.sku}</Tag>
            ),
            width: 120,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (text, record) => (
                <span>
                    <DollarOutlined style={{ color: 'green' }} /> {record.price}
                </span>
            ),
            width: 150,
        },
        {
            title: 'Category',
            key: 'category',
            render: (text, record) => {
                const category = categories.find(cat => cat.category_id === record.category_id);
                return <Tag color="purple">{category ? category.name : 'Unknown Category'}</Tag>;
            },
            width: 200,
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (text, record) => (
                <Tag color="blue">{record.type}</Tag>
            ),
            width: 200,
        },
        {
            title: 'Image',
            key: 'image',
            width: 100,
            render: (text, record) => (
                <Image
                    width={50}
                    height={50}
                    src={record.image || 'https://via.placeholder.com/50'}
                    preview={{ 
                        src: record.image || 'https://via.placeholder.com/800', 
                        title: record.name 
                    }} // Usar el preview de Ant Design
                    style={{
                        cursor: 'pointer',
                        objectFit: 'contain', // Asegura que la imagen no se deforme
                        borderRadius: '5px', // Opcional: añadir un borde redondeado
                    }}
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
                            onClick={() => handleDelete(record.product_id)}
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
                title="Products"
                buttonText="Add Product"
                onAddCategory={handleAdd}
                onSearch={handleSearch}
            />

            <Table
                dataSource={filteredProducts}
                columns={columns}
                rowKey="product_id"
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: filteredProducts.length,
                    showSizeChanger: true,
                    onChange: (page, pageSize) => {
                        setPagination({ current: page, pageSize });
                    },
                }}
                style={{ maxWidth: '80%', margin: '0 auto', fontSize: '0.9em' }}
                bordered
            />

            <Modal
                title={editingProduct ? 'Edit Product' :                 'Add Product'}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input the product name!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="sku" label="SKU" rules={[{ required: true, message: 'Please input the SKU!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item name="price" label="Price" rules={[{ required: true, message: 'Please input the price!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="type" label="Type" rules={[{ required: true, message: 'Please input the type!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="image" label="Image URL">
                        <Input placeholder="Enter image URL" />
                    </Form.Item>
                </Form>
            </Modal>

        </div>
    );
};

export default ProductPage;