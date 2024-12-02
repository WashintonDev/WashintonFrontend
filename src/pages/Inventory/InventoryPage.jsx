import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Table, notification, Button, Tooltip, Tag, Image, Select, Card, Row, Col, Pagination } from 'antd';
const { Option } = Select;
import { 
    API_URL_INVENTORIES, 
    API_URL_CATEGORIES, 
    API_URL_PRODUCTS, 
    API_URL_STORES, 
    API_URL_WAREHOUSES,
} from '../../services/ApisConfig';
import { DollarOutlined, HomeOutlined, DeleteOutlined, TagsOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import JsBarcode from 'jsbarcode';

const InventoryPage = () => {
    const [inventories, setInventories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [editingInventory, setEditingInventory] = useState(null);
    const [tagForm] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [fieldFilter, setFieldFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('ascend');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [totalStock, setTotalStock] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(60);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [products, setProducts] = useState([]);
    const [stores, setStores] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [addForm] = Form.useForm();
    const [originalStocks, setOriginalStocks] = useState({});
    const [locationFilter, setLocationFilter] = useState('all');
    const [selectedStore, setSelectedStore] = useState(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [isGenerateTagsModalVisible, setIsGenerateTagsModalVisible] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [selectedStoreForTags, setSelectedStoreForTags] = useState(null);


    useEffect(() => {
        fetchInventories();
        fetchCategories();
        fetchProducts();
        fetchStores();
        fetchWarehouses();
    }, []);

    const fetchInventories = async () => {
        try {
            const response = await fetch(API_URL_INVENTORIES);
            if (!response.ok) throw new Error('Error fetching inventories');
            const data = await response.json();
            const sortedInventories = data.sort((a, b) => a.inventory_id - b.inventory_id);
    
            // Calcula el stock total por producto y guarda los inventarios
            const totalStockMap = calculateTotalStockPerProduct(sortedInventories);
            setInventories(
                sortedInventories.map((inventory) => ({
                    ...inventory,
                    totalStock: totalStockMap[inventory.product.product_id],
                }))
            );
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching inventories' });
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(API_URL_CATEGORIES);
            if (!response.ok) throw new Error('Error fetching categories');
            const data = await response.json();
            setCategories(data); // Almacena las categorías
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching categories' });
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch(API_URL_PRODUCTS); // Ajusta la URL según tu API
            if (!response.ok) throw new Error('Error fetching products');
            const data = await response.json();
            setProducts(data);
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching products' });
        }
    };

    const fetchStores = async () => {
        try {
            const response = await fetch(API_URL_STORES);
            if (!response.ok) throw new Error('Error fetching stores');
            const data = await response.json();
            setStores(data);
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching stores' });
        }
    };
    
    const fetchWarehouses = async () => {
        try {
            const response = await fetch(API_URL_WAREHOUSES);
            if (!response.ok) throw new Error('Error fetching warehouses');
            const data = await response.json();
            setWarehouses(data);
        } catch (error) {
            notification.error({ message: error.message || 'Error fetching warehouses' });
        }
    };

    const handleAddInventory = () => {
        setIsAddModalVisible(true);
        fetchProducts();
        fetchStores();
        fetchWarehouses();
    };
    
    // const handleAddCancel = () => {
    //     setIsAddModalVisible(false);
    //     addForm.resetFields();
    // };

    // const handleAddOk = async () => {
    //     try {
    //         const values = await addForm.validateFields();
    //         const [locationType, locationId] = values.location_id.split('-');
    //         const payload = {
    //             product_id: values.product_id,
    //             stock: values.stock,
    //             warehouse_id: locationType === 'warehouse' ? locationId : null,
    //             store_id: locationType === 'store' ? locationId : null,
    //         };
    //         await fetch(API_URL_INVENTORIES, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(payload),
    //         });
    //         notification.success({ message: 'Inventory added successfully' });
    //         fetchInventories();
    //         setIsAddModalVisible(false);
    //         addForm.resetFields();
    //     } catch (error) {
    //         notification.error({ message: error.message || 'Error adding inventory' });
    //         console.error(error);
    //     }
    // };
    
    // const handleProductChange = (productId) => {
    //     setSelectedProductId(productId);
    // };

    // Calcula el stock total por producto
    const calculateTotalStockPerProduct = (inventories) => {
        const totalStockMap = {};
        inventories.forEach((inventory) => {
            const productId = inventory.product.product_id;
            if (!totalStockMap[productId]) {
                totalStockMap[productId] = 0;
            }
            totalStockMap[productId] += inventory.stock || 0;
        });
        return totalStockMap;
    };

    const calculateTotalStockInWarehouse = (inventories) => {
        const totalStockMap = {};
        inventories.forEach((inventory) => {
            const productId = inventory.product.product_id;
            if (inventory.warehouse_id) {
                if (!totalStockMap[productId]) {
                    totalStockMap[productId] = 0;
                }
                totalStockMap[productId] += inventory.stock || 0;
            }
        });
        return totalStockMap;
    };

    const calculateTotalStockInStores = (inventories) => {
        const totalStockMap = {};
        inventories.forEach((inventory) => {
            const productId = inventory.product.product_id;
            if (inventory.store_id) {
                if (!totalStockMap[productId]) {
                    totalStockMap[productId] = 0;
                }
                totalStockMap[productId] += inventory.stock || 0;
            }
        });
        return totalStockMap;
    };

    const calculateTotalStockInSelectedStore = (inventories, storeId) => {
        const totalStockMap = {};
        inventories.forEach((inventory) => {
            const productId = inventory.product.product_id;
            if (inventory.store_id === storeId) { // Solo contar el stock en la store seleccionada
                if (!totalStockMap[productId]) {
                    totalStockMap[productId] = 0;
                }
                totalStockMap[productId] += inventory.stock || 0;
            }
        });
        return totalStockMap;
    };

    const handleCardClick = (inventory) => {
        if (locationFilter === 'warehouse') return;
        if (selectedStore) return;

        // Filtrar las ubicaciones específicas para este producto
        const productLocations = inventories
            .filter((item) => item.product.product_id === inventory.product.product_id)
            .filter((item) => locationFilter === 'store' ? item.store_id : true)
            .map((item) => ({
                id: item.inventory_id,
                name: item.warehouse?.name || item.store?.name,
                stock: item.stock,
            }));
        
        // Guardar los valores originales del stock
        const originalStockValues = {};
        productLocations.forEach(location => {
            originalStockValues[location.id] = location.stock;
        });
        setOriginalStocks(originalStockValues);
    
        // Configurar el modal con las ubicaciones del producto seleccionado
        setSelectedProduct(inventory.product);
        setEditingInventory({ ...inventory, locations: productLocations });
        setTotalStock(calculateTotalStock({ ...inventory, locations: productLocations }));
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleStockChange = (locationId, newStock) => {
        const updatedLocations = editingInventory.locations.map((location) =>
            location.id === locationId ? { ...location, stock: parseInt(newStock) || 0 } : location
        );
        setEditingInventory({ ...editingInventory, locations: updatedLocations });
        setTotalStock(calculateTotalStock({ ...editingInventory, locations: updatedLocations }));
    };
    
    const calculateTotalStock = (product) => {
        return product?.locations.reduce((total, location) => total + (location.stock || 0), 0);
    };

    // const handlePageChange = (page, pageSize) => {
    //     setCurrentPage(page);
    //     setPageSize(pageSize);
    // };

    const filteredInventories = inventories
    .filter(inventory => {
        const productName = inventory.product?.name || '';
        const productSKU = inventory.product?.sku || '';
        const status = inventory.stock > 0 ? 'active' : 'inactive';

        if (statusFilter !== 'all') {
            if (locationFilter === 'store' && selectedStore) {
                // Filtrar por store seleccionada
                const storeInventory = inventories.filter(inv => inv.product.product_id === inventory.product.product_id && inv.store_id === selectedStore);
                const storeStatus = storeInventory.length > 0 && storeInventory.some(inv => inv.stock > 0) ? 'active' : 'inactive';
                if (storeStatus !== statusFilter) return false;
            } else if (locationFilter === 'store') {
                // Filtrar por todas las stores
                const storeInventory = inventories.filter(inv => inv.product.product_id === inventory.product.product_id && inv.store_id);
                const storeStatus = storeInventory.length > 0 && storeInventory.some(inv => inv.stock > 0) ? 'active' : 'inactive';
                if (storeStatus !== statusFilter) return false;
            } else if (locationFilter === 'warehouse') {
                // Filtrar por warehouse
                if (status !== statusFilter) return false;
            } else {
                // Filtrar por todos los inventarios
                const allInventory = inventories.filter(inv => inv.product.product_id === inventory.product.product_id);
                const allStatus = allInventory.length > 0 && allInventory.some(inv => inv.stock > 0) ? 'active' : 'inactive';
                if (allStatus !== statusFilter) return false;
            }
        }

        if (locationFilter === 'warehouse' && !inventory.warehouse_id) return false;
        if (locationFilter === 'store') {
            if (!inventory.store_id) return false;
            if (selectedStore && inventory.store_id !== selectedStore) return false;
        }

        return productName.toLowerCase().includes(searchText.toLowerCase()) || 
                productSKU.toLowerCase().includes(searchText.toLowerCase())
    })
    .sort((a, b) => {
        if (statusFilter !== 'all') {
            const statusA = a.stock > 0 ? 'active' : 'inactive';
            const statusB = b.stock > 0 ? 'active' : 'inactive';
            if (statusA === statusFilter && statusB !== statusFilter) return -1;
            if (statusA !== statusFilter && statusB === statusFilter) return 1;
        }
        if (fieldFilter && sortOrder) {
            const fieldA = a.product?.[fieldFilter] || '';
            const fieldB = b.product?.[fieldFilter] || '';
            if (sortOrder === 'ascend') return fieldA > fieldB ? 1 : -1;
            return fieldA < fieldB ? 1 : -1;
        }
        return 0;
    });

    const filterUniqueProducts = (inventories) => {
        const seen = new Set();
        return inventories.filter((inventory) => {
            const productId = inventory.product.product_id;
            if (seen.has(productId)) {
                return false;
            }
            seen.add(productId);
            return true;
        });
    };

    const productsNotInInventory = products.filter(product => {
        if (locationFilter === 'store' && selectedStore) {
            return !inventories.some(inventory => inventory.product.product_id === product.product_id && inventory.store_id === selectedStore);
        }
        return !inventories.some(inventory => inventory.product.product_id === product.product_id);
    });

    const filteredProductsNotInInventory = productsNotInInventory.filter(product => {
        const productNameMatches = product.name.toLowerCase().includes(searchText.toLowerCase());
        const isInactive = !inventories.some(inventory => inventory.product.product_id === product.product_id) || inventories.some(inventory => inventory.product.product_id === product.product_id && inventory.stock === 0);
        
        if (locationFilter === 'store' && selectedStore) {
            const productInStore = inventories.some(inventory => inventory.product.product_id === product.product_id && inventory.store_id === selectedStore);
            return !productInStore && productNameMatches;
        }
        if (locationFilter === 'store') {
            const totalStockInStores = inventories
                .filter(inventory => inventory.product.product_id === product.product_id && inventory.store_id)
                .reduce((total, inventory) => total + inventory.stock, 0);
            return totalStockInStores === 0 && productNameMatches;
        }
        if (statusFilter === 'active' && isInactive) {
            return false; // No incluir productos inactivos cuando se selecciona Active en el filtro
        }
        if (statusFilter === 'inactive' && !isInactive) {
            return false; // No incluir productos activos cuando se selecciona Inactive en el filtro
        }
        return productNameMatches;
    });

    const sortedInventories = filteredInventories.sort((a, b) => {
        if (fieldFilter && sortOrder) {
            const fieldA = a.product?.[fieldFilter] || '';
            const fieldB = b.product?.[fieldFilter] || '';
            if (sortOrder === 'ascend') return fieldA > fieldB ? 1 : -1;
            return fieldA < fieldB ? 1 : -1;
        }
        return 0;
    });

    const uniqueInventories = filterUniqueProducts(sortedInventories);
    const paginatedInventories = uniqueInventories.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // const paginatedInventories = filteredInventories.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const totalStockMap = locationFilter === 'store' && selectedStore
        ? calculateTotalStockInSelectedStore(inventories, selectedStore)
        : locationFilter === 'store'
        ? calculateTotalStockInStores(inventories)
        : locationFilter === 'warehouse'
        ? calculateTotalStockInWarehouse(inventories)
        : calculateTotalStockPerProduct(inventories);

    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat.category_id === categoryId);
        return category ? category.name : 'Unknown';
    };

    const handleLocationFilterChange = (value) => {
        setLocationFilter(value);
        setSelectedStore(null);
        if (value === 'warehouse') {
            // Buscar el almacén principal en los datos de inventario
            const mainWarehouse = inventories.find(inventory => inventory.warehouse && inventory.warehouse.status === 'active')?.warehouse;
            setSelectedWarehouse(mainWarehouse || null);
        } else {
            setSelectedWarehouse(null);
        }
    };

    // const getLocationFilterName = () => {
    //     if (locationFilter === 'all') return '';
    //     if (locationFilter === 'warehouse') return 'Warehouse / Almacén TJ Principal';
    //     if (locationFilter === 'store') return 'Stores';
    //     return '';
    // };
    
    // const getSelectedStoreName = () => {
    //     if (selectedStore) {
    //         const store = stores.find(store => store.store_id === selectedStore);
    //         return store ? store.name : '';
    //     }
    //     return '';
    // };
    
    // const navbarTitle = `Inventories ${getLocationFilterName() ? `/ ${getLocationFilterName()}` : ''} ${getSelectedStoreName() ? `/ ${getSelectedStoreName()}` : ''}`;    


    // GENERAR ETIQUETAS
    const handleGenerateTagsCancel = () => {
        setIsGenerateTagsModalVisible(false);
        resetGenerateTagsModal();
    };

    const handleLocationChange = (value) => {
        setSelectedLocation(value);
        resetGenerateTagsModal();
        if (value === 'warehouse') {
            setAvailableProducts(inventories.filter(inv => inv.warehouse_id && inv.stock > 0));
        }
    };

    const handleStoreChangeForTags = (storeId) => {
        setSelectedStoreForTags(storeId);
        setAvailableProducts(inventories.filter(inv => inv.store_id === storeId && inv.stock > 0));
    };

    const handleProductSelect = (productId) => {
        const product = availableProducts.find(p => p.product.product_id === productId);
        setSelectedProducts([...selectedProducts, product]);
        setAvailableProducts(availableProducts.filter(p => p.product.product_id !== productId));
    };

    const handleRemoveProduct = (productId) => {
        const product = selectedProducts.find(p => p.product.product_id === productId);
        setSelectedProducts(selectedProducts.filter(p => p.product.product_id !== productId));
        setAvailableProducts([...availableProducts, product]);
    };

    const resetGenerateTagsModal = () => {
        // setSelectedLocation(null);
        setSelectedProducts([]);
        setAvailableProducts([]);
        setSelectedStoreForTags(null);
        tagForm.resetFields();
    };

    const handleGenerateTags = () => {
        const doc = new jsPDF();
        let x = 5; // Posición X inicial ajustada hacia la izquierda
        let y = 10; // Posición Y inicial
        let count = 0; // Contador de etiquetas
    
        selectedProducts.forEach((product) => {
            const quantityInput = document.querySelector(
                `input[max='${product.stock}']`
            );
            const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
    
            for (let i = 0; i < quantity; i++) {
                if (count > 0 && count % 10 === 0) { // 10 etiquetas por página
                    doc.addPage();
                    x = 5;
                    y = 10;
                    count = 0;
                }
    
                // Dibujar contorno de la etiqueta
                doc.setDrawColor(0); // Negro
                doc.rect(x, y, 100, 50); // Ancho de la etiqueta
    
                // Nombre del producto (bold y más grande)
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text(product.product.name, x + 5, y + 8); // Ajuste a la esquina izquierda
    
                // Generar el código de barras
                const canvas = document.createElement('canvas');
                JsBarcode(canvas, product.product.sku, {
                    format: 'CODE128',
                    width: 1,  // Más estrecho
                    height: 30,  // Altura del código de barras
                    displayValue: false,
                });
    
                const barcodeImage = canvas.toDataURL('image/png');
                doc.addImage(barcodeImage, 'PNG', x + 5, y + 12, 60, 30); // Alineado más a la izquierda
    
                // SKU debajo del código de barras
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                const skuWidth = doc.getStringUnitWidth(product.product.sku) * 10 / doc.internal.scaleFactor;
                doc.text(product.product.sku, x + 35 - (skuWidth / 2), y + 39); // Bajado un poco
    
                // Precio alineado abajo a la derecha
                if (selectedLocation !== 'warehouse') {
                    doc.setFontSize(24); 
                    doc.setFont('helvetica', 'bold');
                    doc.text(`$ ${product.product.price}`, x + 98, y + 48, { align: 'right' });
                }
    
                // Actualizar posición para la siguiente etiqueta
                count++;
                if (count % 2 === 0) {
                    x = 5; // Posición ajustada a la izquierda
                    y += 55; // Espacio vertical ajustado
                } else {
                    x = 107; // Columna derecha ajustada más a la izquierda
                }
            }
        });
    
        if (selectedLocation === 'warehouse') {
            doc.save('warehouse-tags.pdf');
        } else {
            doc.save('store-tags.pdf');
        }
        setIsGenerateTagsModalVisible(false);
    };


    return (
        <div>
            <Navbar
                // title={navbarTitle}
                title="Inventories"
                buttonText="Add Inventory"
                onAddCategory={handleAddInventory}
                onSearch={handleSearch}
                showAdd={false}
            />

            {/* <Modal
                title="Add Inventory"
                visible={isAddModalVisible}
                onCancel={handleAddCancel}
                footer={[
                    <Button key="cancel" onClick={handleAddCancel}>Cancel</Button>,
                    <Button key="add" type="primary" onClick={handleAddOk}>Add</Button>
                ]}
            >
                <Form form={addForm} layout="vertical">
                    <Form.Item
                        name="product_id"
                        label="Product"
                        rules={[{ required: true, message: 'Please select a product!' }]}
                    >
                        <Select onChange={handleProductChange} style={{ width: '100%' }}>
                            {products
                                .sort((a, b) => a.name.localeCompare(b.name)) // Ordenar alfabéticamente
                                .map((product) => (
                                    <Option key={product.product_id} value={product.product_id}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Image
                                                src={product.product_images?.[0]?.image_path ? 
                                                    `https://washintonbackend.store/${product.product_images[0].image_path}` : 
                                                    'https://via.placeholder.com/50'}
                                                alt={product.name}
                                                width={30}
                                                height={30}
                                                style={{ marginRight: '10px', borderRadius: '5px', objectFit: 'cover' }}
                                            />
                                            {product.name}
                                        </div>
                                    </Option>
                                ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="location_id"
                        label="Location"
                        rules={[{ required: true, message: 'Please select a location!' }]}
                    >
                        <Select>
                            {warehouses
                                .filter((warehouse) => !inventories.some((inventory) => inventory.product.product_id === selectedProductId && inventory.warehouse_id === warehouse.warehouse_id))
                                .map((warehouse) => (
                                    <Option key={`warehouse-${warehouse.warehouse_id}`} value={`warehouse-${warehouse.warehouse_id}`}>
                                        {warehouse.name}
                                    </Option>
                                ))}
                            {stores
                                .filter((store) => !inventories.some((inventory) => inventory.product.product_id === selectedProductId && inventory.store_id === store.store_id))
                                .map((store) => (
                                    <Option key={`store-${store.store_id}`} value={`store-${store.store_id}`}>
                                        {store.name}
                                    </Option>
                                ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="stock"
                        label="Stock"
                        rules={[{ required: true, message: 'Please input the stock!' }]}
                    >
                        <Input type="number" />
                    </Form.Item>
                </Form>
            </Modal> */}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div>
                        <Select
                            defaultValue="all"
                            onChange={handleLocationFilterChange}
                            style={{ width: 120 }}
                        >
                            <Option value="all">All</Option>
                            <Option value="warehouse">Warehouse</Option>
                            <Option value="store">Stores</Option>
                        </Select>
                    </div>

                    {locationFilter === 'warehouse' && selectedWarehouse && (
                        <div>
                            <Input
                                value={selectedWarehouse.name}
                                readOnly
                                style={{ width: 150 }}
                            />
                        </div>
                    )}

                    {locationFilter === 'store' && (
                        <div>
                            <Select
                                defaultValue="all"
                                value={selectedStore || 'all'}
                                placeholder="store"
                                onChange={(value) => setSelectedStore(value === 'all' ? null : value)}
                                style={{ width: 185 }}
                            >
                                <Option value="all">All</Option>
                                {stores.sort((a, b) => a.name.localeCompare(b.name)).map((store) => (
                                    <Option key={store.store_id} value={store.store_id}>
                                        {store.name}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                    )}

                    <div>
                        <Select
                            placeholder="status"
                            onChange={(value) => setStatusFilter(value)}
                            style={{ width: 100 }}
                        >
                            <Option value="all">All</Option>
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                        </Select>
                    </div>

                    <div>
                        <Select
                            placeholder="sort by:"
                            onChange={(value) => setFieldFilter(value)}
                            style={{ width: 100 }}
                        >
                            <Option value="name">Name</Option>
                            {/* <Option value="stock">Stock</Option> */}
                            {/* <Option value="price">Price</Option> */}
                        </Select>
                    </div>

                    <div>
                        <Select
                            placeholder="order by:"
                            onChange={(value) => setSortOrder(value)}
                            style={{ width: 100 }}
                        >
                            <Option value="ascend">Asc</Option>
                            <Option value="descend">Desc</Option>
                        </Select>
                    </div>
                </div>
                
                <Button type="default" icon={<TagsOutlined />} onClick={() => setIsGenerateTagsModalVisible(true)}>Generate Tags</Button>
            </div>

            <Row gutter={[16, 16]}>
                {paginatedInventories.map((inventory) => {
                    // const firstImage = inventory.product?.product_images?.[0]?.image_path;
                    const firstImage = inventory.product?.first_image;
                    const imageUrl = firstImage
                        ? `https://washintonbackend.store/${firstImage}`
                        : 'https://via.placeholder.com/150';
                    
                    const filteredStock = totalStockMap[inventory.product.product_id] || 0;
                    const isNoStock = filteredStock === 0;
                    const inventoryStatus = isNoStock ? 'inactive' : 'active';

                    return (
                        <Col key={`${inventory.product?.product_id}-${inventory.inventory_id}`} span={6}>
                            <Card
                                hoverable={locationFilter !== 'warehouse'} 
                                onClick={locationFilter !== 'warehouse' ? () => handleCardClick(inventory) : null}
                                bodyStyle={{ padding: '12px' }}
                                style={{ border: '1px solid #d9d9d9', transition: 'border-color 0.2s', filter: isNoStock ? 'grayscale(100%)' : 'none' }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1890ff'}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d9d9d9'}
                            >
                                <Row gutter={16}>
                                    <Col span={6}>
                                        <Image
                                            src={imageUrl}
                                            alt={inventory.product?.name}
                                            preview={false}
                                            style={{ width: '100%', objectFit: 'contain' }}
                                            width={85}
                                            height={85}
                                        />
                                    </Col>
                                    <Col span={18}>
                                        <Card.Meta
                                            title={inventory.product?.name}
                                            description={
                                                <div style={{ lineHeight: '1.2' }}>
                                                    <p style={{ margin: '8px 0', fontSize: '15px' }}>
                                                        {isNoStock ? (
                                                            <span style={{ fontWeight: 'bold' }}>No stock</span>
                                                        ) : (
                                                            <>
                                                                <span style={{ color: 'black' }}>Total Stock:</span> <span style={{ color: '#356CA0', fontWeight: 'bold' }}>{filteredStock}</span>
                                                            </>
                                                        )}
                                                    </p>
                                                    <p></p>
                                                    <p style={{ margin: '4px 0' }}>
                                                        SKU: <Tag color="red">{inventory.product?.sku}</Tag>
                                                    </p>
                                                    <div style={{ margin: '4px 0' }}>
                                                        <p style={{ margin: '4px 0' }}>Specifications:</p>
                                                        <Tag color="blue">{inventory.product?.type}</Tag>
                                                        <Tag color="purple" style={{ marginLeft: '-5px' }}>
                                                            {getCategoryName(inventory.product?.category_id)}
                                                        </Tag>
                                                    </div>
                                                    {/* <p style={{ margin: '8px 0' }}>
                                                        Status:{' '}
                                                        <Tag
                                                            color={inventory.product?.status === 'active' ? 'green' : 'red'}
                                                        >
                                                            {inventory.product?.status}
                                                        </Tag>
                                                    </p> */}
                                                    <p></p>
                                                    <DollarOutlined style={{ color: 'green' }} />
                                                    <strong> {inventory.product?.price}</strong>
                                                    <p style={{ margin: '8px 0' }}>
                                                        Status: <Tag color={inventoryStatus === 'active' ? 'green' : 'red'}>{inventoryStatus}</Tag>
                                                    </p>
                                                </div>
                                            }
                                        />
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    );
                })}

                {filteredProductsNotInInventory.map((product) => {
                        const firstImage = product.product_images?.[0]?.image_path;
                        // const firstImage = product?.first_image;
                        const imageUrl = firstImage
                            ? `https://washintonbackend.store/${firstImage}`
                            : 'https://via.placeholder.com/150';

                        return (
                            <Col key={product.product_id} span={6}>
                                <Card
                                    hoverable
                                    bodyStyle={{ padding: '12px', filter: 'grayscale(100%)' }}
                                    style={{ border: '1px solid #d9d9d9', transition: 'border-color 0.2s' }}
                                >
                                    <Row gutter={16}>
                                        <Col span={6}>
                                            <Image
                                                src={imageUrl}
                                                alt={product.name}
                                                preview={false}
                                                style={{ width: '100%', objectFit: 'contain' }}
                                                width={85}
                                                height={85}
                                            />
                                        </Col>
                                        <Col span={18}>
                                            <Card.Meta
                                                title={product.name}
                                                description={
                                                    <div style={{ lineHeight: '1.2' }}>
                                                        <p style={{ margin: '8px 0', fontWeight: 'bold' }}>
                                                            No Stock
                                                        </p>
                                                        <p></p>
                                                        <p style={{ margin: '4px 0' }}>
                                                            SKU: <Tag color="red">{product.sku}</Tag>
                                                        </p>
                                                        <div style={{ margin: '4px 0' }}>
                                                            <p style={{ margin: '4px 0' }}>Specifications:</p>
                                                            <Tag color="blue">{product.type}</Tag>
                                                            <Tag color="purple" style={{ marginLeft: '-5px' }}>
                                                                {getCategoryName(product.category_id)}
                                                            </Tag>
                                                        </div>
                                                        <p></p>
                                                        <DollarOutlined style={{ color: 'green' }} />
                                                        <strong> {product.price}</strong>
                                                        <p style={{ margin: '8px 0' }}>
                                                            Status: <Tag color="red">inactive</Tag>
                                                        </p>
                                                    </div>
                                                }
                                            />
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                        );
                    })}
            </Row>

            {/* <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
                <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={uniqueInventories.length}
                    onChange={handlePageChange}
                    showSizeChanger
                    pageSizeOptions={['16', '32', '48', '64']}
                />
            </div> */}

            {selectedProduct && (
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '18px', color: '#356CA0' }}><strong>Locations - </strong>{selectedProduct.name}</span>
                            <Image
                                // src={selectedProduct.product_images?.[0]?.image_path ? 
                                //     `https://washintonbackend.store/${selectedProduct.product_images[0].image_path}` : 
                                //     'https://via.placeholder.com/150'}
                                src={selectedProduct.first_image ?
                                    `https://washintonbackend.store/${selectedProduct.first_image}` :
                                    'https://via.placeholder.com/150'}
                                alt={selectedProduct.name}
                                width={100}
                                height={100}
                                style={{ borderRadius: '5px', objectFit: 'contain' }}
                            />
                        </div>
                    }
                    visible={isModalVisible}
                    onCancel={handleCancel}
                    footer={[
                        <div key="footer" style={{ display: 'flex', justifyContent: 'center' }}>
                            <Button key="cancel" onClick={handleCancel}>Close</Button>
                            {/* <Button key="accept" type="primary" onClick={handleAccept}>Accept</Button> */}
                        </div>
                    ]}
                >
                    {editingInventory.locations.sort((a, b) => a.name.localeCompare(b.name))
                        .map((location) => (
                            <div key={location.id}>
                                <p style={{ fontSize: '15px' }}>
                                    <HomeOutlined style={{ color: '#5A9BD6' }} /> {location.name}
                                </p>
                                <Input
                                    type="number"
                                    value={location.stock}
                                    onChange={(e) => handleStockChange(location.id, e.target.value)}
                                    style={{ color: 'grey', fontWeight: 'bold' }}
                                    readOnly
                                />
                            </div>
                        ))
                    }
                    <p style={{ display: 'flex', justifyContent: 'center', fontSize: '17px' }}>
                        Total Stock: <strong style={{ marginLeft: '5px', color: '#356CA0' }}>{totalStock}</strong>
                    </p>
                </Modal>
            )}

            <Modal
                visible={imageModalVisible}
                footer={null}
                onCancel={() => setImageModalVisible(false)}
                width={800}
                title={selectedImage ? "Product Image" : "No Image"}
            >
                {selectedImage ? (
                    <Image
                        src={selectedImage}
                        alt="Product"
                        style={{ width: '100%', height: 'auto' }}
                    />
                ) : (
                    <Image
                        src="https://via.placeholder.com/800"
                        alt="Placeholder"
                        style={{ width: '100%', height: 'auto' }}
                    />
                )}
            </Modal>

            <Modal
                title="Generate Tags"
                visible={isGenerateTagsModalVisible}
                onCancel={handleGenerateTagsCancel}
                footer={[
                    <Button key="clear" onClick={resetGenerateTagsModal}>Clear</Button>,
                    <Button key="cancel" onClick={handleGenerateTagsCancel}>Cancel</Button>,
                    <Button key="generate" type="primary" onClick={handleGenerateTags}>Generate</Button>
                ]}
                width={900}
            >
                <Row gutter={16}>
                    <Col span={9}>
                        <Form form={tagForm} layout="vertical">
                            <Form.Item label="To:">
                                <Select
                                    placeholder="Select location"
                                    onChange={handleLocationChange}
                                    style={{ width: '100%' }}
                                >
                                    <Option value="warehouse">Warehouse</Option>
                                    <Option value="store">Store</Option>
                                </Select>
                            </Form.Item>
                            {selectedLocation === 'store' && (
                                <Form.Item label="Store:">
                                    <Select
                                        placeholder="Select store"
                                        onChange={handleStoreChangeForTags}
                                        style={{ width: '100%' }}
                                    >
                                        {stores
                                            .sort((a, b) => a.name.localeCompare(b.name))
                                            .map(store => (
                                                <Option key={store.store_id} value={store.store_id}>
                                                    {store.name}
                                                </Option>
                                            ))
                                        }
                                    </Select>
                                </Form.Item>
                            )}
                            <Form.Item label="Product:">
                                <Select
                                    placeholder="Select products"
                                    onChange={handleProductSelect}
                                    style={{ width: '100%' }}
                                >
                                    {availableProducts
                                        .sort((a, b) => a.product.name.localeCompare(b.product.name))
                                        .map(product => (
                                            <Option key={product.product.product_id} value={product.product.product_id}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <Image
                                                        // src={product.product.product_images?.[0]?.image_path ? 
                                                        //     `https://washintonbackend.store/${product.product.product_images[0].image_path}` : 
                                                        //     'https://via.placeholder.com/50'}
                                                        src={product.product.first_image ?
                                                            `https://washintonbackend.store/${product.product.first_image}` :
                                                            'https://via.placeholder.com/50'}
                                                        alt={product.product.name}
                                                        width={30}
                                                        height={30}
                                                        style={{ marginRight: '10px', borderRadius: '5px', objectFit: 'contain' }}
                                                    />
                                                    {product.product.name}
                                                </div>
                                            </Option>
                                        ))
                                    }
                                </Select>
                            </Form.Item>
                        </Form>
                    </Col>
                    <Col span={15}>
                        <p style={{ fontSize: '14px', marginTop: '-5px' }}>Selected Products</p>
                        <Table dataSource={selectedProducts} pagination={false} rowKey={record => record.product.product_id}>
                            <Table.Column title="Products" dataIndex="product" key="product" render={(text, record) => (
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Image
                                        // src={record.product.product_images?.[0]?.image_path ? 
                                        //     `https://washintonbackend.store/${record.product.product_images[0].image_path}` : 
                                        //     'https://via.placeholder.com/50'}
                                        src={record.product.first_image ?
                                            `https://washintonbackend.store/${record.product.first_image}` :
                                            'https://via.placeholder.com/50'}
                                        alt={record.product.name}
                                        width={60}
                                        height={60}
                                        style={{ marginRight: '10px', borderRadius: '5px', objectFit: 'contain' }}
                                    />
                                    {record.product.name}
                                </div>
                            )} />
                            <Table.Column title="Stock" dataIndex="stock" key="stock" />
                            <Table.Column title="Price" dataIndex="product" key="price" render={(text, record) => (
                                <span>${record.product.price}</span>
                            )} />
                            <Table.Column title="Tags Quantity" key="quantity" render={(text, record) => (
                                <Input type="number" max={record.stock} />
                            )} />
                            <Table.Column key="action" render={(text, record) => (
                                <Button
                                    type="link"
                                    icon={<DeleteOutlined style={{ color: 'red' }} />}
                                    onClick={() => handleRemoveProduct(record.product.product_id)}
                                />
                            )} />
                        </Table>
                    </Col>
                </Row>
            </Modal>

        </div>
    );
};

export default InventoryPage;
