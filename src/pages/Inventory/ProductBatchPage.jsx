import React, { useEffect, useState } from 'react';
import { Table, Modal, Button, notification, Tag, Image } from 'antd';
import { BarcodeOutlined, QrcodeOutlined } from '@ant-design/icons';
import { QRCodeCanvas } from 'qrcode.react'; // Asegúrate de usar el nombre correcto
import { API_URL_PRODUCT_BATCH, API_URL_BATCH } from '../../services/ApisConfig';
import Navbar from '../../components/Navbar';

const ProductBatchPage = () => {
    const [batches, setBatches] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [productsModalVisible, setProductsModalVisible] = useState(false);
    const [codeModalVisible, setCodeModalVisible] = useState(false); // Nuevo estado para el modal de códigos
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [selectedBatchName, setSelectedBatchName] = useState('');
    const [selectedBatchStatus, setSelectedBatchStatus] = useState('');
    const [showBarcode, setShowBarcode] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    const [currentCode, setCurrentCode] = useState('');

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const response = await fetch(API_URL_BATCH);
            if (!response.ok) throw new Error('Error fetching batches');
            const data = await response.json();
            setBatches(data);
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching batches' });
        }
    };

    const fetchProductsInBatch = async (batchId) => {
        try {
            const response = await fetch(API_URL_PRODUCT_BATCH);
            if (!response.ok) throw new Error('Error fetching products in batch');
            const data = await response.json();
            return data.filter(product => product.batch_id === batchId);
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching products in batch' });
            return [];
        }
    };

    const handleViewProducts = async (batch) => {
        if (batch) {
            const products = await fetchProductsInBatch(batch.batch_id);
            setSelectedProducts(products);
            setSelectedBatchName(batch.batch_name);
            setSelectedBatchStatus(batch.status);
            setCurrentCode(batch.code);
            setProductsModalVisible(true);
            setShowBarcode(false); // Resetea el estado
            setShowQRCode(false);   // Resetea el estado
        } else {
            notification.error({ message: 'No se encontraron productos en el lote.' });
        }
    };

    const handleShowBarcode = () => {
        setShowBarcode(true);
        setShowQRCode(false);
        setCodeModalVisible(true); // Abre el modal de código
    };

    const handleShowQRCode = () => {
        setShowQRCode(true);
        setShowBarcode(false);
        setCodeModalVisible(true); // Abre el modal de código
    };

    const columns = [
        {
            title: 'Batch Name',
            dataIndex: 'batch_name',
            key: 'batch_name',
            width: 150,
        },
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            width: 100,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (text) => (
                <Tag color={text === 'active' ? 'green' : text === 'pending' ? 'orange' : 'red'}>
                    {text}
                </Tag>
            ),
        },
        {
            title: 'Requested Date',
            dataIndex: 'requested_at',
            key: 'requested_at',
            width: 150,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, batch) => (
                <>
                    <Button type="primary" onClick={() => handleViewProducts(batch)}>
                        View Products
                    </Button>
                    <Button 
                        icon={<BarcodeOutlined />} 
                        onClick={() => { handleShowBarcode(); setCurrentCode(batch.code); }} 
                        style={{ marginLeft: 8 }} 
                    />
                    <Button 
                        icon={<QrcodeOutlined />} 
                        onClick={() => { handleShowQRCode(); setCurrentCode(batch.code); }} 
                        style={{ marginLeft: 8 }} 
                    />
                </>
            ),
            width: 100,
        },
    ];

    const productColumns = [
        {
            title: 'SKU',
            dataIndex: ['product', 'sku'],
            key: 'product.sku',
            render: (text) => <Tag color="orange">{text}</Tag>,
        },
        {
            title: 'Product Name',
            dataIndex: ['product', 'name'],
            key: 'product.name',
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Expiration Date',
            dataIndex: 'expiration_date',
            key: 'expiration_date',
        },
        {
            title: 'Image',
            key: 'image',
            render: (text, record) => (
                <Image
                    width={50}
                    src={record.product.image || 'https://via.placeholder.com/50'}
                    alt={record.product.name}
                    style={{ cursor: 'pointer' }}
                />
            ),
        },
    ];

    return (
        <div>
            <Navbar title="Product Batches" showSearch={false} showAdd={false} />
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
                style={{ maxWidth: '80%', margin: '0 auto' }}
            />

            <Modal
                title={
                    <span>
                        <strong>Products in Batch: {selectedBatchName}</strong> <br />
                        <span>Status: {selectedBatchStatus}</span>
                    </span>
                }
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

            {/* Modal para el Código de Barras o QR */}
            <Modal
                title={`Código de ${showBarcode ? 'Barras' : 'QR'}: ${selectedBatchName}`}
                visible={codeModalVisible}
                onCancel={() => setCodeModalVisible(false)}
                footer={null}
                width={400}
            >
                {showBarcode && (
                    <div style={{ textAlign: 'center' }}>
                        <img
                            src={`https://barcode.tec-it.com/barcode.ashx?data=${currentCode}&code=Code128&translate-esc=false`}
                            alt="Código de Barras"
                        />
                    </div>
                )}
                {showQRCode && (
                    <div style={{ textAlign: 'center' }}>
                        <QRCodeCanvas value={currentCode} />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ProductBatchPage;
