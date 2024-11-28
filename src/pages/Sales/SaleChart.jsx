import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Text } from 'recharts';

const SalesByStoreChart = () => {
    const [salesData, setSalesData] = useState([]);

    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                const salesResponse = await fetch('https://washintonbackend.store/api/sale');
                if (!salesResponse.ok) throw new Error('Error al cargar las ventas');
                const sales = await salesResponse.json();

                const storeSales = sales.reduce((acc, sale) => {
                    const storeName = sale.store.name;
                    if (!acc[storeName]) {
                        acc[storeName] = { name: storeName, totalAmount: 0 };
                    }
                    acc[storeName].totalAmount += parseFloat(sale.total_amount);
                    return acc;
                }, {});

                const formattedData = Object.values(storeSales);
                setSalesData(formattedData);
            } catch (error) {
                console.error('Error fetching sales data:', error.message);
            }
        };

        fetchSalesData();
    }, []);

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
                Total de Ventas por Tienda
            </h2>
            <ResponsiveContainer width="100%" height={500}>
                <BarChart
                    data={salesData}
                    margin={{ top: 20, right: 30, left: 30, bottom: 80 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="name"
                        label={{
                            value: 'Tienda',
                            position: 'insideBottom',
                            offset: -50,
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
                        verticalAlign="bottom"
                        wrapperStyle={{
                            marginTop: 20,
                            fontSize: '14px',
                            fontWeight: 'bold',
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
