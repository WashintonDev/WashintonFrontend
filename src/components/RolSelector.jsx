import React, { useState, useEffect } from "react";
import axios from "axios";
import { Select, Button, Spin, Alert, Typography } from "antd";
import { API_URL_USERS, API_URL_ROLES } from "../services/ApisConfig";

const { Option } = Select;
const { Title } = Typography;

const UserRoleAssignment = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState(""); // Para guardar el rol actual del usuario

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersResponse = await axios.get(API_URL_USERS);
      const rolesResponse = await axios.get(API_URL_ROLES);
      
      if (usersResponse.headers["content-type"].includes("application/json")) {
        const filteredUsers = usersResponse.data.filter(
          (user) => user.role_id // Filtrar usuarios que ya tienen role_id asignado
        );
        setUsers(filteredUsers);
      } else {
        setErrorMessage("Error al obtener usuarios: formato inesperado.");
      }

      if (rolesResponse.headers["content-type"].includes("application/json")) {
        setRoles(rolesResponse.data);
      } else {
        setErrorMessage("Error al obtener roles: formato inesperado.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage("Hubo un error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  // Obtener el rol actual cuando un usuario es seleccionado
  const handleUserChange = async (userId) => {
    setSelectedUser(userId);
    const selectedUserData = users.find(user => user.user_id === userId);
    if (selectedUserData && selectedUserData.role_id) {
      setCurrentUserRole(selectedUserData.role_id); // Establecer el rol actual del usuario
    } else {
      setCurrentUserRole(""); // Si el usuario no tiene rol, limpiar el valor
    }
    setSelectedRole(""); // Limpiar la selección de rol al cambiar el usuario
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) {
      alert("Por favor, selecciona un usuario y un rol.");
      return;
    }

    try {
      const response = await axios.patch(`${API_URL_USERS}${selectedUser}/role`, {
        role_id: selectedRole, // Aquí enviamos el role_id
      });

      console.log(response.data);
      alert("Rol asignado correctamente");
      fetchData(); // Actualizar lista después de asignar rol
    } catch (error) {
      console.error("Error al asignar el rol:", error);
      alert("Hubo un error al asignar el rol. Por favor, inténtalo nuevamente.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ padding: "24px", maxWidth: "600px", margin: "0 auto" }}>
      <Title level={3}>Asignación de Roles a Usuarios</Title>

      {loading && (
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <Spin size="large" />
        </div>
      )}

      {errorMessage && (
        <Alert
          message="Error"
          description={errorMessage}
          type="error"
          showIcon
          style={{ marginBottom: "16px" }}
        />
      )}

      <div style={{ marginBottom: "16px" }}>
        <Title level={4}>Seleccionar Usuario</Title>
        <Select
          placeholder="Selecciona un usuario"
          value={selectedUser}
          onChange={handleUserChange}
          style={{ width: "100%" }}
        >
          {Array.isArray(users) &&
            users.map((user) => (
              <Option key={user.user_id} value={user.user_id}>
                {user.email}
              </Option>
            ))}
        </Select>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <Title level={4}>Seleccionar Rol</Title>
        <Select
          placeholder="Selecciona un rol"
          value={selectedRole || currentUserRole} // Mostrar el rol actual si ya existe
          onChange={(value) => setSelectedRole(value)}
          style={{ width: "100%" }}
        >
          {Array.isArray(roles) &&
            roles.map((role) => (
              <Option key={role.role_id} value={role.role_id}>
                {role.name}
              </Option>
            ))}
        </Select>
      </div>

      <Button
        type="primary"
        onClick={handleAssignRole}
        style={{ width: "100%" }}
        disabled={!selectedUser || !selectedRole}
      >
        Asignar Rol
      </Button>
    </div>
  );
};

export default UserRoleAssignment;