import React, { useEffect, useState } from 'react';
import {
    Table, Modal, Button, notification, Tag, Image, Select, Checkbox, Space, Typography, Spin,
} from 'antd';
import { BarcodeOutlined, QrcodeOutlined } from '@ant-design/icons';
import { QRCodeCanvas } from 'qrcode.react';
import { 
    API_URL_PRODUCT_BATCH, 
    API_URL_BATCH, 
    API_URL_BATCH_UPDATE_STATUS, 
    API_URL_BATCH_BULK_UPDATE_STATUS 
} from '../../services/ApisConfig';
import Navbar from '../../components/Navbar';

const { Option } = Select;
const { Title, Text } = Typography;

const ProductBatchPage = () => {
    const [batches, setBatches] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [productsModalVisible, setProductsModalVisible] = useState(false);
    const [codeModalVisible, setCodeModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [selectedBatchName, setSelectedBatchName] = useState('');
    const [selectedBatchStatus, setSelectedBatchStatus] = useState('');
    const [showBarcode, setShowBarcode] = useState(false);
    const [currentCode, setCurrentCode] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [selectedBatchIds, setSelectedBatchIds] = useState([]);
    const [bulkStatus, setBulkStatus] = useState('');

    useEffect(() => {
        fetchBatches();
    }, []);

    const handleFetch = async (url, options = {}) => {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error('Error fetching data');
            return await response.json();
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching data' });
            throw error;
        }
    };

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const data = await handleFetch(API_URL_BATCH);
            setBatches(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProductsInBatch = async (batchId) => {
        try {
            const data = await handleFetch(API_URL_PRODUCT_BATCH);
            return data.filter(product => product.batch_id === batchId);
        } catch (error) {
            return [];
        }
    };

    const handleViewProducts = async (batch) => {
        if (!batch) {
            notification.error({ message: 'Batch data not found.' });
            return;
        }
        const products = await fetchProductsInBatch(batch.batch_id);
        setSelectedProducts(products);
        setSelectedBatchName(batch.batch_name);
        setSelectedBatchStatus(batch.status);
        setCurrentCode(batch.code);
        setProductsModalVisible(true);
    };

    const handleShowCode = (code, isBarcode) => {
        setCurrentCode(code);
        setShowBarcode(isBarcode);
        setCodeModalVisible(true);
    };

    const handleStatusChange = async (batchId, newStatus) => {
        setUpdatingStatus(true);
        try {
            const updatedBatch = await handleFetch(`${API_URL_BATCH_UPDATE_STATUS}${batchId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            setBatches(batches.map(batch => batch.batch_id === batchId ? updatedBatch : batch));
            notification.success({ message: 'Status updated successfully' });
        } catch (error) {
            console.error(error);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleBulkStatusChange = async () => {
        setUpdatingStatus(true);
        try {
            await handleFetch(`${API_URL_BATCH_BULK_UPDATE_STATUS}bulk_update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    batches: selectedBatchIds.map(batchId => ({
                        batch_id: batchId,
                        status: bulkStatus,
                    })),
                }),
            });
            fetchBatches();
            notification.success({ message: 'Bulk status updated successfully' });
            setSelectedBatchIds([]); // Reset selected batch IDs
        } catch (error) {
            console.error(error);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const columns = [
        {
            title: (
                <Checkbox
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedBatchIds(
                                batches
                                    .filter(batch => batch.status !== 'received' && batch.status !== 'cancelled')
                                    .map(batch => batch.batch_id)
                            );
                        } else {
                            setSelectedBatchIds([]);
                        }
                    }}
                />
            ),
            dataIndex: 'select',
            key: 'select',
            render: (_, record) => (
                <Checkbox
                    checked={selectedBatchIds.includes(record.batch_id)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedBatchIds([...selectedBatchIds, record.batch_id]);
                        } else {
                            setSelectedBatchIds(selectedBatchIds.filter(id => id !== record.batch_id));
                        }
                    }}
                    disabled={record.status === 'received' || record.status === 'cancelled'}
                />
            ),
            width: 50,
        },
        { title: 'Batch Name', dataIndex: 'batch_name', key: 'batch_name', width: 150 },
        { title: 'Code', dataIndex: 'code', key: 'code', width: 100 },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => (
                <Select
                    value={text}
                    onChange={(value) => handleStatusChange(record.batch_id, value)}
                    loading={updatingStatus}
                    disabled={['received', 'cancelled'].includes(text)}
                >
                    <Option value="pending">Pending</Option>
                    <Option value="in_process">In Process</Option>
                    <Option value="received">Received</Option>
                    <Option value="cancelled">Cancelled</Option>
                </Select>
            ),
            width: 150,
        },
        { title: 'Requested Date', dataIndex: 'requested_at', key: 'requested_at', width: 150 },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, batch) => (
                <Space>
                    <Button type="primary" onClick={() => handleViewProducts(batch)}>View Products</Button>
                    <Button icon={<BarcodeOutlined />} onClick={() => handleShowCode(batch.code, true)} />
                    <Button icon={<QrcodeOutlined />} onClick={() => handleShowCode(batch.code, false)} />
                </Space>
            ),
            width: 150,
        },
    ];

    const productColumns = [
        { title: 'SKU', dataIndex: ['product', 'sku'], key: 'product.sku', render: (text) => <Tag color="orange">{text}</Tag> },
        { title: 'Product Name', dataIndex: ['product', 'name'], key: 'product.name' },
        { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
        { title: 'Expiration Date', dataIndex: 'expiration_date', key: 'expiration_date' },
        { title: 'Image', key: 'image', render: (_, record) => <Image width={50} src={record.product.image || 'https://via.placeholder.com/50'} alt={record.product.name} /> },
    ];

    return (
        <div>
            <Navbar title="Product Batches" showSearch={false} showAdd={false} />
            <div style={{ padding: '20px', maxWidth: '80%', margin: '0 auto' }}>
                <Space style={{ marginBottom: 16 }}>
                    <Select
                        value={bulkStatus}
                        onChange={setBulkStatus}
                        placeholder="Select status to update"
                        style={{ width: 200 }}
                    >
                        <Option value="pending">Pending</Option>
                        <Option value="in_process">In Process</Option>
                        <Option value="received">Received</Option>
                        <Option value="cancelled">Cancelled</Option>
                    </Select>
                    <Button
                        type="primary"
                        onClick={handleBulkStatusChange}
                        disabled={!bulkStatus || selectedBatchIds.length === 0}
                        loading={updatingStatus}
                    >
                        Update Selected
                    </Button>
                </Space>
                <Spin spinning={loading}>
                    <Table
                        dataSource={batches}
                        columns={columns}
                        rowKey="batch_id"
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: batches.length,
                            onChange: (page) => setPagination({ ...pagination, current: page }),
                        }}
                        style={{ marginTop: 16 }}
                    />
                </Spin>
            </div>

            <Modal
                title={<Title level={4}>Products in Batch: {selectedBatchName}</Title>}
                visible={productsModalVisible}
                onCancel={() => setProductsModalVisible(false)}
                footer={null}
                width={800}
            >
                <Table
                    dataSource={selectedProducts}
                    rowKey="product_batch_id"
                    columns={productColumns}
                />
            </Modal>

            <Modal
                title={`Code: ${showBarcode ? 'Barcode' : 'QR'} - ${selectedBatchName}`}
                visible={codeModalVisible}
                onCancel={() => setCodeModalVisible(false)}
                footer={null}
                width={400}
            >
                <div style={{ textAlign: 'center' }}>
                    {showBarcode ? (
                        <img
                            src={`https://barcode.tec-it.com/barcode.ashx?data=${currentCode}&code=Code128&translate-esc=false`}
                            alt="Barcode"
                        />
                    ) : (
                        <QRCodeCanvas value={currentCode} />
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default ProductBatchPage;