import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Chip,
    Alert,
    Snackbar,
    FormControl,
    FormLabel,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Tooltip,
    CircularProgress
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Security as SecurityIcon
} from '@mui/icons-material';
import RoleHistoryDialog from './RolHistory';
import AdminSideB from '../../components/AdminSidebar';
import HistoryIcon from '@mui/icons-material/History';

const RoleManagement = () => {
    // Estados
    const [roles, setRoles] = useState([]);
    const [historyDialog, setHistoryDialog] = useState(false);
    const [roleHistory, setRoleHistory] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentRole, setCurrentRole] = useState({
        name: '',
        description: '',
        permissions: {
            canManageUsers: false,
            canManageRoles: false,
            canManageInventory: false,
            canManageSales: false,
            canViewReports: false,
            canManageSuppliers: false
        }
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Cargar roles iniciales
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setRoles([
                {
                    id: 1,
                    name: 'Administrador',
                    description: 'Control total del sistema',
                    permissions: {
                        canManageUsers: true,
                        canManageRoles: true,
                        canManageInventory: true,
                        canManageSales: true,
                        canViewReports: true,
                        canManageSuppliers: true
                    }
                },
                {
                    id: 2,
                    name: 'Vendedor',
                    description: 'Gestión de ventas e inventario',
                    permissions: {
                        canManageUsers: false,
                        canManageRoles: false,
                        canManageInventory: true,
                        canManageSales: true,
                        canViewReports: true,
                        canManageSuppliers: false
                    }
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    // Funciones para el historial
    const fetchRoleHistory = async () => {
        const mockHistory = [
            {
                id: 1,
                action: 'create',
                roleName: 'Administrador',
                user: 'Juan Pérez',
                timestamp: new Date('2024-01-20T10:30:00'),
                description: 'Creación del rol Administrador'
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
                    'Gestión de Inventario': { from: 'No', to: 'Sí' }
                }
            }
        ];
        setRoleHistory(mockHistory);
    };

    // Manejadores de eventos
    const handleOpenDialog = (role = null) => {
        if (role) {
            setCurrentRole(role);
            setIsEditing(true);
        } else {
            setCurrentRole({
                name: '',
                description: '',
                permissions: {
                    canManageUsers: false,
                    canManageRoles: false,
                    canManageInventory: false,
                    canManageSales: false,
                    canViewReports: false,
                    canManageSuppliers: false
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
                canManageUsers: false,
                canManageRoles: false,
                canManageInventory: false,
                canManageSales: false,
                canViewReports: false,
                canManageSuppliers: false
            }
        });
        setIsEditing(false);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Simular llamada a API
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (isEditing) {
                setRoles(roles.map(role =>
                    role.id === currentRole.id ? currentRole : role
                ));

                // Registrar en historial
                const newHistoryEntry = {
                    id: Date.now(),
                    action: 'update',
                    roleName: currentRole.name,
                    user: 'Usuario Actual',
                    timestamp: new Date(),
                    description: `Actualización del rol ${currentRole.name}`
                };
                setRoleHistory([newHistoryEntry, ...roleHistory]);

                showSnackbar('Rol actualizado exitosamente', 'success');
            } else {
                const newRole = { ...currentRole, id: roles.length + 1 };
                setRoles([...roles, newRole]);

                // Registrar en historial
                const newHistoryEntry = {
                    id: Date.now(),
                    action: 'create',
                    roleName: currentRole.name,
                    user: 'Usuario Actual',
                    timestamp: new Date(),
                    description: `Creación del rol ${currentRole.name}`
                };
                setRoleHistory([newHistoryEntry, ...roleHistory]);

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
                // Simular llamada a API
                await new Promise(resolve => setTimeout(resolve, 1000));

                const deletedRole = roles.find(role => role.id === id);
                setRoles(roles.filter(role => role.id !== id));

                // Registrar en historial
                const newHistoryEntry = {
                    id: Date.now(),
                    action: 'delete',
                    roleName: deletedRole.name,
                    user: 'Usuario Actual',
                    timestamp: new Date(),
                    description: `Eliminación del rol ${deletedRole.name}`
                };
                setRoleHistory([newHistoryEntry, ...roleHistory]);

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

    // Renderizado
    return (
        <Box sx={{ marginLeft: '250px' }}>
            <AdminSideB />
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    Gestión de Roles
                </Typography>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<HistoryIcon />}
                        onClick={() => {
                            fetchRoleHistory();
                            setHistoryDialog(true);
                        }}
                        sx={{ mr: 2 }}
                    >
                        Ver Historial
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Nuevo Rol
                    </Button>
                </Box>
            </Box>

            {/* Tabla de roles */}
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
                                                        label={key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
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

            {/* Diálogo de creación/edición */}
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
                                    label={key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                                />
                            ))}
                        </FormGroup>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        disabled={!currentRole.name || !currentRole.description}
                    >
                        {isEditing ? 'Guardar Cambios' : 'Crear Rol'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo de historial */}
            <RoleHistoryDialog
                open={historyDialog}
                onClose={() => setHistoryDialog(false)}
                history={roleHistory}
            />

            {/* Snackbar para notificaciones */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default RoleManagement;