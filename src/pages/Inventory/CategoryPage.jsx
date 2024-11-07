import React, { useEffect, useState } from 'react';
import { Table, Modal, Form, Input, notification, Button, Space, Tooltip } from 'antd';
import { API_URL_CATEGORIES } from '../../services/ApisConfig';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar'; // Asegúrate de que la ruta sea correcta

const CategoryPage = () => {
    const [categories, setCategories] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch(API_URL_CATEGORIES);
            if (!response.ok) throw new Error('Error fetching categories');
            const data = await response.json();
            // Ordenar categorías por ID
            const sortedCategories = data.sort((a, b) => a.category_id - b.category_id);
            setCategories(sortedCategories);
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching categories' });
        }
    };

    const handleAdd = () => {
        setEditingCategory(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        form.setFieldsValue({ name: category.name, description: category.description });
        setIsModalVisible(true);
    };

    const handleDelete = async (category_id) => {
        try {
            await fetch(`${API_URL_CATEGORIES}${category_id}/`, { method: 'DELETE' });
            notification.success({ message: 'Category deleted successfully' });
            fetchCategories();
        } catch (error) {
            notification.error({ message: error.message || 'Error deleting category' });
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingCategory) {
                await fetch(`${API_URL_CATEGORIES}${editingCategory.category_id}/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                });
                notification.success({ message: 'Category updated successfully' });
            } else {
                await fetch(API_URL_CATEGORIES, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                });
                notification.success({ message: 'Category created successfully' });
            }
            fetchCategories();
            setIsModalVisible(false);
        } catch (error) {
            notification.error({ message: error.message || 'Error saving category' });
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const normalizeText = (text) => {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    const filteredCategories = categories.filter(category => 
        normalizeText(category.name).toLowerCase().includes(normalizeText(searchText).toLowerCase()) ||
        normalizeText(category.description).toLowerCase().includes(normalizeText(searchText).toLowerCase())
    );

    const columns = [
        {
            title: 'No.',
            key: 'index',
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1, // Enumeración ascendente
            width: 60, // Establece un ancho fijo para la columna de numeración
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true, // Añade ellipsis para textos largos
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true, // Añade ellipsis para textos largos
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
                            style={{ padding: 0 }} // Reducir el padding para hacer el botón más pequeño
                        />
                    </Tooltip>
                    <Tooltip title="Delete" placement="bottom">
                        <Button 
                            danger 
                            type="link" 
                            icon={<DeleteOutlined />} 
                            onClick={() => handleDelete(record.category_id)}
                            style={{ padding: 0 }} // Reducir el padding para hacer el botón más pequeño
                        />
                    </Tooltip>
                </Space>
            ),
            width: 120, // Establece un ancho fijo para la columna de acciones
        },
    ];

    return (
        <div> {/* Agregar margen para evitar que la tabla toque los bordes */}
            <Navbar 
                title="Categories" 
                buttonText="Add Category" 
                onAddCategory={handleAdd} 
                onSearch={handleSearch} // Pasa la función de búsqueda al Navbar
            />

            <Table 
                dataSource={filteredCategories} 
                columns={columns} 
                rowKey="category_id" 
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: filteredCategories.length,
                    showSizeChanger: true,
                    onChange: (page, pageSize) => {
                        setPagination({ current: page, pageSize });
                    },
                }} // Configura la paginación
                style={{ maxWidth: '80%', margin: '0 auto', fontSize: '0.9em' }} // Ancho máximo y centrado
                bordered // Agregar bordes para mejorar la visualización
            />

            <Modal
                title={editingCategory ? 'Edit Category' : 'Add Category'}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input the category name!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CategoryPage;
