import React, { useEffect, useState } from 'react';
import { Table, Input, InputNumber, notification, Button, Image, Select, Divider, Modal } from 'antd';
import { API_URL_PRODUCTS, API_URL_SALES } from '../../services/ApisConfig';
import { CloseOutlined, DollarOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar';

const SalesPage = () => {
    const [products, setProducts] = useState([]);
    const [stores, setStores] = useState([]); 
    const [selectedStore, setSelectedStore] = useState(1); 
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [receivedAmount, setReceivedAmount] = useState('');
    const [change, setChange] = useState(0);

    

    useEffect(() => {
        if (selectedStore) {
            fetchProductsByStore();
        }
    }, [selectedStore, pagination.current]);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const response = await fetch('https://washintonbackend.store/api/store');
                if (!response.ok) throw new Error('Error al cargar las tiendas');
                const data = await response.json();
    
                setStores(data);
    

                const savedStore = localStorage.getItem('selectedStore');
                const defaultStore = savedStore ? parseInt(savedStore, 10) : data[0]?.store_id;
                setSelectedStore(defaultStore); 
            } catch (error) {
                notification.error({ message: error.message || 'Error al cargar las tiendas' });
            }
        };
    
        fetchStores();
    }, []);
    
    

    
    const fetchProductsByStore = async () => {
        try {
            const response = await fetch(`https://washintonbackend.store/api/inventories/store/${selectedStore}?page=${pagination.current}&pageSize=${pagination.pageSize}`);
            if (!response.ok) throw new Error('Error al cargar productos por tienda');
            const inventory = await response.json();
    
            const productResponse = await fetch('https://washintonbackend.store/api/product');
            if (!productResponse.ok) throw new Error('Error al cargar los detalles de productos');
            const productData = await productResponse.json();
    
    
            const filteredProducts = inventory
                .map(item => {
                    const product = productData.find(p => p.product_id === item.product_id);
                    if (product && item.stock > 0) { 
                        const productImage = product.product_images?.[0]?.image_path
                            ? `https://washintonbackend.store/${product.product_images[0].image_path}`
                            : 'https://via.placeholder.com/50';
                        return {
                            ...product,
                            stock: item.stock,
                            image: productImage,
                        };
                    }
                    return null;
                })
                .filter(p => p !== null) 
                .sort((a, b) => a.product_id - b.product_id); 
    
            setProducts(filteredProducts);
        } catch (error) {
            notification.error({ message: error.message || 'Error al cargar productos' });
        }
    };
    
    
    
    const updateInventoryStock = async (productId, storeId, quantitySold) => {
        try {

            const response = await fetch(`https://washintonbackend.store/api/inventories/store/${storeId}?product_id=${productId}`);
            if (!response.ok) throw new Error('Error al obtener el inventario');
    
            const inventoryData = await response.json();
            const inventory = inventoryData.find(item => item.product_id === productId && item.store_id === storeId);
    
            if (!inventory) {
                throw new Error('Inventario no encontrado para el producto y tienda seleccionados.');
            }
    
            const newStock = inventory.stock - quantitySold;
    
            if (newStock < 0) {
                notification.warning({
                    message: 'Stock insuficiente',
                    description: `El producto "${inventory.product.name}" no tiene suficiente stock para completar la venta.`,
                });
                return;
            }
    
            const updatedInventory = {
                product_id: inventory.product_id,
                warehouse_id: inventory.warehouse_id,
                store_id: inventory.store_id,
                stock: newStock, 
            };
    
            const updateResponse = await fetch(`https://washintonbackend.store/api/inventory/${inventory.inventory_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedInventory),
            });
    
            if (!updateResponse.ok) throw new Error('Error al actualizar el inventario');
    
    
            setProducts(prevProducts => 
                prevProducts.map(product => 
                    product.product_id === productId
                        ? { ...product, stock: newStock }
                        : product
                ).filter(product => product.stock > 0) 
            );
        } catch (error) {
            console.error('Error in updateInventoryStock:', error);
            notification.error({
                message: 'Error al actualizar el inventario',
                description: error.message || 'Ocurrió un error al restar el stock.',
            });
        }
    };
    
    

    const handleSelectStore = (storeId) => {
        setSelectedStore(storeId);
        localStorage.setItem('selectedStore', storeId); 
        setSelectedProducts([]); 
    };
    
    const handleSearch = (value) => {
        setSearchText(value);
    };

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const handleFinishSale = async () => {
        const total = parseFloat(calculateTotal());
        const received = parseFloat(receivedAmount);
    
        if (isNaN(received) || received < total) {
            const missingAmount = (total - received).toFixed(2);
            notification.warning({
                message: 'Monto insuficiente',
                description: `Te falta ${missingAmount} para completar la compra.`,
            });
            return;
        }
    
        const saleData = {
            store_id: selectedStore || 1,
            sale_date: formatDate(new Date()),
            total_amount: total,
        };
    
        try {
            const response = await fetch(API_URL_SALES, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(saleData),
            });
    
            if (!response.ok) {
                throw new Error('Error al registrar la venta');
            }
    
            const result = await response.json();
            const saleId = result.sale_id;
    
            const saleDetailsPromises = selectedProducts.map(product => {
                const saleDetailData = {
                    sale_id: saleId,
                    product_id: product.id,
                    quantity: product.quantity,
                    price_per_unit: product.price,
                    total_price: (product.price * product.quantity).toFixed(2),
                };
    
                return fetch('https://washintonbackend.store/api/sale_detail', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(saleDetailData),
                });
            });
    
            const detailResponses = await Promise.all(saleDetailsPromises);
    
            for (const response of detailResponses) {
                if (!response.ok) {
                    throw new Error('Error al insertar detalles de venta');
                }
            }
    
            for (const product of selectedProducts) {
                await updateInventoryStock(product.id, selectedStore, product.quantity);
            }
    
            notification.success({
                message: 'Venta registrada exitosamente',
                description: 'Los detalles de la venta y el inventario han sido actualizados.',
            });
    
            setSelectedProducts([]); 
            setIsModalVisible(false);
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.message || 'Ocurrió un error al registrar la venta.',
            });
        }
    };
    
    

const handleSelectProduct = (product) => {
    const quantityValue = quantities[product.product_id] || 1;
    const existingProductIndex = selectedProducts.findIndex(item => item.id === product.product_id);

    if (existingProductIndex !== -1) {
        const updatedProducts = [...selectedProducts];
        const currentQuantity = updatedProducts[existingProductIndex].quantity;

        if (currentQuantity + quantityValue > product.stock) {
            notification.warning({
                message: 'Stock insuficiente',
                description: `No puedes agregar más de ${product.stock} unidades del producto "${product.name}".`,
            });
            return;
        }


        updatedProducts[existingProductIndex].quantity += quantityValue;
        setSelectedProducts(updatedProducts);
    } else {
        if (quantityValue > product.stock) {
            notification.warning({
                message: 'Stock insuficiente',
                description: `No puedes agregar más de ${product.stock} unidades del producto "${product.name}".`,
            });
            return;
        }

        setSelectedProducts([...selectedProducts, {
            id: product.product_id,
            name: product.name,
            sku: product.sku,
            quantity: quantityValue,
            price: product.price,
            image: product.image,
        }]);
    }

    setQuantities(prev => ({ ...prev, [product.product_id]: 1 }));
};




const handleQuantityChange = (productId, quantity) => {
    if (quantity < 1) return; 
    setQuantities(prev => ({ ...prev, [productId]: quantity })); 
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

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleCartQuantityChange = (productId, quantity) => {
        const product = products.find(p => p.product_id === productId);
        if (quantity > product.stock) {
            notification.warning({
                message: 'Stock insuficiente',
                description: `Solo hay ${product.stock} unidades disponibles para este producto.`,
            });
            return;
        }
    
        setSelectedProducts(prevProducts =>
            prevProducts.map(product =>
                product.id === productId ? { ...product, quantity } : product
            )
        );
    };
    
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
            render: (text, record) => {
                const maxStock = record.stock || 0;
                return (
                    <Select
                        value={quantities[record.product_id] || 1}
                        onChange={(value) => handleQuantityChange(record.product_id, value)}
                        style={{ width: '100%' }}
                    >
                        {Array.from({ length: maxStock }, (_, i) => i + 1).map((qty) => (
                            <Select.Option key={qty} value={qty}>
                                {qty}
                            </Select.Option>
                        ))}
                    </Select>
                );
            },
            width: 60,
            align: 'center',
        }
,        
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
                                    <Select
                        placeholder="Selecciona una tienda"
                        value={selectedStore} // Muestra la tienda seleccionada
                        onChange={handleSelectStore}
                        style={{ marginBottom: 10, width: '100%' }}
                    >
                        {stores.map(store => (
                            <Select.Option key={store.store_id} value={store.store_id}>
                                {store.name}
                            </Select.Option>
                        ))}
                    </Select>

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
                <div style={{ flex: 0.4, paddingLeft: '50px', display: 'flex', flexDirection: 'column' }}>
                    <h3>Carrito de Compra</h3>
                    {selectedProducts.map(product => (
                        <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #ddd' }}>
                            <span style={{ flex: 2 }}>{product.sku}</span>
                            <span style={{ flex: 4 }}>{product.name}</span>
                            <InputNumber
                                min={1}
                                value={product.quantity}
                                onChange={(value) => handleCartQuantityChange(product.id, value)}
                                style={{ width: '10%' }}
                            />
                            <span style={{ flex: 1, textAlign: 'right' }}>{(product.price * product.quantity).toFixed(2)}</span>
                            <CloseOutlined onClick={() => handleRemoveProduct(product.id)} style={{ marginLeft: 8, cursor: 'pointer', color: 'red' }} />
                        </div>
                    ))}
                    <Divider />
                    <h3>Total a Pagar: <DollarOutlined /> {calculateTotal()}</h3>
                    <Button 
                        type="primary" 
                        onClick={showModal} 
                        disabled={selectedProducts.length === 0}
                    >
                        Generar Ticket
                    </Button>
                </div>
            </div>

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
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {selectedProducts.map(product => (
                        <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #ddd' }}>
                            <span style={{ flex: 2 }}>{product.sku}</span>
                            <span style={{ flex: 4 }}>{product.name}</span>
                            <span>x {product.quantity}</span>
                            <span style={{ flex: 1, textAlign: 'right' }}>{(product.price * product.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <Divider />
                    <h3>Total a Pagar: <DollarOutlined /> {calculateTotal()}</h3>
                    <Input
                        placeholder="Monto recibido"
                        type="text"
                        value={receivedAmount}
                        onChange={(e) => handleReceivedAmountChange(e.target.value)}
                    />
                    <h3>Cambio: <DollarOutlined /> {change}</h3>
                </div>
            </Modal>
        </div>
    );
};

export default SalesPage;