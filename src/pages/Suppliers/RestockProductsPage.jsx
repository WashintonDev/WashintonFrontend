import React, { useEffect, useState } from 'react';
import { Table, Input, notification, Button, Image, Select, Modal } from 'antd';
import { API_URL_PRODUCTS, API_URL_CATEGORIES, API_URL_BATCH, API_URL_PRODUCT_BATCH } from '../../services/ApisConfig';
import { CloseOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar';

const RestockProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [originalProducts, setOriginalProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [newBatchName, setNewBatchName] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [pagination.current]);

    const fetchCategories = async () => {
        try {
            const response = await fetch(API_URL_CATEGORIES);
            if (!response.ok) throw new Error('Error fetching categories');
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching categories' });
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_URL_PRODUCTS}?page=${pagination.current}&pageSize=${pagination.pageSize}`);
            if (!response.ok) throw new Error('Error fetching products');
            const data = await response.json();
            const sortedData = data.sort((a, b) => a.product_id - b.product_id);
            setProducts(sortedData);
            setOriginalProducts(sortedData);
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
        const quantityValue = quantities[product.product_id] || 0;
        if (quantityValue <= 0 || quantityValue % 10 !== 0) {
            notification.error({ message: 'La cantidad debe ser un múltiplo de 10 y no puede ser 0.' });
            return;
        }

        const totalQuantity = selectedProducts.reduce((sum, item) => sum + item.quantity, 0) + quantityValue;
        if (totalQuantity > 200) {
            notification.error({ message: 'La suma total de cantidades no puede exceder 200.' });
            return;
        }

        const existingProduct = selectedProducts.find(item => item.id === product.product_id);
        if (!existingProduct) {
            setSelectedProducts([...selectedProducts, { id: product.product_id, name: product.name, quantity: quantityValue, image: product.image, category_id: product.category_id }]);
            setProducts(prev => prev.filter(item => item.product_id !== product.product_id));
        } else {
            notification.error({ message: 'Este producto ya ha sido seleccionado.' });
        }

        setQuantities(prev => ({ ...prev, [product.product_id]: 0 }));
    };

    const handleRemoveProduct = (productId) => {
        setSelectedProducts(selectedProducts.filter(product => product.id !== productId));
        setProducts(prev => [...prev, { product_id: productId, name: selectedProducts.find(product => product.id === productId).name }]);
    };

    const handleRestock = () => {
        if (selectedProducts.length === 0) {
            notification.error({ message: 'No hay productos seleccionados para restock.' });
            return;
        }
        setIsModalVisible(true); // Mostrar el modal para ingresar el nombre del nuevo lote
    };

    const formatDate = (date) => {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        return new Intl.DateTimeFormat('en-US', options).format(date).replace(/,/g, '').replace(/\//g, '-');
    };
    
    const handleCreateBatch = async () => {
        if (!newBatchName) {
            notification.error({ message: 'El nombre del lote es obligatorio.' });
            return;
        }
    
        const requestBody = {
            batch_name: newBatchName,
            code: generateRandomCode(),
            status: 'pending',
            requested_at: formatDate(new Date()),
        };
    
        console.log("Enviando a la API:", JSON.stringify(requestBody));
    
        try {
            const response = await fetch(API_URL_BATCH, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
    
            if (!response.ok) {
                throw new Error('Error al crear el lote');
            }
    
            const batchData = await response.json();
    
            // Insertar productos en product_batch
            for (const product of selectedProducts) {
                const productBatchRequestBody = {
                    batch_id: batchData.batch_id, // ID del batch creado
                    product_id: product.id, // ID del producto seleccionado
                    quantity: product.quantity,
                    expiration_date: null, // O asigna una fecha si es necesario
                    status: 'active',
                };
                
    
                console.log("Enviando a product_batch:", JSON.stringify(productBatchRequestBody));
    
                const productBatchResponse = await fetch(API_URL_PRODUCT_BATCH, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(productBatchRequestBody),
                });
    
                if (!productBatchResponse.ok) {
                    throw new Error('Error al agregar producto al lote');
                }
    
                await productBatchResponse.json(); // Puedes manejar la respuesta si es necesario
            }
    
            notification.success({ message: 'Lote creado y productos asignados exitosamente.' });
            setIsModalVisible(false);
            setNewBatchName(''); // Reinicia el nombre del lote
            setSelectedProducts([]); // Reinicia la lista de productos seleccionados
        } catch (error) {
            notification.error({ message: error.message || 'Error al crear el lote' });
        }
    };
    
    
    
    
    
    // Función para generar un código aleatorio
    const generateRandomCode = () => {
        return Math.random().toString(36).substring(2, 12).toUpperCase(); // Genera un código de 10 caracteres
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: 'Select',
            key: 'select',
            render: (_, record) => (
                <Button onClick={() => handleSelectProduct(record)}>Select</Button>
            ),
            width: 80,
            align: 'center',
        },
        {
            title: 'Quantity',
            key: 'quantity',
            render: (text, record) => (
                <Select
                    value={quantities[record.product_id] || 0}
                    onChange={(value) => handleQuantityChange(record.product_id, value)}
                    style={{ width: '100%' }}
                >
                    {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(qty => (
                        <Select.Option key={qty} value={qty}>{qty}</Select.Option>
                    ))}
                </Select>
            ),
            width: 60,
            align: 'center',
        },
        {
            title: 'Product Name',
            dataIndex: 'name',
            key: 'name',
            width: 250,
            align: 'center',
        },
        {
            title: 'Category',
            key: 'category',
            render: (text, record) => {
                const category = categories.find(cat => cat.category_id === record.category_id);
                return <span>{category ? category.name : 'Unknown Category'}</span>;
            },
            width: 100,
            align: 'center',
        },
        {
            title: 'Image',
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
            <Navbar title="Restock Products" showSearch={false} showAdd={false} />
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ flex: 1, maxWidth: '850px' }}>
                    <Input.Search
                        placeholder="Search by name"
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
                        Selected Products
                        <Button
                            type="primary"
                            onClick={handleRestock}
                            disabled={selectedProducts.length === 0}
                        >
                            Restock
                        </Button>
                    </h3>
                    <ul>
                        {selectedProducts.map(product => (
                            <li key={product.id} style={{ display: 'flex', alignItems: 'center' }}>
                                                                <CloseOutlined onClick={() => handleRemoveProduct(product.id)} style={{ marginRight: 8, cursor: 'pointer', color: 'red' }} />
                                <Image
                                    width={30}
                                    src={product.image}
                                    style={{ cursor: 'pointer', marginRight: 8 }}
                                />
                                {product.name}: {product.quantity}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Modal para ingresar el nombre del nuevo lote */}
            <Modal
    title="Crear Nuevo Lote"
    visible={isModalVisible}
    onOk={handleCreateBatch}
    onCancel={() => setIsModalVisible(false)}
>
    <Input 
        placeholder="Nombre del lote" 
        value={newBatchName} 
        onChange={(e) => setNewBatchName(e.target.value)} 
    />
</Modal>
        </div>
    );
};

export default RestockProductsPage;

