import { useState, useEffect } from 'react';
import { Table, Modal, Form, Input, Select, notification, Button, Space, Tooltip, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar';
import AdminSideB from '../../components/AdminSidebar';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const API_URL_EMPLOYEES = 'https://washintonbackend.store/api/user/';
const API_URL_STORES = 'https://washintonbackend.store/api/store';

const UserManagement = () => {
    const [employees, setEmployees] = useState([]);
    const navigate = useNavigate();
    const [stores, setStores] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [storeFilter, setStoreFilter] = useState(null);

    // Función para obtener empleados
    const fetchEmployees = async () => {
        try {
            const response = await fetch(API_URL_EMPLOYEES);
            if (!response.ok) throw new Error('Error fetching employees');
            const data = await response.json();
            setEmployees(data);
        } catch (error) {
            notification.error({ message: error.message || 'Error al cargar empleados' });
        }
    };

    const handleRedirect = () => {
        navigate("/sign-up"); // Aquí '/signup' es la ruta de tu página de SignUp
    };

    // Función para obtener tiendas
    const fetchStores = async () => {
        try {
            const response = await fetch(API_URL_STORES);
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Error fetching stores: ${response.status} - ${errorData}`);
            }
            const data = await response.json();
            setStores(data);
        } catch (error) {
            notification.error({
                message: 'Error al cargar tiendas',
                description: error.message,
            });
        }
    };

    // Función para manejar el guardado
    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingEmployee) {
                await fetch(`${API_URL_EMPLOYEES}${editingEmployee.id_usuario}/`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
                });
                notification.success({ message: 'Empleado actualizado exitosamente' });
            } else {
                await fetch(API_URL_EMPLOYEES, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
                });
                notification.success({ message: 'Empleado creado exitosamente' });
            }
            setIsModalVisible(false);
            fetchEmployees();
        } catch (error) {
            notification.error({ message: error.message || 'Error al guardar empleado' });
        }
    };

    // Función para manejar la eliminación
    const handleDelete = async (id) => {
        try {
            await fetch(`${API_URL_EMPLOYEES}${id}/`, { method: 'DELETE' });
            notification.success({ message: 'Empleado eliminado exitosamente' });
            fetchEmployees();
        } catch (error) {
            notification.error({ message: error.message || 'Error al eliminar empleado' });
        }
    };

    // Función para manejar la edición
    const handleEdit = (employee) => {
        setEditingEmployee(employee);
        form.setFieldsValue({
            first_name: employee.first_name,
            last_name: employee.last_name,
            email: employee.email,
            phone: employee.phone,
            role: employee.role,
            store_id: employee.store_id,
        });
        setIsModalVisible(true);
    };

    useEffect(() => {
        fetchEmployees();
        fetchStores();
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
            title: 'Teléfono',
            dataIndex: 'phone',
            key: 'phone',
            ellipsis: true,
            render: (text) => <Tag color="green">{text}</Tag>,
        },
        {
            title: 'Rol',
            dataIndex: 'role',
            key: 'role',
            filters: [
                { text: 'Admin', value: 'admin' },
                { text: 'Store', value: 'store' },
            ],
            onFilter: (value, record) => record.role === value,
            render: (role) => <Tag color="purple">{role || 'N/A'}</Tag>,
        },
        {
            title: 'Tienda',
            dataIndex: 'store_id',
            key: 'store_id',
            filters: stores.map((store) => ({ text: store.name, value: store.store_id })),
            onFilter: (value, record) => record.store_id === value,
            render: (storeId) => {
                const store = stores.find((s) => s.store_id === storeId);
                return <Tag color="orange">{store?.name || 'N/A'}</Tag>;
            },
        },
        {
            title: 'Acciones',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Editar" placement="bottom">
                        <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    </Tooltip>
                    <Tooltip title="Eliminar" placement="bottom">
                        <Button
                            danger
                            type="link"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record.id_usuario)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const handleAdd = () => {
        setEditingEmployee(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    return (
        <Box sx={{ marginLeft: '250px' }}>
            <AdminSideB />
            <div>
                <Navbar
                    title="Manejo de Usuarios"
                    buttonText="Agregar Usuario"
                    onAddCategory={handleRedirect}
                    onSearch={(value) => setSearchText(value)}
                    
                />
                <div style={{ maxWidth: '90%', margin: '0 auto 16px auto' }}>
                    <Select
                        placeholder="Filtrar por tienda"
                        allowClear
                        style={{ width: 300 }}
                        onChange={(value) => setStoreFilter(value)}
                    >
                        {stores.map((store) => (
                            <Select.Option key={store.store_id} value={store.store_id}>
                                {`${store.name} - ${store.city}`}
                            </Select.Option>
                        ))}
                    </Select>
                </div>
                <Table
                    dataSource={employees.filter(
                        (emp) =>
                            (!searchText ||
                                emp.first_name?.toLowerCase().includes(searchText.toLowerCase()) ||
                                emp.last_name?.toLowerCase().includes(searchText.toLowerCase()) ||
                                emp.email?.toLowerCase().includes(searchText.toLowerCase())) &&
                            (!storeFilter || emp.store_id === storeFilter)
                    )}
                    columns={columns}
                    rowKey="id_usuario"
                    pagination={pagination}
                    onChange={(pagination) => setPagination(pagination)}
                    style={{ maxWidth: '90%', margin: '0 auto' }}
                    bordered
                />
               
            </div>
        </Box>
    );
};

export default UserManagement;
