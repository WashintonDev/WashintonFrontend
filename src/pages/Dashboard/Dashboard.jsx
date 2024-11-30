import { useState, useEffect } from 'react';
import { Box, Card, CardContent, Grid, Typography, Paper } from '@mui/material';
import {
  People as PeopleIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import AdminSideB from '../../components/AdminSidebar';
import { BASE_API_URL } from '../../services/ApisConfig';

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
        <Box sx={{ backgroundColor: `${color}20`, borderRadius: '50%', padding: 2 }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRoles: 0,
    activeAdmins: 0,
    totalStores: 0
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obtener usuarios
        const usersResponse = await fetch(`${BASE_API_URL}user`);
        const usersData = await usersResponse.json();
        
        // Obtener tiendas
        const storesResponse = await fetch(`${BASE_API_URL}store`);
        const storesData = await storesResponse.json();

        // Calcular estadísticas
        const activeAdmins = usersData.filter(user => user.role === 'admin' && user.status === 'active').length;
        const recentUsersList = usersData
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);

        setStats({
          totalUsers: usersData.length,
          totalRoles: 6, // Número fijo de roles según tu sistema
          activeAdmins: activeAdmins,
          totalStores: storesData.length
        });

        setRecentUsers(recentUsersList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <AdminSideB />
      <Box component="main" sx={{ flexGrow: 1, p: 3, marginLeft: `${0}px` }}>
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
              {recentUsers.length > 0 ? (
                recentUsers.map((user, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography>
                      {user.first_name} {user.last_name} - {user.email}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Registrado: {new Date(user.created_at).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography color="textSecondary">
                  No hay usuarios nuevos para mostrar
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Actividad Administrativa
              </Typography>
              <Typography color="textSecondary">
                {loading ? 'Cargando actividades...' : 'No hay actividades administrativas recientes'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;