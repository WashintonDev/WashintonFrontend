import { useState, useEffect } from 'react';
import { Button, Modal, Input, Checkbox, Row, Col, Table, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import AdminSideB from '../../components/AdminSidebar';
import Navbar from '../../components/Navbar'; 
import { API_URL_ROLES } from '../../services/ApisConfig';
import UserRoleAssignment from '../../components/RolSelector';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [currentRole, setCurrentRole] = useState({
        name: '',
        permissions: {
            registerProducts: false,
            warehouse_employee: false,
            transferOrders: false,
            manageSuppliers: false,
            sales: false,
            dispatch: false
        }
    });

    const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);

    const permissionLabels = {
        registerProducts: 'Registro de productos',
        warehouse_employee: 'Almacén',
        transferOrders: 'Confirmación de traslado',
        manageSuppliers: 'Gestión de proveedores',
        sales: 'Modulo de ventas',
        dispatch: 'Modulo de Dispatch'
    };

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL_ROLES);
            if (!response.ok) throw new Error('Error al obtener roles');
            const rolesData = await response.json();
            setRoles(rolesData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    const handleRoleChange = (e) => {
      const { name, value, type, checked } = e.target;
  

      setCurrentRole((prevRole) => ({
          ...prevRole,
          permissions: {
              ...prevRole.permissions,
              [name]: type === 'checkbox' ? checked : value  
          },
   
          name: name === 'name' ? value : prevRole.name
      }));
  };
  

  const handleSubmit = async () => {
  
    const permissionsArray = Object.entries(currentRole.permissions)
        .filter(([key, value]) => value && key !== 'name')  
        .map(([key]) => key);

    const roleToSend = {
        name: currentRole.name,
        permissions: permissionsArray  
    };

    console.log('Role to send:', roleToSend);  

    try {
        const response = await fetch(API_URL_ROLES, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(roleToSend)
        });
        if (!response.ok) throw new Error('Error al crear el rol');
        fetchRoles();  
        message.success('Rol creado con éxito');
        handleCloseModal();
    } catch (error) {
        message.error('Error al crear el rol');
        console.error(error);
    }
};

  

    const handleDeleteRole = async () => {
        try {
            const response = await fetch(`${API_URL_ROLES}${roleToDelete}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Error al eliminar el rol');

            fetchRoles(); // Actualizar la lista después de la eliminación
            message.success('Rol eliminado con éxito');
            setConfirmDeleteModalVisible(false); // Cerrar el modal de confirmación
        } catch (error) {
            message.error('Error al eliminar el rol');
            console.error(error);
        }
    };

    const showDeleteConfirm = (roleId) => {
        setRoleToDelete(roleId);
        setConfirmDeleteModalVisible(true);
    };

    const handleCancelDelete = () => {
        setConfirmDeleteModalVisible(false);
        setRoleToDelete(null);
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    return (
        <div style={{ marginLeft: '250px' }}>
            <AdminSideB />
            <Navbar title="Gestión de Roles" />
            <Button 
                type="primary" 
                onClick={handleOpenModal} 
                style={{ marginBottom: '16px' }}
            >
                Crear Rol
            </Button>

            {loading ? (
                <Row justify="center" style={{ marginTop: '32px' }}>
                    <Col>
                        <Button type="primary" loading={loading}>
                            Cargando roles...
                        </Button>
                    </Col>
                </Row>
            ) : (
                <Table 
                    dataSource={roles} 
                    rowKey="role_id"
                    columns={[
                        { title: 'Nombre', dataIndex: 'name', key: 'name' },
                        { 
                            title: 'Permisos', 
                            dataIndex: 'permissions', 
                            key: 'permissions',
                            render: (permissions) => (
                                <Row gutter={[8, 8]}>
                                    {JSON.parse(permissions).map((permission) => (
                                        <Col key={permission}>
                                            <Button type="link">{permissionLabels[permission] || permission}</Button>
                                        </Col>
                                    ))}
                                </Row>
                            )
                        },
                        { 
                            title: 'Acciones', 
                            key: 'actions',
                            render: (_, record) => (
                                <DeleteOutlined 
                                    style={{ color: 'red', fontSize: '18px', cursor: 'pointer' }} 
                                    onClick={() => showDeleteConfirm(record.role_id)} 
                                />
                            ) 
                        }
                    ]}
                />
            )}

            {/* Modal para crear o editar rol */}
            <Modal
                title="Crear Rol"
                visible={openModal}
                onCancel={handleCloseModal}
                onOk={handleSubmit}
                okText="Crear Rol"
                cancelText="Cancelar"
            >
                <div style={{ marginBottom: '16px' }}>
                    <Input
                        placeholder="Nombre del Rol"
                        value={currentRole.name}
                        onChange={handleRoleChange}
                        name="name"
                        style={{ marginBottom: '16px' }}
                    />
                    <div>
                        <Row gutter={[16, 8]}>
                            {Object.keys(permissionLabels).map((permission) => (
                                <Col span={12} key={permission}>
                                    <Checkbox
                                        checked={currentRole.permissions[permission]}
                                        onChange={handleRoleChange}
                                        name={permission}
                                    >
                                        {permissionLabels[permission]}
                                    </Checkbox>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </div>
            </Modal>

            {/* Modal para confirmar la eliminación */}
            <Modal
                title="Confirmar Eliminación"
                visible={confirmDeleteModalVisible}
                onOk={handleDeleteRole}
                onCancel={handleCancelDelete}
                okText="Eliminar"
                cancelText="Cancelar"
                danger
            >
                <p>¿Estás seguro de que deseas eliminar este rol?</p>
            </Modal>
            <UserRoleAssignment />
        </div>
    );
};

export default RoleManagement;
