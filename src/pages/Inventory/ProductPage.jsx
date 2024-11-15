import React, { useEffect, useState } from 'react';
import { Table, Modal, Form, Input, notification, Button, Space, Tooltip, Tag, Image, Select, Upload } from 'antd';
import { API_URL_PRODUCTS, API_URL_CATEGORIES, API_URL_SUPPLIERS } from '../../services/ApisConfig';
import { EditOutlined, DeleteOutlined, DollarOutlined, UploadOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar';

const { Option } = Select;

const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [parentCategories, setParentCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form] = Form.useForm();
    const [file, setFile] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchSuppliers();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch(API_URL_CATEGORIES);
            if (!response.ok) throw new Error('Error fetching categories');
            const data = await response.json();
            setCategories(data);
            setParentCategories(data.filter(cat => cat.parent_id === null));
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching categories' });
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await fetch(API_URL_SUPPLIERS);
            if (!response.ok) throw new Error('Error fetching suppliers');
            const data = await response.json();
            setSuppliers(data);
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching suppliers' });
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch(API_URL_PRODUCTS);
            if (!response.ok) throw new Error('Error fetching products');
            const data = await response.json();
            setProducts(data.sort((a, b) => a.product_id - b.product_id));
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching products' });
        }
    };

    const handleAdd = () => {
        setEditingProduct(null);
        form.resetFields();
        setFile([]); // Esto asegura que esté vacío al agregar un nuevo producto
        setIsModalVisible(true);
    };
    

    const handleEdit = async (product) => {
        setEditingProduct(product);
    
        try {
            const response = await fetch(`${API_URL_PRODUCTS}sku/${product.sku}`);
            if (!response.ok) throw new Error('Error fetching product with categories');
            const data = await response.json();
    
            const subCategory = data.sub_category_name;
            const parentCategory = data.parent_category_name;
    
            setSubCategories(categories.filter(cat => cat.parent_id === categories.find(cat => cat.name === parentCategory)?.category_id));
    
            form.setFieldsValue({
                name: data.product.name,
                description: data.product.description,
                price: data.product.price,
                type: data.product.type,
                category_id: categories.find(cat => cat.name === subCategory)?.category_id,
                supplier_id: data.product.supplier_id,
                status: data.product.status,
                parentCategory: categories.find(cat => cat.name === parentCategory)?.category_id,
            });

            // Configurar la imagen actual para su previsualización
            setFile(data.product.image ? [{
                uid: '-1',
                name: 'image.png',
                status: 'done',
                url: `https://washinton.store/${data.product.image}`,
            }] : []);
            setIsModalVisible(true);
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching product with categories' });
        }
    };

    const handleUploadChange = ({ fileList }) => {
        setFile(fileList.slice(-1)); // Mantén solo el último archivo seleccionado para evitar duplicados
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
            const jsonPayload = {};
    
            Object.keys(values).forEach(key => {
                if (key !== 'sku' && (!editingProduct || editingProduct[key] !== values[key])) {
                    jsonPayload[key] = values[key];
                }
            });
    
            let body;
            let headers = {};
    
            // Usar FormData si hay un archivo para enviar
            if (file && file.length > 0 && file[0].originFileObj) {
                const formData = new FormData();
                Object.keys(jsonPayload).forEach(key => formData.append(key, jsonPayload[key]));
                formData.append('image', file[0].originFileObj);
                body = formData;
            } else {
                // Si no hay archivo, enviamos JSON
                body = JSON.stringify(jsonPayload);
                headers = { 'Content-Type': 'application/json' };
            }
    
            // Verificar la URL
            const url = editingProduct
                ? `${API_URL_PRODUCTS}${editingProduct.product_id}/`
                : API_URL_PRODUCTS;
    
            console.log("Datos para JSON (Postman):", JSON.stringify(jsonPayload, null, 2));
            console.log("URL de actualización o creación:", url);
    
            const options = {
                method: editingProduct ? 'PATCH' : 'POST',
                headers,
                body,
            };
    
            const response = await fetch(url, options);
    
            if (response.ok) {
                notification.success({ message: editingProduct ? 'Product updated successfully' : 'Product created successfully' });
                fetchProducts();
                setIsModalVisible(false);
            } else {
                const errorData = await response.json();
                console.error("Error en la respuesta del servidor:", errorData);
                throw new Error('Error saving product');
            }
        } catch (error) {
            console.error("Fetch error:", error);
            notification.error({ message: error.message || 'Error saving product' });
        }
    };
    
    

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleParentCategoryChange = (parentId) => {
        setSubCategories(categories.filter(cat => cat.parent_id === parentId));
        form.setFieldsValue({ category_id: null });
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
            width: 130,
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
                    src={record.image ? `https://washinton.store/${record.image}` : 'https://via.placeholder.com/50'}
                    preview={{ 
                        src: record.image ? `https://washinton.store/${record.image}` : 'https://via.placeholder.com/800', 
                        title: record.name 
                    }}
                    style={{
                        cursor: 'pointer',
                        objectFit: 'contain',
                        borderRadius: '5px',
                    }}
                />
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Edit">
                        <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button danger type="link" icon={<DeleteOutlined />} onClick={() => handleDelete(record.product_id)} />
                    </Tooltip>
                </Space>
            ),
            width: 120,
        },
    ];

    return (
        <div>
            <Navbar title="Products" buttonText="Add Product" onAddCategory={handleAdd} />
            <Table
                dataSource={products.filter(product =>
                    product.name.toLowerCase().includes(searchText.toLowerCase()) ||
                    product.description.toLowerCase().includes(searchText.toLowerCase())
                )}
                columns={columns}
                rowKey="product_id"
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
                }}
            />
<Modal
    title={editingProduct ? 'Edit Product' : 'Add Product'}
    visible={isModalVisible}
    onOk={handleOk}
    onCancel={handleCancel}
>
    <Form form={form} layout="vertical">
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
            <Input.TextArea />
        </Form.Item>
        <Form.Item name="price" label="Price" rules={[{ required: true }]}>
            <Input />
        </Form.Item>
        <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Input />
        </Form.Item>
        <Form.Item label="Image">
    <Upload
        listType={file.length > 0 ? 'picture-card' : 'text'}
        fileList={file}
        onChange={handleUploadChange}
        beforeUpload={(selectedFile) => {
            setFile([{
                uid: '-1',
                name: selectedFile.name,
                status: 'done',
                url: URL.createObjectURL(selectedFile),
                originFileObj: selectedFile,
            }]);
            return false; // Prevenir el autoupload
        }}
        onRemove={() => setFile([])} // Asegúrate de que el archivo se elimine al removerlo
    >
        {file.length === 0 && <Button icon={<UploadOutlined />}>Select Image</Button>}
    </Upload>
</Form.Item>


        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
            </Select>
        </Form.Item>
        <Form.Item label="Category" name="parentCategory" rules={[{ required: true, message: 'Please select a category' }]}>
            <Select placeholder="Select parent category" onChange={handleParentCategoryChange}>
                {parentCategories.map(category => (
                    <Option key={category.category_id} value={category.category_id}>
                        {category.name}
                    </Option>
                ))}
            </Select>
        </Form.Item>
        <Form.Item name="category_id" label="Subcategory" rules={[{ required: true, message: 'Please select a subcategory' }]}>
            <Select placeholder="Select subcategory">
                {subCategories.map(subCategory => (
                    <Option key={subCategory.category_id} value={subCategory.category_id}>
                        {subCategory.name}
                    </Option>
                ))}
            </Select>
        </Form.Item>
        <Form.Item name="supplier_id" label="Supplier" rules={[{ required: true }]}>
            <Select showSearch placeholder="Select a supplier">
                {suppliers.map(supplier => (
                    <Option key={supplier.supplier_id} value={supplier.supplier_id}>
                        {supplier.name}
                    </Option>
                ))}
            </Select>
        </Form.Item>
    </Form>
</Modal>

        </div>
    );
    
    
};

export default ProductPage;
