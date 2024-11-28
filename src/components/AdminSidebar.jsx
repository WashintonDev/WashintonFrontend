import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SecurityIcon from '@mui/icons-material/Security'; // Nuevo import

const drawerWidth = 240;

const menuItems = [
    {
        text: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/admin'
    },
    {
        text: 'Gestión de Usuarios',
        icon: <PeopleIcon />,
        path: '/admin/users'
    },
    {
        text: 'Gestión de Roles',
        icon: <SecurityIcon />,
        path: '/admin/rolem'
    },
    {
        text: 'Perfil',
        icon: <AccountCircleIcon />,
        path: '/admin/profile'
    },
];

const AdminSideB= () => {
    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
            >
                <Box sx={{ overflow: 'auto', mt: 8 }}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem button key={item.text} component={Link} to={item.path}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default AdminSideB;
