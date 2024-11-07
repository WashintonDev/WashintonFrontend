import React, { useEffect, useState } from 'react';
import { Table, Modal, Form, Input, notification, Button, Space, Tooltip, Tag } from 'antd';
import { API_URL_STORES } from '../../services/ApisConfig';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar'; // Asegúrate de que la ruta sea correcta

const StorePage = () => {
    const [stores, setStores] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingStore, setEditingStore] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const response = await fetch(API_URL_STORES);
            if (!response.ok) throw new Error('Error fetching stores');
            const data = await response.json();
            // Ordenar tiendas por ID
            const sortedStores = data.sort((a, b) => a.store_id - b.store_id);
            setStores(sortedStores);
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching stores' });
        }
    };

    const handleAdd = () => {
        setEditingStore(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (store) => {
        setEditingStore(store);
        form.setFieldsValue({ 
            name: store.name, 
            phone: store.phone,
            address: store.address,
            city: store.city,
            state: store.state
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (store_id) => {
        try {
            await fetch(`${API_URL_STORES}${store_id}/`, { method: 'DELETE' });
            notification.success({ message: 'Store deleted successfully' });
            fetchStores();
        } catch (error) {
            notification.error({ message: error.message || 'Error deleting store' });
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingStore) {
                await fetch(`${API_URL_STORES}${editingStore.store_id}/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                });
                notification.success({ message: 'Store updated successfully' });
            } else {
                await fetch(API_URL_STORES, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                });
                notification.success({ message: 'Store created successfully' });
            }
            fetchStores();
            setIsModalVisible(false);
        } catch (error) {
            notification.error({ message: error.message || 'Error saving store' });
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

    const filteredStores = stores.filter(store => 
        normalizeText(store.name).toLowerCase().includes(normalizeText(searchText).toLowerCase()) ||
        normalizeText(store.address).toLowerCase().includes(normalizeText(searchText).toLowerCase())
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
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            ellipsis: true, // Añade ellipsis para textos largos
            render: (text, record) => (
                <Tag color="blue">{record.phone}</Tag>
            ),
            width: 150, // Establece un ancho fijo para la columna de Phone
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            ellipsis: true, // Añade ellipsis para textos largos
            width: 425,
        },
        {
            title: 'City',
            dataIndex: 'city',
            key: 'city',
            ellipsis: true, // Añade ellipsis para textos largos
            render: (text, record) => (
                <Tag color="pink">{record.city}</Tag>
            ),
            width: 225,
        },
        {
            title: 'State',
            dataIndex: 'state',
            key: 'state',
            ellipsis: true, // Añade ellipsis para textos largos
            render: (text, record) => (
                <Tag color="purple">{record.state}</Tag>
            ),
            width: 225,
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
                            onClick={() => handleDelete(record.store_id)}
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
                title="Stores" 
                buttonText="Add Store" 
                onAddCategory={handleAdd} 
                onSearch={handleSearch} // Pasa la función de búsqueda al Navbar
            />

            <Table 
                dataSource={filteredStores} 
                columns={columns} 
                rowKey="store_id" 
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: filteredStores.length,
                    showSizeChanger: true,
                    onChange: (page, pageSize) => {
                        setPagination({ current: page, pageSize });
                    },
                }} // Configura la paginación
                style={{ maxWidth: '80%', margin: '0 auto', fontSize: '0.9em' }} // Ancho máximo y centrado
                bordered // Agregar bordes para mejorar la visualización
            />

            <Modal
                title={editingStore ? 'Edit Store' : 'Add Store'}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input the store name!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="phone" label="Phone" rules={[{ required: true, message: 'Please input the phone!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="address" label="Address">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item name="city" label="City" rules={[{ required: true, message: 'Please input the city!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="state" label="State" rules={[{ required: true, message: 'Please input the state!' }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default StorePage;
