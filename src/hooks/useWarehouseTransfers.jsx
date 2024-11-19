import { useState, useEffect } from "react";
import { API_URL_WAREHOUSES_TRANSFERS } from "../services/ApisConfig";

const useWarehouseTransfers = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const response = await fetch(API_URL_WAREHOUSES_TRANSFERS);
        if (!response.ok) {
          throw new Error("Error fetching transfers");
        }

        const data = await response.json();

        const mappedEvents = data.map((transfer) => ({
          id: transfer.transfer_id,
          title: `Transfer ${transfer.transfer_id} - ${transfer.status}`,
          start: transfer.transfer_date,
          allDay: true,
          className: `event-${transfer.status.toLowerCase()}`, // Clase para personalizar estilos según el estado
        }));

        setEvents(mappedEvents);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching transfers:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTransfers();
  }, []);

  return { events, loading, error };
};

export default useWarehouseTransfers;
