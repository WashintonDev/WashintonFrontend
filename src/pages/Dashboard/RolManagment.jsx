import { useState, useEffect } from 'react';
import { Typography, Button, Modal, Row, Col, Input, Checkbox } from 'antd'; // Solo lo necesario de Ant Design
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, Paper, Box } from '@mui/material';
import AdminSideB from '../../components/AdminSidebar';
import Navbar from '../../components/Navbar'; // Asegúrate de importar la navbar
import { API_URL_ROLES } from '../../services/ApisConfig';
import UserRoleAssignment from '../../components/rolselector';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false); // Estado para manejar la apertura del modal
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

    const permissionLabels = {
        registerProducts: 'Registro de productos',
        warehouse_employee: ' Almacén',
        transferOrders: 'Confirmación de traslado',
        manageSuppliers: 'Gestión de proveedores',
        sales: 'Modulo de ventas',
        dispatch: 'Modulo de Dispatch'
    };

    const fetchRoles = async (apiUrl) => {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    };

    const fetchRolesFromDB = async () => {
        setLoading(true);
        try {
            const rolesData = await fetchRoles(API_URL_ROLES); // Llama a la API para obtener los roles
            setRoles(rolesData); // Ya vienen los roles con los permisos como un objeto JSON
            console.log("Roles obtenidos:", rolesData);
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
                <form onSubmit={handleSubmit}>
                    <Input
                        placeholder="Nombre del Rol"
                        value={currentRole.name}
                        onChange={handleRoleChange}
                        name="name"
                        style={{ marginBottom: '16px' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {Object.keys(permissionLabels).map((permission) => (
                            <Checkbox
                                key={permission}
                                checked={currentRole.permissions[permission]}
                                onChange={handleRoleChange}
                                name={permission}
                                style={{ marginBottom: '8px' }}
                            >
                                {permissionLabels[permission]}
                            </Checkbox>
                        ))}
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default RoleManagement;