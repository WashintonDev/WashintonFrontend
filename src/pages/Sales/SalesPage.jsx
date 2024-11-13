import React, { useEffect, useState } from 'react';
import { Table, Input, InputNumber, notification, Button, Image, Select, Divider, Modal } from 'antd';
import { API_URL_PRODUCTS } from '../../services/ApisConfig';
import { CloseOutlined, DollarOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar';

const SalesPage = () => {
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [receivedAmount, setReceivedAmount] = useState('');
    const [change, setChange] = useState(0);

    useEffect(() => {
        fetchProducts();
    }, [pagination.current]);

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_URL_PRODUCTS}?page=${pagination.current}&pageSize=${pagination.pageSize}`);
            if (!response.ok) throw new Error('Error fetching products');
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching products' });
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleQuantityChange = (productId, quantity) => {
        setQuantities(prev => ({ ...prev, [productId]: quantity }));
    };

    const handleSelectProduct = (product) => {
        const quantityValue = quantities[product.product_id] || 1;
        const existingProduct = selectedProducts.find(item => item.id === product.product_id);
        
        if (!existingProduct) {
            setSelectedProducts([...selectedProducts, { 
                id: product.product_id, 
                name: product.name, 
                sku: product.sku, 
                quantity: quantityValue, 
                price: product.price, 
                image: product.image 
            }]);
        } else {
            notification.error({ message: 'Este producto ya está en el carrito.' });
        }

        setQuantities(prev => ({ ...prev, [product.product_id]: 1 }));
    };

    const handleCartQuantityChange = (productId, quantity) => {
        setSelectedProducts(prevProducts =>
            prevProducts.map(product =>
                product.id === productId ? { ...product, quantity } : product
            )
        );
    };

    const handleRemoveProduct = (productId) => {
        setSelectedProducts(selectedProducts.filter(product => product.id !== productId));
    };

    const calculateTotal = () => {
        return selectedProducts.reduce((total, product) => {
            return total + product.price * product.quantity;
        }, 0).toFixed(2);
    };

    const handleReceivedAmountChange = (value) => {
        setReceivedAmount(value);
        const numericValue = parseFloat(value);
        const total = parseFloat(calculateTotal());
        setChange(!isNaN(numericValue) ? (numericValue - total).toFixed(2) : 0);
    };

    const showModal = () => {
        setIsModalVisible(true);
        setReceivedAmount('');
        setChange(0);
    };

    const handleFinishSale = () => {
        const total = parseFloat(calculateTotal());
        const received = parseFloat(receivedAmount);

        if (isNaN(received) || received < total) {
            const missingAmount = (total - received).toFixed(2);
            notification.warning({
                message: 'Monto insuficiente',
                description: `Te falta ${missingAmount} para completar la compra.`,
            });
        } else {
            setSelectedProducts([]); // Clear the cart
            setIsModalVisible(false); // Close the modal
            notification.success({ message: 'Venta finalizada y ticket generado.' });
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchText.toLowerCase()) || 
        product.sku.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: 'Seleccionar',
            key: 'select',
            render: (_, record) => (
                <Button onClick={() => handleSelectProduct(record)}>Agregar</Button>
            ),
            width: 80,
            align: 'center',
        },
        {
            title: 'Cantidad',
            key: 'quantity',
            render: (text, record) => (
                <Select
                    value={quantities[record.product_id] || 1}
                    onChange={(value) => handleQuantityChange(record.product_id, value)}
                    style={{ width: '100%' }}
                >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(qty => (
                        <Select.Option key={qty} value={qty}>{qty}</Select.Option>
                    ))}
                </Select>
            ),
            width: 60,
            align: 'center',
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            align: 'center',
        },
        {
            title: 'Nombre del Producto',
            dataIndex: 'name',
            key: 'name',
            width: 250,
            align: 'center',
        },
        {
            title: 'Precio',
            dataIndex: 'price',
            key: 'price',
            render: (price) => (
                <span>
                    <DollarOutlined style={{ color: 'green' }} /> {price}
                </span>
            ),
            width: 100,
            align: 'center',
        },
        {
            title: 'Imagen',
            key: 'image',
            render: (text, record) => (
                <Image
                    width={50}
                    src={record.image || 'https://via.placeholder.com/50'}
                    style={{ cursor: 'pointer' }}
                />
            ),
            width: 100,
            align: 'center',
        },
    ];

    return (
        <div>
            <Navbar title="Sales Page" showSearch={false} showAdd={false} />
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ flex: 1, maxWidth: '850px' }}>
                    <Input.Search
                        placeholder="Buscar por nombre o SKU"
                        onChange={(e) => handleSearch(e.target.value)}
                        style={{ marginBottom: 10 }}
                    />
                    <Table
                        dataSource={filteredProducts}
                        rowKey="product_id"
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: filteredProducts.length,
                            onChange: (page) => setPagination({ ...pagination, current: page }),
                        }}
                        columns={columns}
                        style={{ maxWidth: '100%', margin: '0 auto' }}
                    />
                </div>
                <div style={{ flex: 0.4, paddingLeft: '50px' }}>
                    <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', marginTop: '0px' }}>
                        Carrito de Compra
                    </h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {selectedProducts.map(product => (
                            <li key={product.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '1rem' }}>
                                <span style={{ width: '20%', textAlign: 'left' }}>{product.sku}</span>
                                <span style={{ width: '40%', textAlign: 'left' }}>{product.name}</span>
                                <InputNumber
                                    min={1}
                                    value={product.quantity}
                                    onChange={(value) => handleCartQuantityChange(product.id, value)}
                                    style={{ width: '10%', textAlign: 'center' }}
                                />
                                <span style={{ width: '15%', textAlign: 'right' }}>{(product.price * product.quantity).toFixed(2)}</span>
                                <CloseOutlined onClick={() => handleRemoveProduct(product.id)} style={{ marginLeft: 8, cursor: 'pointer', color: 'red' }} />
                            </li>
                        ))}
                    </ul>
                    <Divider />
                    <h3 style={{ textAlign: 'right' }}>Total a Pagar: <DollarOutlined /> {calculateTotal()}</h3>
                    <Button type="primary" style={{ marginTop: '10px', float: 'right' }} onClick={showModal}>
                        Generar Ticket
                    </Button>
                </div>
            </div>

            {/* Modal para mostrar el ticket y calcular el cambio */}
            <Modal
                title="Ticket de Compra"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={[
                    <Button key="finish" type="primary" onClick={handleFinishSale}>
                        Generar
                    </Button>,
                ]}
            >
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {selectedProducts.map(product => (
                        <li key={product.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                            <span style={{ width: '20%', textAlign: 'left' }}>{product.sku}</span>
                            <span style={{ width: '40%', textAlign: 'left' }}>{product.name}</span>
                            <span style={{ width: '10%', textAlign: 'center' }}>x {product.quantity}</span>
                            <span style={{ width: '15%', textAlign: 'right' }}>{(product.price * product.quantity).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                <Divider />
                <h3 style={{ textAlign: 'right' }}>Total a Pagar: <DollarOutlined /> {calculateTotal()}</h3>
                <Input
                    placeholder="Monto recibido"
                    type="text"
                    value={receivedAmount}
                    onChange={(e) => handleReceivedAmountChange(e.target.value)}
                    style={{ marginTop: '10px', width: '100%' }}
                />
                <h3 style={{ textAlign: 'right', marginTop: '10px' }}>Cambio: <DollarOutlined /> {change}</h3>
            </Modal>
        </div>
    );
};

export default SalesPage;