import { useState, useEffect } from 'react';
import { Button, Modal, Input, Checkbox, Row, Col, Table, message,Layout } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar';
import { API_URL_ROLES } from '../../services/ApisConfig';
import UserRoleAssignment from '../../components/RolSelector';
import SideBarAdmin from '../../components/SideBarAdmin';
import { Collapse } from 'antd';
const { Header, Content, Sider } = Layout;
const { Panel } = Collapse;

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
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
        registerProducts: 'Register Products',
        warehouse_employee: 'Warehouse',
        transferOrders: 'Transfer Orders',
        manageSuppliers: 'Manage Suppliers',
        sales: 'Sales Module',
        dispatch: 'Dispatch Module'
    };

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL_ROLES);
            if (!response.ok) throw new Error('Error fetching roles');
            const rolesData = await response.json();
            setRoles(rolesData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        setIsEditing(false);
        setCurrentRole({
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
        setOpenModal(true);
    };

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

        try {
            const response = isEditing
                ? await fetch(`${API_URL_ROLES}${currentRole.role_id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(roleToSend)
                  })
                : await fetch(API_URL_ROLES, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(roleToSend)
                  });

            if (!response.ok) throw new Error('Error saving role');
            fetchRoles();
            message.success(`Role ${isEditing ? 'updated' : 'created'} successfully`);
            handleCloseModal();
        } catch (error) {
            message.error('Error saving role');
            console.error(error);
        }
    };

    const handleEditRole = (role) => {
        setIsEditing(true);
        setCurrentRole({
            role_id: role.role_id,
            name: role.name,
            permissions: JSON.parse(role.permissions).reduce(
                (acc, perm) => ({ ...acc, [perm]: true }),
                {}
            )
        });
        setOpenModal(true);
    };

    const handleDeleteRole = async () => {
        try {
            const response = await fetch(`${API_URL_ROLES}${roleToDelete}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Error deleting role');

            fetchRoles();
            message.success('Role deleted successfully');
            setConfirmDeleteModalVisible(false);
        } catch (error) {
            message.error('Error deleting role');
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
        <div style={{ display: 'flex' }}>
            <SideBarAdmin />
            <div style={{ flex: 1, marginLeft: '30px', padding: '20px' }}>
            <Header style={{ background: '#fff', padding: 0 }}>
          <h2 className="text-2xl font-bold">Rol Managment</h2>
             </Header>
                <Button type="primary" onClick={handleOpenModal} style={{ marginBottom: '16px' }}>
                    Create Role
                </Button>

                {loading ? (
                    <Row justify="center" style={{ marginTop: '32px' }}>
                        <Col>
                            <Button type="primary" loading={loading}>
                                Loading roles...
                            </Button>
                        </Col>
                    </Row>
                ) : (
                    <Table
                        dataSource={roles}
                        rowKey="role_id"
                        columns={[
                            { title: 'Name', dataIndex: 'name', key: 'name' },
                            {
                                title: 'Permissions',
                                dataIndex: 'permissions',
                                key: 'permissions',
                                render: (permissions) => (
                                    <Row gutter={[8, 8]}>
                                        {JSON.parse(permissions).map((permission) => (
                                            <Col key={permission}>
                                                <Button type="link">
                                                    {permissionLabels[permission] || permission}
                                                </Button>
                                            </Col>
                                        ))}
                                    </Row>
                                )
                            },
                            {
                                title: 'Actions',
                                key: 'actions',
                                render: (_, record) => (
                                    <>
                                        <EditOutlined
                                            style={{
                                                color: 'blue',
                                                fontSize: '18px',
                                                cursor: 'pointer',
                                                marginRight: '8px'
                                            }}
                                            onClick={() => handleEditRole(record)}
                                        />
                                        <DeleteOutlined
                                            style={{ color: 'red', fontSize: '18px', cursor: 'pointer' }}
                                            onClick={() => showDeleteConfirm(record.role_id)}
                                        />
                                    </>
                                )
                            }
                        ]}
                    />
                )}

                <Modal
                    title={isEditing ? 'Edit Role' : 'Create Role'}
                    open={openModal}
                    onCancel={handleCloseModal}
                    onOk={handleSubmit}
                    okText={isEditing ? 'Update Role' : 'Create Role'}
                    cancelText="Cancel"
                >
                    <div style={{ marginBottom: '16px' }}>
                        <Input
                            placeholder="Role Name"
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

                <Modal
                    title="Confirm Deletion"
                    open={confirmDeleteModalVisible}
                    onOk={handleDeleteRole}
                    onCancel={handleCancelDelete}
                    okText="Delete"
                    cancelText="Cancel"
                    danger
                >
                    <p>Are you sure you want to delete this role?</p>
                </Modal>

                <Collapse>
                    <Panel header="Assign Role to User" key="1">
                        <UserRoleAssignment />
                    </Panel>
                </Collapse>
            </div>
        </div>
    );
};

export default RoleManagement;