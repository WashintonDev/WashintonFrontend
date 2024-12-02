import React, { useState } from 'react';
import { Layout, Form, Button, Card, Table, notification, Spin, Select } from 'antd';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../../assets/styles/Predictions.css';
import { BASE_API_LEARNING } from '../../services/ApisConfig';

const { Content } = Layout;
const { Option } = Select;

const Predictions = () => {
    const [loading, setLoading] = useState(false);
    const [lowStockData, setLowStockData] = useState([]);
    const [futureSalesData, setFutureSalesData] = useState([]);
    const [topStoresData, setTopStoresData] = useState([]);
    const [productDemandData, setProductDemandData] = useState([]);
    const [inventoryRotationData, setInventoryRotationData] = useState([]);
    const [recommendedSuppliersData, setRecommendedSuppliersData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedStore, setSelectedStore] = useState(null);

    const handleApiCall = async (endpoints, setDataFunctions, data = {}) => {
        setLoading(true);
        try {
            for (let i = 0; i < endpoints.length; i++) {
                const response = await axios.post(`${BASE_API_LEARNING}${endpoints[i]}`, data, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                setDataFunctions[i](response.data);
            }
            notification.success({ message: 'Data fetched successfully' });
        } catch (error) {
            console.error('Error fetching data:', error);
            notification.error({ message: 'Error fetching data', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const columns = {
        lowStock: [
            { title: 'Product ID', dataIndex: 'product_id', key: 'product_id' },
            { title: 'Remaining Stock', dataIndex: 'remaining_stock', key: 'remaining_stock' },
            { title: 'Low Stock Prediction', dataIndex: 'low_stock_prediction', key: 'low_stock_prediction' },
        ],
        futureSales: [
            { title: 'Store ID', dataIndex: 'store_id', key: 'store_id' },
            { title: 'Sale Date', dataIndex: 'sale_date', key: 'sale_date' },
            { title: 'Predicted Sales Count', dataIndex: 'predicted_sales_count', key: 'predicted_sales_count' },
        ],
        topStores: [
            { title: 'Store ID', dataIndex: 'store_id', key: 'store_id' },
            { title: 'Total Sales', dataIndex: 'total_sales', key: 'total_sales' },
        ],
        productDemand: [
            { title: 'Product Name', dataIndex: 'product_name', key: 'product_name' },
            { title: 'Historical Average', dataIndex: 'historical_average', key: 'historical_average' },
            { title: 'Predicted Demand', dataIndex: 'predicted_demand', key: 'predicted_demand' },
        ],
        inventoryRotation: [
            { title: 'Product ID', dataIndex: 'product_id', key: 'product_id' },
            { title: 'Rotation Time', dataIndex: 'rotation_time', key: 'rotation_time' },
        ],
        recommendedSuppliers: [
            { title: 'Product Name', dataIndex: 'product_name', key: 'product_name' },
            { title: 'Current Inventory', dataIndex: 'current_inventory', key: 'current_inventory' },
            { title: 'Recommended Suppliers', dataIndex: 'recommended_suppliers', key: 'recommended_suppliers' },
        ],
    };

    const onDateChange = date => {
        setSelectedDate(date);
    };

    const onStoreChange = value => {
        setSelectedStore(value);
    };

    const getTileContent = ({ date, view }) => {
        if (view === 'month' && selectedStore && futureSalesData) {
            const selectedDateString = date.toISOString().split('T')[0];

            console.log('Selected Date String:', selectedDateString);
            console.log('Selected Store:', selectedStore);
            console.log('Future Sales Data:', futureSalesData);

            const salesOnDate = futureSalesData.future_sales.filter(
                sale =>
                    new Date(sale.sale_date).toISOString().split('T')[0] === selectedDateString &&
                    sale.store_id === selectedStore
            );

            console.log('Sales on Date:', salesOnDate);

            if (salesOnDate.length > 0) {
                return <p>{salesOnDate[0].predicted_sales_count} sales</p>;
            }
        }
        return null;
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Content style={{ padding: '24px' }}>
                <Card title="Predictions Dashboard" style={{ marginBottom: '24px' }}>
                    <Form
                        layout="inline"
                        onFinish={() => handleApiCall(
                            ['train_model', 'predict_low_stock'],
                            [setLowStockData, setLowStockData],
                            { warehouse_id: 1 }
                        )}
                    >
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Train Model
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>

                <Card title="Low Stock Predictions" style={{ marginBottom: '24px' }}>
                    {loading ? <Spin /> : <Table dataSource={lowStockData.low_stock_products} columns={columns.lowStock} rowKey="product_id" />}
                </Card>

                <Card title="Top Stores Predictions" style={{ marginBottom: '24px' }}>
                    <Button type="primary" onClick={() => handleApiCall(['predict_top_stores'], [data => {
                        const formattedData = data.top_stores.map((item, index) => ({
                            key: index,
                            store_id: item[0],
                            total_sales: item[1],
                        }));
                        setTopStoresData(formattedData);
                    }])} loading={loading}>
                        Predict Top Stores
                    </Button>
                    {loading ? <Spin /> : <Table dataSource={topStoresData} columns={columns.topStores} rowKey="store_id" />}
                </Card>

                <Card title="Product Demand Predictions" style={{ marginBottom: '24px' }}>
                    <Button type="primary" onClick={() => handleApiCall(['predict_product_demand'], [setProductDemandData])} loading={loading}>
                        Predict Product Demand
                    </Button>
                    {loading ? <Spin /> : <Table dataSource={productDemandData.predicted_demand} columns={columns.productDemand} rowKey="product_name" />}
                </Card>

                <Card title="Inventory Rotation Predictions" style={{ marginBottom: '24px' }}>
                    <Button type="primary" onClick={() => handleApiCall(['predict_inventory_rotation'], [setInventoryRotationData])} loading={loading}>
                        Predict Inventory Rotation
                    </Button>
                    {loading ? <Spin /> : <Table dataSource={inventoryRotationData.inventory_rotation} columns={columns.inventoryRotation} rowKey="product_id" />}
                </Card>

                <Card title="Recommended Suppliers" style={{ marginBottom: '24px' }}>
                    <Button type="primary" onClick={() => handleApiCall(['recommended_suppliers'], [setRecommendedSuppliersData])} loading={loading}>
                        Get Recommended Suppliers
                    </Button>
                    {loading ? <Spin /> : <Table dataSource={recommendedSuppliersData.recommended_suppliers} columns={columns.recommendedSuppliers} rowKey="product_name" />}
                </Card>

                <Card title="Future Sales Predictions" style={{ marginBottom: '24px' }}>
                    <Button type="primary" onClick={() => handleApiCall(['predict_future_sales'], [setFutureSalesData])} loading={loading}>
                        Predict Future Sales
                    </Button>
                    {loading ? (
                        <Spin />
                    ) : (
                        <div>
                            <Select
                                placeholder="Select a store"
                                onChange={onStoreChange}
                                style={{ width: 200 }}
                            >
                                {/* Replace with actual store options */}
                                <Option value={1}>Store 1</Option>
                                <Option value={2}>Store 2</Option>
                                <Option value={5}>Store 5</Option>
                            </Select>
                            <div className="calendar-container">
                                <Calendar
                                    onChange={onDateChange}
                                    value={selectedDate}
                                    tileContent={getTileContent}
                                />
                            </div>
                        </div>
                    )}
                </Card>
            </Content>
        </Layout>
    );
};

export default Predictions;