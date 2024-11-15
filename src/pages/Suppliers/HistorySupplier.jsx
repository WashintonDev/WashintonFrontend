import React, { useEffect, useState } from 'react';
import { Table, notification, Select } from 'antd';
import { API_URL_SUPPLIERS } from '../../services/ApisConfig';
import Navbar from '../../components/Navbar';

const { Option } = Select;

const HistorySupplier = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplierId, setSelectedSupplierId] = useState(null);
    const [deliveries, setDeliveries] = useState([]);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        if (selectedSupplierId) {
            fetchDeliveries(selectedSupplierId);
        }
    }, [selectedSupplierId]);

    const fetchSuppliers = async () => {
        try {
            const response = await fetch(API_URL_SUPPLIERS);
            if (!response.ok) throw new Error('Error fetching suppliers');
            const data = await response.json();
            setSuppliers(data);
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching suppliers' });
        }
    };

    const fetchDeliveries = async (supplierId) => {
        try {
            const response = await fetch(`${API_URL_SUPPLIERS}${supplierId}/deliveries`);
            if (!response.ok) throw new Error('Error fetching deliveries');
            const data = await response.json();
            setDeliveries(data);
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching deliveries' });
        }
    };

    const handleSupplierChange = (value) => {
        setSelectedSupplierId(value);
    };

    const columns = [
        {
            title: 'Batch Name',
            dataIndex: ['batch', 'batch_name'],
            key: 'batch_name',
        },
        {
            title: 'Product Name',
            dataIndex: ['product', 'name'],
            key: 'product_name',
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Received Date',
            dataIndex: 'received_at',
            key: 'received_at',
        },
    ];

    return (
        <div>
            <Navbar title="Supplier Delivery History" showSearch={false} showAdd={false} />
            <div style={{ maxWidth: '80%', margin: '0 auto', marginBottom: '20px' }}>
                <Select
                    placeholder="Select a supplier"
                    onChange={handleSupplierChange}
                    style={{ width: '100%' }}
                >
                    {suppliers.map(supplier => (
                        <Option key={supplier.supplier_id} value={supplier.supplier_id}>
                            {supplier.name}
                        </Option>
                    ))}
                </Select>
            </div>
            {selectedSupplierId && (
                <Table
                    dataSource={deliveries}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    style={{ maxWidth: '80%', margin: '0 auto' }}
                />
            )}
        </div>
    );
};

export default HistorySupplier;