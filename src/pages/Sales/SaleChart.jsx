import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, Button, Space, Typography } from 'antd';

const { Option } = Select;
const { Title } = Typography;

const SalesByStoreChart = () => {
    const [salesData, setSalesData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [filterType, setFilterType] = useState('all'); // "all", "month", "year"
    const [filterValue, setFilterValue] = useState('');

    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                const salesResponse = await fetch('https://washintonbackend.store/api/sale');
                if (!salesResponse.ok) throw new Error('Error al cargar las ventas');
                const sales = await salesResponse.json();

                const storeSales = sales.reduce((acc, sale) => {
                    const storeName = sale.store.name;
                    const saleDate = new Date(sale.sale_date);
                    if (!acc[storeName]) {
                        acc[storeName] = { name: storeName, totalAmount: 0, sales: [] };
                    }
                    acc[storeName].totalAmount += parseFloat(sale.total_amount);
                    acc[storeName].sales.push({ ...sale, date: saleDate });
                    return acc;
                }, {});

                const formattedData = Object.values(storeSales);
                setSalesData(formattedData);
                setFilteredData(formattedData);
            } catch (error) {
                console.error('Error fetching sales data:', error.message);
            }
        };

        fetchSalesData();
    }, []);

    const handleFilter = () => {
        if (filterType === 'all') {
            setFilteredData(salesData); // Sin filtro
            return;
        }

        const filtered = salesData.map(store => {
            const filteredSales = store.sales.filter(sale => {
                if (filterType === 'month') {
                    return sale.date.getMonth() + 1 === parseInt(filterValue);
                } else if (filterType === 'year') {
                    return sale.date.getFullYear() === parseInt(filterValue);
                }
                return true;
            });

            const totalAmount = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
            return { ...store, totalAmount };
        }).filter(store => store.totalAmount > 0);

        setFilteredData(filtered);
    };

    return (
        <div style={{ padding: '20px' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>
                Total de Ventas por Tienda
            </Title>

            <Space style={{ marginBottom: '20px', justifyContent: 'center', display: 'flex' }}>
                <Select
                    value={filterType}
                    onChange={value => {
                        setFilterType(value);
                        setFilterValue(''); // Resetear el valor del filtro
                    }}
                    style={{ width: 200 }}
                >
                    <Option value="all">Todas las ventas</Option>
                    <Option value="month">Filtrar por mes</Option>
                    <Option value="year">Filtrar por año</Option>
                </Select>

                {filterType !== 'all' && (
                    <Select
                        value={filterValue}
                        onChange={value => setFilterValue(value)}
                        style={{ width: 200 }}
                        placeholder={
                            filterType === 'month'
                                ? 'Selecciona un mes'
                                : 'Selecciona un año'
                        }
                    >
                        {filterType === 'month' &&
                            [...Array(12).keys()].map(m => (
                                <Option key={m + 1} value={m + 1}>
                                    {new Date(0, m).toLocaleString('es', { month: 'long' })}
                                </Option>
                            ))}
                        {filterType === 'year' &&
                            [2022, 2023, 2024].map(y => (
                                <Option key={y} value={y}>
                                    {y}
                                </Option>
                            ))}
                    </Select>
                )}

                <Button type="primary" onClick={handleFilter}>
                    Filtrar
                </Button>
            </Space>

            <ResponsiveContainer width="100%" height={500}>
                <BarChart
                    data={filteredData}
                    margin={{ top: 40, right: 30, left: 30, bottom: 80 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="name"
                        label={{
                            value: 'Tienda',
                            position: 'insideBottom',
                            offset: -20,
                            style: { fontSize: '16px', fontWeight: 'bold' },
                        }}
                        tick={{ fontSize: 14 }}
                    />
                    <YAxis
                        label={{
                            value: 'Total Vendido ($)',
                            angle: -90,
                            position: 'insideLeft',
                            offset: -10,
                            style: { fontSize: '16px', fontWeight: 'bold' },
                        }}
                        tick={{ fontSize: 14 }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#f5f5f5', borderRadius: 8 }}
                        labelStyle={{ fontWeight: 'bold' }}
                        formatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Legend
                        verticalAlign="top"
                        wrapperStyle={{
                            fontSize: '14px',
                            fontWeight: 'bold',
                            marginBottom: '10px',
                        }}
                    />
                    <Bar
                        dataKey="totalAmount"
                        fill="#8884d8"
                        name="Total Vendido"
                        barSize={200}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SalesByStoreChart;
