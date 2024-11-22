import React, { useEffect, useState } from 'react';
import {
  Table,
  Input,
  notification,
  Button,
  Image,
  Select,
  Modal,
  Typography,
  Card,
  Tooltip,
  Collapse,
} from 'antd';
import {
  CloseOutlined,
  SearchOutlined,
  PlusCircleOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import {
  API_URL_PRODUCTS,
  API_URL_CATEGORIES,
  API_URL_BATCH,
  API_URL_PRODUCT_BATCH,
  API_URL_CREATE_BATCH
} from '../../services/ApisConfig';
import Navbar from '../../components/Navbar';
import CardSkeleton from '../../components/CardSkeleton/CardSkeleton';
import NavBarHome from '../../components/NavBar Home';

const { Title, Text } = Typography;
const { Panel } = Collapse;

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
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [pagination.current]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await fetch(API_URL_CATEGORIES);
      if (!response.ok) throw new Error('Error fetching categories');
      const data = await response.json();
      setCategories(data);
      setCategoriesLoading(false);
    } catch (error) {
      setCategoriesLoading(false);
      notification.error({ message: error.message || 'Error fetching categories' });
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL_PRODUCTS}?page=${pagination.current}&pageSize=${pagination.pageSize}`
      );
      if (!response.ok) throw new Error('Error fetching products');
      const data = await response.json();
      const sortedData = data.sort((a, b) => a.product_id - b.product_id);
      setProducts(sortedData);
      setOriginalProducts(sortedData);
      setLoading(false);
    } catch (error) {
      notification.error({ message: error.message || 'Error fetching products' });
      setLoading(false);
    }
  };

  const handleSelectProduct = (product) => {
    const quantityValue = quantities[product.product_id] || 0;
    if (quantityValue <= 0 || quantityValue % 10 !== 0) {
      notification.error({
        message: 'La cantidad debe ser un múltiplo de 10 y no puede ser 0.',
      });
      return;
    }

    const totalQuantity =
      selectedProducts.reduce((sum, item) => sum + item.quantity, 0) +
      quantityValue;
    if (totalQuantity > 200) {
      notification.error({
        message: 'La suma total de cantidades no puede exceder 200.',
      });
      return;
    }

    const existingProduct = selectedProducts.find(
      (item) => item.id === product.product_id
    );
    if (!existingProduct) {
      setSelectedProducts([
        ...selectedProducts,
        {
          id: product.product_id,
          name: product.name,
          quantity: quantityValue,
          image: product.image,
          category_id: product.category_id,
        },
      ]);
      setProducts((prev) =>
        prev.filter((item) => item.product_id !== product.product_id)
      );
    } else {
      notification.error({ message: 'Este producto ya ha sido seleccionado.' });
    }

    setQuantities((prev) => ({ ...prev, [product.product_id]: 0 }));
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter((product) => product.id !== productId));
    setProducts((prev) => [
      ...prev,
      {
        product_id: productId,
        name: selectedProducts.find((product) => product.id === productId).name,
      },
    ]);
  };

  const handleCreateBatch = async () => {
    if (!newBatchName) {
      notification.error({ message: 'El nombre del lote es obligatorio.' });
      return;
    }

    const formatDateToISO = (date) => {
      return date.toISOString().split('.')[0];
    };

    const requestBody = {
      batch_name: newBatchName,
      code: generateRandomCode(),
      status: 'pending',
      requested_at: formatDateToISO(new Date()),
    };

    try {
      const response = await fetch(API_URL_CREATE_BATCH, {
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

        await productBatchResponse.json();
      }

      notification.success({ message: 'Lote creado y productos asignados exitosamente.' });
      setIsModalVisible(false);
      setNewBatchName('');
      setSelectedProducts([]);
    } catch (error) {
      notification.error({ message: error.message || 'Error al crear el lote' });
    }
  };

  // Función para generar un código aleatorio
  const generateRandomCode = () => {
    return Math.random().toString(36).substring(2, 12).toUpperCase();
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchText.toLowerCase().trim())
  );

  const columns = [
    {
      title: '',
      key: 'select',
      render: (_, record) => (
        <Tooltip title="Seleccionar Producto">
          <Button
            type="primary"
            shape="circle"
            icon={<PlusCircleOutlined />}
            onClick={() => handleSelectProduct(record)}
          />
        </Tooltip>
      ),
      width: 60,
      align: 'center',
    },
    {
      title: 'Cantidad',
      key: 'quantity',
      render: (text, record) => (
        <Select
          value={quantities[record.product_id] || 0}
          onChange={(value) => setQuantities((prev) => ({ ...prev, [record.product_id]: value }))}
          style={{ width: '100%' }}
        >
          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((qty) => (
            <Select.Option key={qty} value={qty}>
              {qty}
            </Select.Option>
          ))}
        </Select>
      ),
      width: 80,
      align: 'center',
    },
    {
      title: 'Nombre del Producto',
      dataIndex: 'name',
      key: 'name',
      width: 250,
    },
    {
      title: 'Categoría',
      key: 'category',
      render: (_, record) => {
        const category = categories.find((cat) => cat.category_id === record.category_id);
        return <Text>{category ? category.name : 'Sin Categoría'}</Text>;
      },
      width: 120,
      align: 'center',
    },
    {
      title: 'Imagen',
      key: 'image',
      render: (_, record) => (
        <Image
          width={40}
          src={record.image || 'https://via.placeholder.com/40'}
          style={{ cursor: 'pointer' }}
        />
      ),
      width: 100,
      align: 'center',
    },
  ];

  return (
    <div>
      <Navbar title="Restock Products" />
      <div style={{ padding: '20px', display: 'flex', gap: '30px' }}>
        <Card style={{ flex: 1 }}>
          <Collapse defaultActiveKey={['1']}>
            <Panel header="Buscar Productos" key="1">
              <Input.Search
                placeholder="Nombre del producto"
                onChange={(e) => setSearchText(e.target.value)}
                style={{ marginBottom: 20 }}
              />
            </Panel>
          </Collapse>
          {loading ? (
            <CardSkeleton />
          ) : (
            <Table
              dataSource={filteredProducts}
              rowKey="product_id"
              columns={columns}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: filteredProducts.length,
                onChange: (page) => setPagination({ ...pagination, current: page }),
              }}
              style={{ maxWidth: '100%' }}
            />
          )}
        </Card>

        <Card
          title="Productos Seleccionados"
          style={{ width: 300 }}
          extra={
            <Tooltip title="Confirmar Restock">
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={() => setIsModalVisible(true)}
                disabled={selectedProducts.length === 0}
              >
                Restock
              </Button>
            </Tooltip>
          }
        >
          <ul style={{ padding: 0, listStyle: 'none' }}>
            {selectedProducts.map((product) => (
              <li
                key={product.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <Image
                  width={30}
                  src={product.image || 'https://via.placeholder.com/30'}
                  style={{ marginRight: 10 }}
                />
                <Text>{product.name}</Text>
                <CloseOutlined
                  onClick={() => handleRemoveProduct(product.id)}
                  style={{ color: 'red', cursor: 'pointer' }}
                />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Modal */}
      <Modal
        title="Crear Lote"
        open={isModalVisible}
        onOk={handleCreateBatch}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          placeholder="Nombre del Lote"
          value={newBatchName}
          onChange={(e) => setNewBatchName(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default RestockProductsPage;