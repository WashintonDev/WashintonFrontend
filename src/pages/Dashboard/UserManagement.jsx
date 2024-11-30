import React, { useState, useEffect } from 'react';
import { message, Button, Spin, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import {BASE_API_URL} from '../../services/ApisConfig';
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

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

      loadUsers();
    }
  }, [isAdmin]);

  if (loading) {
    return <Spin size="large" className="loading-spinner" />;
  }

  if (!isAdmin) {
    return null;
  }

  const handleGoToSignup = () => {
    navigate('/sign-up');
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Gestión de Usuarios</h2>
      <Button
        type="primary"
        onClick={handleGoToSignup}
        className="mb-4"
      >
        Crear Nuevo Usuario
      </Button>
      <div>
        <h3 className="text-xl font-bold mb-4">Usuarios Existentes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(user => (
            <Card key={user.id} title={user.displayName} className="mb-4">
              <p><strong>Nombre:</strong> {user.first_name}</p>
              <p><strong>Apellido:</strong> {user.last_name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Rol:</strong> {user.role}</p>
              <p><strong>Estado:</strong> {user.firebase_user_ID}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
