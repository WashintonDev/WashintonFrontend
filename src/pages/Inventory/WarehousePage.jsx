import React, { useEffect, useState } from 'react';
import { Table, Modal, Form, Input, notification, Button, Space, Tooltip, Tag } from 'antd';
import { API_URL_WAREHOUSES } from '../../services/ApisConfig';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar'; // Asegúrate de que la ruta sea correcta

const WarehousePage = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        try {
            const response = await fetch(API_URL_WAREHOUSES);
            if (!response.ok) throw new Error('Error fetching warehouses');
            const data = await response.json();
            // Ordenar almacenes por ID
            const sortedWarehouses = data.sort((a, b) => a.warehouse_id - b.warehouse_id);
            setWarehouses(sortedWarehouses);
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching warehouses' });
        }
    };

    const handleAdd = () => {
        setEditingWarehouse(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (warehouse) => {
        setEditingWarehouse(warehouse);
        form.setFieldsValue({ 
            name: warehouse.name, 
            phone: warehouse.phone
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (warehouse_id) => {
        try {
            await fetch(`${API_URL_WAREHOUSES}${warehouse_id}/`, { method: 'DELETE' });
            notification.success({ message: 'Warehouse deleted successfully' });
            fetchWarehouses();
        } catch (error) {
            notification.error({ message: error.message || 'Error deleting warehouse' });
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingWarehouse) {
                await fetch(`${API_URL_WAREHOUSES}${editingWarehouse.warehouse_id}/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                });
                notification.success({ message: 'Warehouse updated successfully' });
            } else {
                await fetch(API_URL_WAREHOUSES, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                });
                notification.success({ message: 'Warehouse created successfully' });
            }
            fetchWarehouses();
            setIsModalVisible(false);
        } catch (error) {
            notification.error({ message: error.message || 'Error saving warehouse' });
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

    const filteredWarehouses = warehouses.filter(warehouse => 
        normalizeText(warehouse.name).toLowerCase().includes(normalizeText(searchText).toLowerCase())
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
            render: (text, record) => (
                <Tag color="blue">{record.phone}</Tag>
            ),
            ellipsis: true, // Añade ellipsis para textos largos
            width: 150, // Establece un ancho fijo para la columna de Phone
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
                            onClick={() => handleDelete(record.warehouse_id)}
                            style={{ padding: 0 }} // Reducir el padding para hacer el botón más pequeño
                        />
                    </Tooltip>
                </Space>
            ),
            width: 120, // Establece un ancho fijo para la columna de acciones
        },
    ];

    return (
        <div > {/* Agregar margen para evitar que la tabla toque los bordes */}
            <Navbar 
                title="Warehouses" 
                buttonText="Add Warehouse" 
                onAddCategory={handleAdd} 
                onSearch={handleSearch} // Pasa la función de búsqueda al Navbar
            />

            <Table 
                dataSource={filteredWarehouses} 
                columns={columns} 
                rowKey="warehouse_id" 
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: filteredWarehouses.length,
                    showSizeChanger: true,
                    onChange: (page, pageSize) => {
                        setPagination({ current: page, pageSize });
                    },
                }} // Configura la paginación
                style={{ maxWidth: '60%', margin: '0 auto', fontSize: '0.9em' }} // Ancho máximo y centrado
                bordered // Agregar bordes para mejorar la visualización
            />

            <Modal
                title={editingWarehouse ? 'Edit Warehouse' : 'Add Warehouse'}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input the warehouse name!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="phone" label="Phone" rules={[{ required: true, message: 'Please input the phone!' }]}>
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default WarehousePage;
