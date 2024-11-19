import React from 'react';
import { Box, Card, CardContent, Grid, Typography, Paper } from '@mui/material';
import {
  People as PeopleIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import AdminSideB from '../../components/AdminSidebar';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography color="textPrimary" variant="h4">
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}20`,
            borderRadius: '50%',
            padding: 2
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const stats = {
    totalUsers: 50,
    totalRoles: 4,
    activeAdmins: 3,
    totalStores: 5
  };

  return (
    <Box sx={{ display: 'flex' }}>

      <AdminSideB />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: `${0}px`, // Reserva espacio para el Drawer
        }}
      >
        <Typography variant="h4" gutterBottom>
          Panel de Administración
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Usuarios"
              value={stats.totalUsers}
              icon={<PeopleIcon sx={{ color: '#1976d2' }} />}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Roles del Sistema"
              value={stats.totalRoles}
              icon={<SecurityIcon sx={{ color: '#2e7d32' }} />}
              color="#2e7d32"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Administradores Activos"
              value={stats.activeAdmins}
              icon={<AdminIcon sx={{ color: '#ed6c02' }} />}
              color="#ed6c02"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tiendas Registradas"
              value={stats.totalStores}
              icon={<StoreIcon sx={{ color: '#9c27b0' }} />}
              color="#9c27b0"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Usuarios Recientes
              </Typography>
              <Typography color="textSecondary">
                No hay usuarios nuevos para mostrar
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Actividad Administrativa
              </Typography>
              <Typography color="textSecondary">
                No hay actividades administrativas recientes
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;
