import { useState } from "react";
import { API_URL_GET_WAREHOUSES_TRANSFERS } from "../services/ApisConfig";

const useTransfer = () => {
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para formatear la fecha manualmente
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Mes en formato 2 dígitos
    const day = String(d.getDate()).padStart(2, "0"); // Día en formato 2 dígitos
    return `${year}-${month}-${day}`;
  };

  const fetchTransfers = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL_GET_WAREHOUSES_TRANSFERS}${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Error fetching transfer details");
      }

      const data = await response.json();
      // Formatear la fecha manualmente
      setTransfer({
        id: data.transfer_id,
        store_id: data.store.name,
        transfer_date: formatDate(data.transfer_date),
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at,
      });
    } catch (err) {
      console.error("Error fetching transfer:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { transfer, loading, error, fetchTransfers };
};

export default useTransfer;
