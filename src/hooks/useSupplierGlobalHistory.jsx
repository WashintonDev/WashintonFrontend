
import { API_URL_SUPPLIERS_GLOBAL_HISTORY } from "../services/ApisConfig";
import { useState, useEffect } from "react";
const useSupplierGlobalHistory = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        const response = await fetch(API_URL_SUPPLIERS_GLOBAL_HISTORY);
        if (!response.ok) {
          throw new Error("Error fetching transfers");
        }

        const data = await response.json();

        const mappedData = data.map((transfer, index) => ({
          brand: transfer.product.brand,
          key: index,
          supplier_id: transfer.supplier_id,
          product_id: transfer.product_id,
          product_name: transfer.product?.name || "Unknown",
          quantity: transfer.quantity,
          image: transfer.product?.image
            ? `https://washinton.store/${transfer.product.image}`
            : "https://via.placeholder.com/150",
          status: transfer.status,
        }));

        setFilteredData(mappedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching transfers:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTransfers();
  }, [error]);

  return { filteredData, loading, error };
};

export default useSupplierGlobalHistory;
