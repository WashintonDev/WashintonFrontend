import React, { useState, useEffect, useMemo } from 'react';
import {
  Layout,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Checkbox,
  Typography,
  Space,
  Tooltip,
  Spin,
  notification,
  Switch,
  Select,
  Card,
  Row,
  Col,
  List,
  Avatar,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined,
  UserOutlined,
  LockOutlined,
  TeamOutlined,
  BarChartOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  BulbOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Pie } from '@ant-design/plots';
import SideBarAdmin from '../../components/SideBarAdmin';
import { API_URL_ROLES } from '../../services/ApisConfig';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [historyDialog, setHistoryDialog] = useState(false);
  const [roleHistory, setRoleHistory] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentRole, setCurrentRole] = useState({
    name: '',
    description: '',
    permissions: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL_ROLES, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar los roles');
      }

      const data = await response.json();
      const formattedRoles = data.map(role => ({
        id: role.role_id,
        name: role.name,
        description: role.description || '',
        permissions: JSON.parse(role.permissions),
      }));

      setRoles(formattedRoles);
    } catch (error) {
      notification.error({
        message: 'Error al cargar los roles',
        description: 'Por favor, intente nuevamente más tarde.',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleHistory = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockHistory = [
        {
          id: 1,
          action: 'create',
          roleName: 'Administrador',
          user: 'Juan Pérez',
          timestamp: new Date('2024-01-20T10:30:00'),
          description: 'Creación del rol Administrador',
        },
        {
          id: 2,
          action: 'update',
          roleName: 'Vendedor',
          user: 'María García',
          timestamp: new Date('2024-01-21T15:45:00'),
          description: 'Actualización de permisos',
          changes: {
            'Gestión de Ventas': { from: 'No', to: 'Sí' },
            'Gestión de Inventario': { from: 'No', to: 'Sí' },
          },
        },
        {
          id: 3,
          action: 'delete',
          roleName: 'Invitado',
          user: 'Carlos Rodríguez',
          timestamp: new Date('2024-01-22T09:15:00'),
          description: 'Eliminación del rol Invitado',
        },
      ];
      setRoleHistory(mockHistory);
    } catch (error) {
      notification.error({
        message: 'Error al cargar el historial',
        description: 'Por favor, intente nuevamente más tarde.',
      });
    }
  };

  const handleOpenDialog = (role = null) => {
    if (role) {
      setCurrentRole({
        ...role,
        permissions: role.permissions,
      });
      setIsEditing(true);
      form.setFieldsValue({
        ...role,
        permissions: role.permissions,
      });
    } else {
      setCurrentRole({
        name: '',
        description: '',
        permissions: [],
      });
      setIsEditing(false);
      form.resetFields();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentRole({
      name: '',
      description: '',
      permissions: [],
    });
    setIsEditing(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const permissions = JSON.stringify(values.permissions);

      if (isEditing) {
        const response = await fetch(`${API_URL_ROLES}${currentRole.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...values, permissions }),
        });

        if (!response.ok) {
          throw new Error('Error al actualizar el rol');
        }

        setRoles(roles.map(role => (role.id === currentRole.id ? { ...role, ...values, permissions: JSON.parse(permissions) } : role)));
        notification.success({
          message: 'Rol actualizado exitosamente',
        });
      } else {
        const response = await fetch(API_URL_ROLES, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...values, permissions }),
        });

        if (!response.ok) {
          throw new Error('Error al crear el rol');
        }

        const newRole = await response.json();
        setRoles([...roles, { ...newRole, permissions: JSON.parse(newRole.permissions) }]);
        notification.success({
          message: 'Rol creado exitosamente',
        });
      }
      handleCloseDialog();
    } catch (error) {
      notification.error({
        message: 'Error al procesar la operación',
        description: 'Por favor, verifique los datos e intente nuevamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '¿Estás seguro de que deseas eliminar este rol?',
      content: 'Esta acción no se puede deshacer.',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        setLoading(true);
        try {
          const response = await fetch(`${API_URL_ROLES}${id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Error al eliminar el rol');
          }

          setRoles(roles.filter(role => role.id !== id));
          notification.success({
            message: 'Rol eliminado exitosamente',
          });
        } catch (error) {
            console.error("Error al obtener roles:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRolesFromDB();
    }, []);

    const handleOpenModal = () => {
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleRoleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setCurrentRole((prevRole) => ({
            ...prevRole,
            permissions: {
                ...prevRole.permissions,
                [name]: type === 'checkbox' ? checked : value
            },
            name: type !== 'checkbox' ? value : prevRole.name
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const permissionsArray = Object.entries(currentRole.permissions)
            .filter(([key, value]) => value) // Filtrar solo los permisos marcados como true
            .map(([key]) => key); // Mapear a solo los nombres de los permisos

        const roleToSend = {
            name: currentRole.name,
            permissions: permissionsArray
        };

        console.log('Datos a enviar:', roleToSend); // Verifica la estructura

        fetch(API_URL_ROLES, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(roleToSend),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Rol creado con éxito:', data);
            handleCloseModal(); // Cerrar el modal después de crear el rol
            fetchRolesFromDB(); // Actualizar la lista de roles después de crear uno nuevo
        })
        .catch(error => {
            console.error('Error al crear el rol:', error);
        });
    };

    return (
        <div style={{ marginLeft: '250px' }}>
            <AdminSideB />
            <Navbar title="Gestión de Roles" />
            {loading ? (
                <Row justify="center" style={{ marginTop: '32px' }}>
                    <CircularProgress />
                </Row>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            {/* <Button variant="contained" color="primary" onClick={handleOpenModal}>Crear Rol</Button> */}
                            <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Permisos</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {roles.map((role) => (
                                <TableRow key={role.role_id}>
                                    <TableCell>{role.name}</TableCell>
                                    <TableCell>
                                        <Row justify="start" wrap="true" gutter={[8, 8]}>
                                            {JSON.parse(role.permissions).map((permission) => (
                                                <Chip
                                                    key={permission}
                                                    label={permissionLabels[permission] || permission}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            ))}
                                        </Row>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <UserRoleAssignment />
                </TableContainer>
            )}
            <Modal
                title="Crear Rol"
                visible={openModal}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="submit" type="primary" onClick={handleSubmit}>
                        Crear Rol
                    </Button>
                ]}
            >
              <Input prefix={<LockOutlined />} />
            </Form.Item>
            <Form.Item
              name="description"
              label="Descripción"
              rules={[{ required: true, message: 'Por favor ingrese la descripción del rol' }]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item label="Permisos" name="permissions">
              <Checkbox.Group style={{ width: '100%' }}>
                <Row>
                  <Col span={12}>
                    <Checkbox value="create_users">Crear Usuarios</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="delete_users">Eliminar Usuarios</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="edit_users">Editar Usuarios</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="transferOrders">Transferir Pedidos</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="dispatch">Despachar</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="sales">Ventas</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="registerSales">Registrar Ventas</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="viewReports">Ver Reportes</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="suppliers">Proveedores</Checkbox>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Historial de Cambios de Roles"
          visible={historyDialog}
          onCancel={() => setHistoryDialog(false)}
          footer={null}
          width={800}
        >
          <List
            itemLayout="horizontal"
            dataSource={roleHistory}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={
                        item.action === 'create' ? <PlusOutlined /> :
                        item.action === 'update' ? <EditOutlined /> :
                        <DeleteOutlined />
                      }
                      style={{
                        backgroundColor:
                          item.action === 'create' ? '#52c41a' :
                          item.action === 'update' ? '#1890ff' :
                          '#f5222d'
                      }}
                    />
                  }
                  title={
                    <Space>
                      <Text strong>{item.action === 'create' ? 'Creación' : item.action === 'update' ? 'Actualización' : 'Eliminación'}</Text>
                      <Text type="secondary">{item.roleName}</Text>
                    </Space>
                  }
                  description={
                    <>
                      <Text>{item.description}</Text>
                      <br />
                      <Text type="secondary">
                        {`Por ${item.user} el ${item.timestamp.toLocaleString()}`}
                      </Text>
                    </>
                  }
                />
                {item.changes && (
                  <Space direction="vertical">
                    {Object.entries(item.changes).map(([key, value]) => (
                      <Text key={key}>
                        {`${key}: ${value.from} → ${value.to}`}
                      </Text>
                    ))}
                  </Space>
                )}
              </List.Item>
            )}
          />
        </Modal>
      </Content>
    </Layout>
  );
};

export default RoleManagement;