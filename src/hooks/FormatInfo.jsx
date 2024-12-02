import { useState, useEffect } from 'react';
import { API_URL_USERS } from '../services/apisConfig';

const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_URL_USERS}`);  // Asegúrate de que la URL sea la correcta
        const data = await response.json();
        setUsers(data);  // Guarda los datos de los usuarios en el estado
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
};

export default useUsers;
