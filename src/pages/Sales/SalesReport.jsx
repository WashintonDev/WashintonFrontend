import React, { useEffect, useState } from 'react';
import { Table, notification, Modal, Button, Select, Row, Col } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '../../components/Navbar';

const API_URL_SALES = 'https://washintonbackend.store/api/sale';
const API_URL_STORES = 'https://washintonbackend.store/api/store';

const SalesReport = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedSaleDetails, setSelectedSaleDetails] = useState([]);
  const [totalSaleAmount, setTotalSaleAmount] = useState(0); 
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dashboardData, setDashboardData] = useState([]); 
  const [isDashboardVisible, setIsDashboardVisible] = useState(false);
  const [storeName, setStoreName] = useState('Todas las Tiendas'); // Estado para el nombre de la tienda


  useEffect(() => {
    const fetchSalesAndStores = async () => {
      try {
        const salesResponse = await fetch(API_URL_SALES);
        if (!salesResponse.ok) throw new Error('Error al obtener las ventas');
        const salesData = await salesResponse.json();

        const validatedSales = salesData.map((sale) => ({
          ...sale,
          total_amount: parseFloat(sale.total_amount) || 0,
        }));
        setSales(validatedSales);

        const storesResponse = await fetch(API_URL_STORES);
        if (!storesResponse.ok) throw new Error('Error al obtener las tiendas');
        const storesData = await storesResponse.json();
        setStores(storesData);

 
        const initialFilteredSales = validatedSales.filter(
          (sale) => sale.store?.store_id === 1
        );
        setFilteredSales(initialFilteredSales);


        const groupedData = initialFilteredSales.reduce((acc, sale) => {
          const date = sale.sale_date.split(' ')[0];
          if (!acc[date]) {
            acc[date] = { date, total: 0 };
          }
          acc[date].total += sale.total_amount;
          return acc;
        }, {});
        setDashboardData(Object.values(groupedData));

        setLoading(false);
      } catch (error) {
        notification.error({
          message: 'Error',
          description: error.message || 'Error al cargar los datos',
        });
        setLoading(false);
      }
    };

    fetchSalesAndStores();
  }, []);

  const handleStoreFilter = (storeId) => {
    setSelectedStore(storeId);
    if (storeId) {
      const filtered = sales.filter((sale) => sale.store?.store_id === storeId);
      setFilteredSales(filtered);
  
      // Obtén el nombre de la tienda seleccionada
      const selectedStore = stores.find((store) => store.store_id === storeId);
      setStoreName(selectedStore ? selectedStore.name : 'Sin Asignar');
  
      // Agrupa los datos por día
      const groupedData = filtered.reduce((acc, sale) => {
        const date = sale.sale_date.split(' ')[0];
        if (!acc[date]) {
          acc[date] = { date, total: 0 };
        }
        acc[date].total += sale.total_amount;
        return acc;
      }, {});
  
      setDashboardData(Object.values(groupedData));
    } else {
      setFilteredSales(sales);
      setDashboardData([]);
      setStoreName('Todas las Tiendas'); // Restablece a todas las tiendas
    }
  };

  const showDetails = (details) => {
    setSelectedSaleDetails(details);

    const totalAmount = details.reduce(
      (sum, detail) => sum + parseFloat(detail.total_price),
      0
    );
    setTotalSaleAmount(totalAmount);

    setIsModalVisible(true);
  };

  const showDashboard = () => {
    setIsDashboardVisible(true);
  };

  const closeDashboard = () => {
    setIsDashboardVisible(false);
  };

  const columns = [
    {
      title: 'Venta',
      dataIndex: 'sale_id',
      key: 'sale_id',
      align: 'center',
    },
    {
      title: 'Tienda',
      dataIndex: ['store', 'name'],
      key: 'store_name',
      render: (storeName) => (storeName ? storeName : 'Sin Asignar'),
      align: 'center',
    },
    {
      title: 'Monto Total',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => `$${amount.toFixed(2)}`,
      align: 'center',
    },
    {
      title: 'Fecha de Venta',
      dataIndex: 'sale_date',
      key: 'sale_date',
      align: 'center',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Button type="primary" onClick={() => showDetails(record.details)}>
          Detalles
        </Button>
      ),
      align: 'center',
    },
  ];

  const detailColumns = [
    {
      title: 'SKU',
      dataIndex: ['product', 'sku'],
      key: 'sku',
      align: 'center',
    },
    {
      title: 'Nombre',
      dataIndex: ['product', 'name'],
      key: 'name',
      align: 'center',
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
    },
    {
      title: 'Precio por Unidad',
      dataIndex: 'price_per_unit',
      key: 'price_per_unit',
      render: (price) => `$${parseFloat(price).toFixed(2)}`,
      align: 'center',
    },
    {
      title: 'Total',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (price) => `$${parseFloat(price).toFixed(2)}`,
      align: 'center',
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Navbar title="Sales Report" showSearch={false} showAdd={false} />
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Reporte de Ventas de {storeName}</h2>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <Select
          placeholder="Filtrar por tienda"
          style={{ width: 300 }}
          allowClear
          onChange={handleStoreFilter}
          value={selectedStore}
        >
          {stores.map((store) => (
            <Select.Option key={store.store_id} value={store.store_id}>
              {store.name}
            </Select.Option>
          ))}
        </Select>
        <Button type="primary" onClick={showDashboard} disabled={!dashboardData.length}>
          Dashboard
        </Button>
      </div>
      <Table
        dataSource={filteredSales}
        columns={columns}
        rowKey="sale_id"
        loading={loading}
        bordered
        pagination={{ pageSize: 10 }}
      />
      <Modal 
        title="Detalles de la Venta"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Cerrar
          </Button>,
        ]}
        width={600}
      >
        <Table 
          dataSource={selectedSaleDetails}
          columns={detailColumns}
          rowKey="sale_detail_id"
          pagination={false}
          bordered
        />
        <Row style={{ marginTop: '20px' }} justify="end">
          <Col>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '16px', color: '#000', marginBottom: '5px' }}>
                <strong>Total de la Venta:</strong>
              </div>
              <div style={{ fontSize: '24px', color: '#3f8600', fontWeight: 'bold' }}>
                <strong>${totalSaleAmount.toFixed(2)}</strong>
              </div>
            </div>
          </Col>
        </Row>
      </Modal>

      <Modal
        title={storeName}
        visible={isDashboardVisible}
        onCancel={closeDashboard}
        footer={[
          <Button key="close" onClick={closeDashboard}>
            Cerrar
          </Button>,
        ]}
        width={850}
      >
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dashboardData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" 
                       label={{
                        value: 'Fecha',
                        position: 'insideBottom',
                        offset: -5,
                        style: { fontSize: '16px', fontWeight: 'bold', fill: '#333' },
                      }} 
            />
            <YAxis 
                  label={{
                    value: 'Dinero',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: '16px', fontWeight: 'bold', fill: '#333' },
                  }} 
            />
            <Tooltip />
            <Bar dataKey="total" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Modal>
    </div>
  );
};

export default SalesReport;