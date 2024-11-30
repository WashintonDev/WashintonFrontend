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
import SideBarAdmin from '../../components/SideBarAdmin'; // Asegúrate de que esta ruta es correcta
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockRoles = [
        {
          id: 1,
          name: 'Administrador',
          description: 'Control total del sistema',
          permissions: [
            'canManageUsers',
            'canManageRoles',
            'canManageInventory',
            'canManageSales',
            'canViewReports',
            'canManageSuppliers',
          ],
        },
        {
          id: 2,
          name: 'Vendedor',
          description: 'Gestión de ventas e inventario',
          permissions: [
            'canManageInventory',
            'canManageSales',
            'canViewReports',
          ],
        },
        {
          id: 3,
          name: 'Analista',
          description: 'Visualización de reportes',
          permissions: [
            'canViewReports',
          ],
        },
      ];
      setRoles(mockRoles);
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
        permissions: Object.keys(role.permissions).filter(key => role.permissions[key]),
      });
      setIsEditing(true);
      form.setFieldsValue({
        ...role,
        permissions: Object.keys(role.permissions).filter(key => role.permissions[key]),
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
      await new Promise(resolve => setTimeout(resolve, 1000));

      const permissions = values.permissions.reduce((acc, permission) => {
        acc[permission] = true;
        return acc;
      }, {});

      if (isEditing) {
        setRoles(roles.map(role => (role.id === currentRole.id ? { ...role, ...values, permissions } : role)));
        notification.success({
          message: 'Rol actualizado exitosamente',
        });
      } else {
        const newRole = { ...values, id: roles.length + 1, permissions };
        setRoles([...roles, newRole]);
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
          await new Promise(resolve => setTimeout(resolve, 1000));
          setRoles(roles.filter(role => role.id !== id));
          notification.success({
            message: 'Rol eliminado exitosamente',
          });
        } catch (error) {
          notification.error({
            message: 'Error al eliminar el rol',
            description: 'Por favor, intente nuevamente más tarde.',
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const filteredRoles = useMemo(() => {
    return roles.filter(role =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roles, searchTerm]);

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Permisos',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions) => (
        <Space wrap>
          {permissions.map(permission => (
            <Tag key={permission} color="blue">
              {permission.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, role) => (
        <Space size="middle">
          <Tooltip title="Editar">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleOpenDialog(role)}
              type="primary"
              ghost
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(role.id)}
              danger
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const permissionDistribution = useMemo(() => {
    const distribution = {};
    roles.forEach(role => {
      role.permissions.forEach(permission => {
        distribution[permission] = (distribution[permission] || 0) + 1;
      });
    });
    return Object.entries(distribution).map(([key, value]) => ({
      type: key.replace('can', '').replace(/([A-Z])/g, ' $1').trim(),
      value,
    }));
  }, [roles]);

  const pieConfig = {
    appendPadding: 10,
    data: permissionDistribution,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [
      { type: 'pie-legend-active' },
      { type: 'element-active' },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }} className={darkMode ? 'dark' : ''}>
      <SideBarAdmin />
      <Content style={{ padding: '24px', backgroundColor: darkMode ? '#141414' : '#f0f2f5' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            title={
              <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                <Title level={3} style={{ margin: 0, color: darkMode ? '#fff' : 'inherit' }}>
                  Gestión Avanzada de Roles
                </Title>
                <Space>
                  <Switch
                    checkedChildren={<BulbOutlined />}
                    unCheckedChildren={<BulbOutlined />}
                    checked={darkMode}
                    onChange={setDarkMode}
                  />
                  <Input
                    placeholder="Buscar roles..."
                    prefix={<SearchOutlined />}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ width: 200 }}
                  />
                </Space>
              </Space>
            }
            style={{ backgroundColor: darkMode ? '#1f1f1f' : '#fff' }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Row gutter={16}>
                <Col span={16}>
                  <Card
                    title="Lista de Roles"
                    extra={
                      <Space>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => handleOpenDialog()}
                        >
                          Nuevo Rol
                        </Button>
                        <Button
                          icon={<HistoryOutlined />}
                          onClick={() => {
                            fetchRoleHistory();
                            setHistoryDialog(true);
                          }}
                        >
                          Ver Historial
                        </Button>
                      </Space>
                    }
                    style={{ backgroundColor: darkMode ? '#141414' : '#fff' }}
                  >
                    <Table
                      columns={columns}
                      dataSource={filteredRoles}
                      rowKey="id"
                      loading={loading}
                      pagination={{ pageSize: 5 }}
                      style={{ backgroundColor: darkMode ? '#141414' : '#fff' }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card
                    title="Distribución de Permisos"
                    style={{ backgroundColor: darkMode ? '#141414' : '#fff' }}
                  >
                    <Pie {...pieConfig} />
                  </Card>
                </Col>
              </Row>
            </Space>
          </Card>
        </motion.div>

        <Modal
          title={isEditing ? 'Editar Rol' : 'Crear Nuevo Rol'}
          visible={openDialog}
          onCancel={handleCloseDialog}
          footer={[
            <Button key="back" onClick={handleCloseDialog}>
              Cancelar
            </Button>,
            <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
              {isEditing ? 'Actualizar' : 'Crear'}
            </Button>,
          ]}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="Nombre del Rol"
              rules={[{ required: true, message: 'Por favor ingrese el nombre del rol' }]}
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
                    <Checkbox value="canManageUsers">Gestionar Usuarios</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="canManageRoles">Gestionar Roles</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="canManageInventory">Gestionar Inventario</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="canManageSales">Gestionar Ventas</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="canViewReports">Ver Reportes</Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox value="canManageSuppliers">Gestionar Proveedores</Checkbox>
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