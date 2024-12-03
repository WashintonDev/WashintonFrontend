import React, { useState, useEffect } from 'react';
import { message, Button, Spin, Table, Input, Modal, Tag, Space, Skeleton, Layout } from 'antd';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import { BASE_API_URL } from '../../services/ApisConfig';
import SideBarAdmin from '../../components/SideBarAdmin';
import UserRoleAssignment from '../../components/RolSelector';
const { Search } = Input;
const { Header, Content, Sider } = Layout;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [permissionsModalVisible, setPermissionsModalVisible] = useState(false);
  const [userPermissions, setUserPermissions] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role === "admin") {
      setIsAdmin(true);
    } else {
      setLoading(false);
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadRoles();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }

      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      message.error('Error al cargar usuarios: ' + err.message);
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}roles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar roles');
      }

      const data = await response.json();
      setRoles(data);
    } catch (err) {
      message.error('Error al cargar roles: ' + err.message);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleGoToSignup = () => {
    Modal.confirm({
      title: '¿Crear nuevo usuario?',
      content: 'Serás redirigido a la página de registro.',
      onOk() {
        navigate('/sign-up');
      },
    });
  };

  const showUserDetails = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedUser(null);
  };

  const showUserPermissions = async (user) => {
    try {
      const userRole = roles.find((role) => role.role_id === user.role_id);

      if (userRole) {
        setUserPermissions(JSON.parse(userRole.permissions));
        setPermissionsModalVisible(true);
      } else {
        message.error('Rol de usuario no encontrado');
      }
    } catch (err) {
      message.error('Error al cargar permisos: ' + err.message);
    }
  };

  const handlePermissionsModalClose = () => {
    setPermissionsModalVisible(false);
    setUserPermissions([]);
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'first_name',
      key: 'first_name',
      sorter: (a, b) => a.first_name.localeCompare(b.first_name),
      filteredValue: [searchText],
      onFilter: (value, record) =>
        (record.first_name && record.first_name.toLowerCase().includes(value.toLowerCase())) ||
        (record.email && record.email.toLowerCase().includes(value.toLowerCase())),
    },
    {
      title: 'Apellido',
      dataIndex: 'last_name',
      key: 'last_name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Rol',
      dataIndex: 'role_id',
      key: 'role_id',
      render: (role_id) => {
        const role = roles.find((r) => r.role_id === role_id);
        return <Tag color={role_id === 1 ? 'red' : 'green'}>{role ? role.name.toUpperCase() : 'USER'}</Tag>;
      },
      filters: roles.map((role) => ({ text: role.name, value: role.role_id })),
      onFilter: (value, record) => record.role_id === value,
    },
    {
      title: 'Estado',
      dataIndex: 'firebase_user_ID',
      key: 'firebase_user_ID',
      render: (firebase_user_ID) => (
        <Tag color={firebase_user_ID ? 'green' : 'volcano'}>
          {firebase_user_ID ? 'Activo' : 'Inactivo'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => showUserDetails(record)}>
            Ver detalles
          </Button>
          <Button type="link" onClick={() => showUserPermissions(record)}>
            Ver permisos
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton active />
        <Skeleton active />
        <Skeleton active />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
        <SideBarAdmin />
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }}>
          <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={handleGoToSignup}
              >
                Crear Nuevo Usuarioo
              </Button>
            </div>
            <div className="mb-4">
              <Search
                placeholder="Buscar por nombre o email"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
              />
            </div>
            <Table
              columns={columns}
              dataSource={users}
              rowKey="user_id"
              pagination={{ pageSize: 10 }}
              loading={loading}
            />
            <Modal
              title="Detalles del Usuario"
              visible={modalVisible}
              onCancel={handleModalClose}
              footer={[
                <Button key="back" onClick={handleModalClose}>
                  Cerrar
                </Button>,
              ]}
            >
              {selectedUser && (
                <div>
                  <p><strong>Nombre:</strong> {selectedUser.first_name}</p>
                  <p><strong>Apellido:</strong> {selectedUser.last_name}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Rol:</strong> {roles.find((r) => r.role_id === selectedUser.role_id)?.name.toUpperCase() || 'USER'}</p>
                  <p><strong>Estado:</strong> {selectedUser.firebase_user_ID ? 'Activo' : 'Inactivo'}</p>
                </div>
              )}
            </Modal>
            <Modal
              title="Permisos del Usuario"
              visible={permissionsModalVisible}
              onCancel={handlePermissionsModalClose}
              footer={[
                <Button key="back" onClick={handlePermissionsModalClose}>
                  Cerrar
                </Button>,
              ]}
            >
              <ul>
                {userPermissions.map((permission, index) => (
                  <li key={index}>{permission}</li>
                ))}
              </ul>
            </Modal>
          </div>
        </Content>
        <UserRoleAssignment />
      </Layout>
    </Layout>
  );
};

export default UserManagement;
