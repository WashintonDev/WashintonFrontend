import { useState, useEffect } from 'react';
import {Box,Button,Dialog,DialogActions,DialogContent,DialogTitle,IconButton,Paper,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,TextField,Typography,Chip,Alert,Snackbar,FormControl,
FormLabel, FormGroup, FormControlLabel,Checkbox,Tooltip,CircularProgress} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import AdminSideB from '../../components/AdminSidebar';

const RoleManagement = () => {
    // Estados
    const [roles, setRoles] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentRole, setCurrentRole] = useState({
        name: '',
        description: '',
        permissions: {
            registerProducts: false,
            manageRoles: false,
            confirmTransfer: false,
            manageSuppliers: false,
            registerSales: false,
            viewReports: false
        }
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Actualizar los roles predefinidos
    const predefinedRoles = [
        {
            id: 1,
            name: 'Administrador',
            description: 'Control total del sistema',
            permissions: {
                registerProducts: true,
                manageRoles: true,
                confirmTransfer: true,
                manageSuppliers: true,
                registerSales: true,
                viewReports: true
            }
        },
        {
            id: 2,
            name: 'Coordinador de Logística y Almacén',
            description: 'Gestión de logística y almacén',
            permissions: {
                registerProducts: true,
                manageRoles: false,
                confirmTransfer: true,
                manageSuppliers: false,
                registerSales: false,
                viewReports: true
            }
        },
        {
            id: 3,
            name: 'Empleado Almacén',
            description: 'Operaciones de almacén',
            permissions: {
                registerProducts: false,
                manageRoles: false,
                confirmTransfer: true,
                manageSuppliers: false,
                registerSales: false,
                viewReports: false
            }
        },
        {
            id: 4,
            name: 'Administrador de Suministros',
            description: 'Gestión de suministros',
            permissions: {
                registerProducts: false,
                manageRoles: false,
                confirmTransfer: false,
                manageSuppliers: true,
                registerSales: false,
                viewReports: true
            }
        },
        {
            id: 5,
            name: 'Supervisor Ventas',
            description: 'Supervisión de ventas',
            permissions: {
                registerProducts: false,
                manageRoles: false,
                confirmTransfer: false,
                manageSuppliers: false,
                registerSales: true,
                viewReports: true
            }
        },
        {
            id: 6,
            name: 'Empleado Básico',
            description: 'Operaciones básicas',
            permissions: {
                registerProducts: false,
                manageRoles: false,
                confirmTransfer: false,
                manageSuppliers: false,
                registerSales: true,
                viewReports: true
            }
        }
    ];

    // Actualizar las etiquetas de los permisos
    const permissionLabels = {
        registerProducts: 'Registro de productos',
        manageRoles: 'Gestión de roles',
        confirmTransfer: 'Confirmación de traslado',
        manageSuppliers: 'Gestión de proveedores',
        registerSales: 'Registro de ventas',
        viewReports: 'Consulta de reportes'
    };

    // Cargar roles iniciales
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setRoles(predefinedRoles);
            setLoading(false);
        }, 1000);
    }, []);

    const handleOpenDialog = (role = null) => {
        if (role) {
            setCurrentRole(role);
            setIsEditing(true);
        } else {
            setCurrentRole({
                name: '',
                description: '',
                permissions: {
                    registerProducts: false,
                    manageRoles: false,
                    confirmTransfer: false,
                    manageSuppliers: false,
                    registerSales: false,
                    viewReports: false
                }
            });
            setIsEditing(false);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentRole({
            name: '',
            description: '',
            permissions: {
                registerProducts: false,
                manageRoles: false,
                confirmTransfer: false,
                manageSuppliers: false,
                registerSales: false,
                viewReports: false
            }
        });
        setIsEditing(false);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (isEditing) {
                setRoles(roles.map(role =>
                    role.id === currentRole.id ? currentRole : role
                ));
                showSnackbar('Rol actualizado exitosamente', 'success');
            } else {
                const newRole = { ...currentRole, id: roles.length + 1 };
                setRoles([...roles, newRole]);
                showSnackbar('Rol creado exitosamente', 'success');
            }
        } catch (error) {
            showSnackbar('Error al procesar la operación', 'error');
        } finally {
            setLoading(false);
            handleCloseDialog();
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este rol?')) {
            setLoading(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                setRoles(roles.filter(role => role.id !== id));
                showSnackbar('Rol eliminado exitosamente', 'success');
            } catch (error) {
                showSnackbar('Error al eliminar el rol', 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    const handlePermissionChange = (permission) => {
        setCurrentRole({
            ...currentRole,
            permissions: {
                ...currentRole.permissions,
                [permission]: !currentRole.permissions[permission]
            }
        });
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    return (
        <Box sx={{ marginLeft: '250px' }}>
            <AdminSideB />
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    Gestión de Roles
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Nuevo Rol
                </Button>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Descripción</TableCell>
                                <TableCell>Permisos</TableCell>
                                <TableCell>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {roles.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell>{role.name}</TableCell>
                                    <TableCell>{role.description}</TableCell>
                                    <TableCell>
                                        <Box display="flex" gap={1} flexWrap="wrap">
                                            {Object.entries(role.permissions).map(([key, value]) => (
                                                value && (
                                                    <Chip
                                                        key={key}
                                                        label={permissionLabels[key]}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                )
                                            ))}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title="Editar">
                                            <IconButton onClick={() => handleOpenDialog(role)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Eliminar">
                                            <IconButton
                                                onClick={() => handleDelete(role.id)}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {isEditing ? 'Editar Rol' : 'Crear Nuevo Rol'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nombre del Rol"
                        fullWidth
                        value={currentRole.name}
                        onChange={(e) => setCurrentRole({ ...currentRole, name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Descripción"
                        fullWidth
                        multiline
                        rows={3}
                        value={currentRole.description}
                        onChange={(e) => setCurrentRole({ ...currentRole, description: e.target.value })}
                    />
                    <FormControl component="fieldset" sx={{ mt: 2 }}>
                        <FormLabel component="legend">Permisos</FormLabel>
                        <FormGroup>
                            {Object.entries(currentRole.permissions).map(([key, value]) => (
                                <FormControlLabel
                                    key={key}
                                    control={
                                        <Checkbox
                                            checked={value}
                                            onChange={() => handlePermissionChange(key)}
                                        />
                                    }
                                    label={permissionLabels[key]}
                                />
                            ))}
                        </FormGroup>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                        {isEditing ? 'Guardar Cambios' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default RoleManagement;
