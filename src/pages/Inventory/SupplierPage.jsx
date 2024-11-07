import React, { useEffect, useState } from 'react';
import { Table, Modal, Form, Input, notification, Button, Space, Tooltip, Tag } from 'antd';
import { API_URL_SUPPLIERS } from '../../services/ApisConfig';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar'; // Asegúrate de que la ruta sea correcta

const SupplierPage = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const response = await fetch(API_URL_SUPPLIERS);
            if (!response.ok) throw new Error('Error fetching suppliers');
            const data = await response.json();
            // Ordenar proveedores por ID
            const sortedSuppliers = data.sort((a, b) => a.supplier_id - b.supplier_id);
            setSuppliers(sortedSuppliers);
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching suppliers' });
        }
    };

    const handleAdd = () => {
        setEditingSupplier(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        form.setFieldsValue({ 
            name: supplier.name, 
            email: supplier.email,
            phone: supplier.phone,
            description: supplier.description
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (supplier_id) => {
        try {
            await fetch(`${API_URL_SUPPLIERS}${supplier_id}/`, { method: 'DELETE' });
            notification.success({ message: 'Supplier deleted successfully' });
            fetchSuppliers();
        } catch (error) {
            notification.error({ message: error.message || 'Error deleting supplier' });
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingSupplier) {
                await fetch(`${API_URL_SUPPLIERS}${editingSupplier.supplier_id}/`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                });
                notification.success({ message: 'Supplier updated successfully' });
            } else {
                await fetch(API_URL_SUPPLIERS, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                });
                notification.success({ message: 'Supplier created successfully' });
            }
            fetchSuppliers();
            setIsModalVisible(false);
        } catch (error) {
            notification.error({ message: error.message || 'Error saving supplier' });
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

    const filteredSuppliers = suppliers.filter(supplier => 
        normalizeText(supplier.name).toLowerCase().includes(normalizeText(searchText).toLowerCase()) ||
        normalizeText(supplier.description).toLowerCase().includes(normalizeText(searchText).toLowerCase())
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
            width: 250,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            ellipsis: true, // Añade ellipsis para textos largos
            render: (text, record) => (
                <Tag color="">{record.email}</Tag>
            ),
            width: 250, // Establece un ancho fijo para la columna de Email
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
                            onClick={() => handleDelete(record.supplier_id)}
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
                title="Suppliers" 
                buttonText="Add Supplier" 
                onAddCategory={handleAdd} 
                onSearch={handleSearch} // Pasa la función de búsqueda al Navbar
            />

            <Table 
                dataSource={filteredSuppliers} 
                columns={columns} 
                rowKey="supplier_id" 
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: filteredSuppliers.length,
                    showSizeChanger: true,
                    onChange: (page, pageSize) => {
                        setPagination({ current: page, pageSize });
                    },
                }} // Configura la paginación
                style={{ maxWidth: '80%', margin: '0 auto', fontSize: '0.9em' }} // Ancho máximo y centrado
                bordered // Agregar bordes para mejorar la visualización
            />

            <Modal
                title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input the supplier name!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please input the email!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="phone" label="Phone" rules={[{ required: true, message: 'Please input the phone!' }]}>
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

export default SupplierPage;
