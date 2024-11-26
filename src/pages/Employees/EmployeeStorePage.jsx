import { useState, useEffect } from 'react';
import { Table, Modal, Form, Input, Select, notification, Button, Space, Tooltip, Tag, Upload } from 'antd';
import { EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar';
import logoWash from '../../assets/images/logowashsmall.png';
import AdminSideB from '../../components/AdminSidebar';
import { Box } from '@mui/material';

const API_URL_EMPLOYEES = 'https://washintonbackend.store/api/user/';
const API_URL_STORES = 'https://washintonbackend.store/api/store';

//const { Option } = Select;

const EmployeePage = () => {
   const [employees, setEmployees] = useState([]);
   const [stores, setStores] = useState([]);
   const [isModalVisible, setIsModalVisible] = useState(false);
   const [editingEmployee, setEditingEmployee] = useState(null);
   const [form] = Form.useForm();
   const [searchText, setSearchText] = useState('');
   const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total:0 });
   const [storeFilter, setStoreFilter] = useState(null);

   
    // Función para obtener empleados
   const fetchEmployees = async () => {
       try {
           const response = await fetch(API_URL_EMPLOYEES);
           if (!response.ok) throw new Error('Error fetching employees');
           const data = await response.json();
           console.log('Datos recibidos:', data);
           setEmployees(data);
       } catch (error) {
           notification.error({ message: error.message || 'Error al cargar empleados' });
       }
   };
    // Función para obtener tiendas
   const fetchStores = async () => {
       try {
           const response = await fetch(API_URL_STORES);
           console.log('Response status:', response.status); // Ver el código de estado HTTP
           console.log('Response:', response); // Ver la respuesta completa
           
           if (!response.ok) {
               const errorData = await response.text();
               console.error('Error response:', errorData);
               throw new Error(`Error fetching stores: ${response.status} ${errorData}`);
           }
           
           const data = await response.json();
           console.log('Stores data:', data); // Ver los datos recibidos
           setStores(data);
       } catch (error) {
           console.error('Fetch error:', error); // Ver el error completo
           notification.error({ 
               message: 'Error al cargar tiendas', 
               description: error.message 
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
           render: (role) => <Tag color="purple">{role || 'N/A'}</Tag>,
       },
       {
           title: 'Tienda',
           dataIndex: 'store_id',
           key: 'store_id',
           render: (storeId) => {
               const store = stores.find(s => s.store_id === storeId);
               return <Tag color="orange">{store?.name || 'N/A'}</Tag>;
           },
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
                    title="Empleados" 
                    buttonText="Agregar Empleado" 
                    onAddCategory={handleAdd} 
                    onSearch={(value) => setSearchText(value)}
                />
                
                <div style={{ maxWidth: '90%', margin: '0 auto 16px auto' }}>
                    <Select
                        placeholder="Filtrar por tienda"
                        allowClear
                        style={{ width: 300 }}
                        onChange={(value) => setStoreFilter(value)}
                    >
                        {stores.map(store => (
                            <Select.Option 
                                key={store.store_id} 
                                value={store.store_id}
                            >
                                {`${store.name} - ${store.city}`}
                            </Select.Option>
                        ))}
                    </Select>
                </div>

                <Table 
                    dataSource={employees.filter(emp => 
                        (!searchText || 
                            emp.first_name?.toLowerCase().includes(searchText.toLowerCase()) ||
                            emp.last_name?.toLowerCase().includes(searchText.toLowerCase()) ||
                            emp.email?.toLowerCase().includes(searchText.toLowerCase())
                        ) &&
                        (!storeFilter || emp.store_id === storeFilter)
                    )} 
                    columns={columns} 
                    rowKey="id_usuario"
                    pagination={pagination}
                    onChange={(pagination) => setPagination(pagination)}
                    style={{ maxWidth: '90%', margin: '0 auto' }}
                    bordered
                />

                <Modal
                    title={editingEmployee ? 'Editar Empleado' : 'Agregar Empleado'}
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
                        <Form.Item name="phone" label="Teléfono" rules={[{ required: true }]}>
                            <Input maxLength={10} />
                        </Form.Item>
                        <Form.Item name="role" label="Rol" rules={[{ required: true }]}>
                            <Select>
                                <Select.Option value="admin">Admin</Select.Option>
                                <Select.Option value="store">Store</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="store_id" label="Tienda" rules={[{ required: true }]}>
                            <Select>
                                {stores.map(store => (
                                    <Select.Option 
                                        key={store.store_id} 
                                        value={store.store_id}
                                    >
                                        {store.name}
                                    </Select.Option>
                                ))}
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

export default EmployeePage;