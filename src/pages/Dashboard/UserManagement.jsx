import { useState, useEffect } from 'react';
import { Table, Modal, Form, Input, Select, notification, Button, Space, Tooltip, Tag, Upload } from 'antd';
import { EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar';
import logoWash from '../../assets/images/logowashsmall.png';
import { BASE_API_URL } from '../../services/ApisConfig';
import AdminSideB from '../../components/AdminSidebar';
import { Box } from '@mui/material';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [loading, setLoading] = useState(true);

    // Función para obtener usuarios
    const fetchUsers = async () => {
        try {
            const response = await fetch(`${BASE_API_URL}user`);
            if (!response.ok) throw new Error('Error fetching users');
            const data = await response.json();
            setUsers(data);
            setLoading(false);
        } catch (error) {
            notification.error({ message: error.message || 'Error al cargar usuarios' });
            setLoading(false);
        }
    };

    // Función para manejar el guardado
    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingUser) {
                await fetch(`${BASE_API_URL}user/${editingUser.user_id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
                });
                notification.success({ message: 'Usuario actualizado exitosamente' });
            } else {
                await fetch(`${BASE_API_URL}user`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
                });
                notification.success({ message: 'Usuario creado exitosamente' });
            }
            setIsModalVisible(false);
            fetchUsers();
        } catch (error) {
            notification.error({ message: error.message || 'Error al guardar usuario' });
        }
    };

    // Función para manejar la eliminación
    const handleDelete = async (id) => {
        try {
            await fetch(`${BASE_API_URL}user/${id}`, { method: 'DELETE' });
            notification.success({ message: 'Usuario eliminado exitosamente' });
            fetchUsers();
        } catch (error) {
            notification.error({ message: error.message || 'Error al eliminar usuario' });
        }
    };

    // Función para manejar la edición
    const handleEdit = (user) => {
        setEditingUser(user);
        form.setFieldsValue({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone,
            role: user.role
        });
        setIsModalVisible(true);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const columns = [
        {
            title: 'No.',
            key: 'index',
            render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
            width: 60,
        },
        {
            title: 'Nombre',
            dataIndex: 'first_name',
            key: 'first_name',
            render: (_, record) => `${record.first_name} ${record.last_name}`,
            ellipsis: true,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            ellipsis: true,
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Rol',
            dataIndex: 'role',
            key: 'role',
            render: (role) => <Tag color="purple">{role || 'N/A'}</Tag>,
        },
        {
            title: 'Estado',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={status === 'active' ? 'green' : 'red'}>{status}</Tag>,
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Editar" placement="bottom">
                        <Button 
                            type="link" 
                            icon={<EditOutlined />} 
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Eliminar" placement="bottom">
                        <Button 
                            danger 
                            type="link" 
                            icon={<DeleteOutlined />} 
                            onClick={() => handleDelete(record.user_id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const handleAdd = () => {
        setEditingUser(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    return (
        <Box sx={{ marginLeft: '250px' }}>
            <AdminSideB />
            <div>
                <Navbar 
                    title="Gestión de Usuarios" 
                    buttonText="Agregar Usuario" 
                    onAddCategory={handleAdd} 
                    onSearch={(value) => setSearchText(value)}
                />

                <Table 
                    loading={loading}
                    dataSource={users.filter(user => 
                        !searchText || 
                        user.first_name?.toLowerCase().includes(searchText.toLowerCase()) ||
                        user.last_name?.toLowerCase().includes(searchText.toLowerCase()) ||
                        user.email?.toLowerCase().includes(searchText.toLowerCase())
                    )} 
                    columns={columns} 
                    rowKey="user_id"
                    pagination={pagination}
                    onChange={(pagination) => setPagination(pagination)}
                    style={{ maxWidth: '90%', margin: '0 auto' }}
                    bordered
                />

                <Modal
                    title={editingUser ? 'Editar Usuario' : 'Agregar Usuario'}
                    open={isModalVisible}
                    onOk={handleOk}
                    onCancel={() => setIsModalVisible(false)}
                    width={700}
                >
                    <Form form={form} layout="vertical">
                        <Form.Item name="first_name" label="Nombre" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="last_name" label="Apellido" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item 
                            name="email" 
                            label="Email" 
                            rules={[
                                { required: true },
                                { type: 'email' }
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item name="role" label="Rol" rules={[{ required: true }]}>
                            <Select>
                                <Select.Option value="admin">Admin</Select.Option>
                                <Select.Option value="store">Store</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="foto" label="Foto">
                            <Upload>
                                <Button icon={<UploadOutlined />}>Seleccionar Foto</Button>
                            </Upload>
                        </Form.Item>
                    </Form>
                </Modal>

                <div style={{ 
                    padding: '20px', 
                    maxWidth: '90%', 
                    margin: '0 auto',
                    textAlign: 'left'
                }}>
                    <Button 
                        type="link" 
                        href="/admin"
                        style={{ fontSize: '18px' }}
                    >
                        <img 
                            src={logoWash}
                            style={{ height: '30px' }}
                        />
                    </Button>
                </div>
            </div>
        </Box>
    );
};

export default UserManagement;