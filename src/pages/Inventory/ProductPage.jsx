import React, { useEffect, useState } from "react";
import {
  Table,
  Modal,
  Form,
  Input,
  notification,
  Button,
  Space,
  Tooltip,
  Tag,
  Image,
  Select,
  Upload,
} from "antd";
import {
  API_URL_PRODUCTS,
  API_URL_CATEGORIES,
  API_URL_SUPPLIERS,
  API_URL_PRODUCT_IMAGES,
  API_URL_PRODUCT_IMAGE_DELETE,
} from "../../services/ApisConfig";
import {
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  UploadOutlined,
  PictureOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import Navbar from "../../components/Navbar";

const { Option } = Select;

const unitOptions = [
  { label: "Litros", value: "L" },
  { label: "Mililitros", value: "mL" },
  { label: "Kilogramos", value: "kg" },
  { label: "Gramos", value: "g" },
  { label: "Miligramos", value: "mg" },
];

const typeOptions = [
  "Aerosol",
  "Líquido",
  "Barra",
  "Polvo",
  "Gel",
  "Pasta",
  "Spray",
  "Tableta",
  "Granulado",
  "Espuma",
  "Accesorio",
  "Herramienta",
  "Otro",
];

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false); // Para el modal de editar rápido
  const [editingProduct, setEditingProduct] = useState(null); // Producto en edición
  const [form] = Form.useForm();
  const [file, setFile] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [removeImage, setRemoveImage] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const { confirm } = Modal;
  
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(API_URL_CATEGORIES);
      if (!response.ok) throw new Error("Error fetching categories");
      const data = await response.json();
      setCategories(data);
      setParentCategories(data.filter((cat) => cat.parent_id === null));
    } catch (error) {
      notification.error({
        message: error.message || "Error fetching categories",
      });
    }
  };

  const showDeleteConfirm = (product_id, product_name) => {
    confirm({
      title: "Are you sure you want to delete this product?",
      icon: <ExclamationCircleOutlined style={{ color: "red" }} />,
      content: `Product: ${product_name}`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      centered: true,
      onOk() {
        handleDelete(product_id);
      },
      onCancel() {
        console.log("Cancelled deletion");
      },
    });
  };

  const handleOpenDetailsModal = (product) => {
    setSelectedProductDetails(product);
    setIsDetailsModalVisible(true);
  };
  
  const handleCloseDetailsModal = () => {
    setIsDetailsModalVisible(false);
    setSelectedProductDetails(null);
  };
  

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(API_URL_SUPPLIERS);
      if (!response.ok) throw new Error("Error fetching suppliers");
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      notification.error({
        message: error.message || "Error fetching suppliers",
      });
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(API_URL_PRODUCTS);
      if (!response.ok) throw new Error("Error fetching products");
      const data = await response.json();
      setProducts(data.sort((a, b) => a.product_id - b.product_id));
    } catch (error) {
      notification.error({
        message: error.message || "Error fetching products",
      });
    }
  };
  

  const fetchProductImages = async (productId) => {
    try {
      const response = await fetch(API_URL_PRODUCT_IMAGES(productId));
      if (!response.ok) throw new Error("Error fetching product images");
      const data = await response.json();
      setProductImages(data);
    } catch (error) {
      notification.error({ message: error.message });
    }
  };

  const handleOpenImageModal = (productId) => {
    setSelectedProductId(productId);
    setIsImageModalVisible(true);
    fetchProductImages(productId);
  };

  const handleImageModalClose = () => {
    setIsImageModalVisible(false);
    setNewImages([]);
    setFileList([]);
  };

  const handleQuickEdit = (product) => {
    setEditingProduct(product); // Establece el producto en edición
    form.setFieldsValue({
      price: product.price,
      status: product.status,
    });
    setIsEditModalVisible(true);
  };
  
  const handleAddImages = async () => {
    const formData = new FormData();
    newImages.forEach((file) => {
      formData.append("images[]", file.originFileObj);
    });

    try {
      const response = await fetch(API_URL_PRODUCT_IMAGES(selectedProductId), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Error uploading images");
      notification.success({ message: "Images uploaded successfully" });
      fetchProductImages(selectedProductId);
      setNewImages([]);
    } catch (error) {
      notification.error({ message: error.message });
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      const response = await fetch(API_URL_PRODUCT_IMAGE_DELETE(imageId), {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error deleting image");
      notification.success({ message: "Image deleted successfully" });
      fetchProductImages(selectedProductId);
    } catch (error) {
      notification.error({ message: error.message });
    }
  };

  const handleImageUpload = ({ fileList }) => {
    setNewImages(fileList);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setNewImages([]); // Limpia las imágenes adicionales
    setIsModalVisible(true);
  };
  

  const handleEdit = (product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      price: product.price,
      status: product.status,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (product_id) => {
    try {
      await fetch(`${API_URL_PRODUCTS}${product_id}/`, { method: "DELETE" });
      notification.success({ message: "Product deleted successfully" });
      fetchProducts();
    } catch (error) {
      notification.error({
        message: error.message || "Error deleting product",
      });
    }
  };
  const handleFileChange = ({ fileList }) => {
    // Limitar el fileList a un solo archivo
    const newFileList = fileList.slice(-1);
    setFile(newFileList);

    if (newFileList.length === 0) {
      setRemoveImage(true); // Indicar que se ha eliminado la imagen
    } else {
      setRemoveImage(false); // Indicar que hay una nueva imagen o no se ha eliminado
    }
  };

  const handlePreview = async (file) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow.document.write(image.outerHTML);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
  
      let filteredValues = { ...values };
  
      // En caso de edición, enviar solo los campos necesarios
      if (editingProduct) {
        filteredValues = {
          price: values.price,
          status: values.status,
        };
      } else {
        // En el caso de agregar un producto nuevo, elimina campos no necesarios
        delete filteredValues.parentCategory;
      }
  
      // Convertir precio a número
      if (filteredValues.price) {
        filteredValues.price = parseFloat(filteredValues.price);
      }
  
      const formData = new FormData();
      Object.keys(filteredValues).forEach((key) => {
        formData.append(key, filteredValues[key]);
      });
  
      // Agregar imágenes adicionales
      newImages.forEach((file) => {
        formData.append("additional_images[]", file.originFileObj);
      });
  
      const config = {
        method: editingProduct ? "PATCH" : "POST",
        body: formData,
      };
  
      const url = editingProduct
        ? `${API_URL_PRODUCTS}${editingProduct.product_id}/`
        : API_URL_PRODUCTS;
  
      const response = await fetch(url, config);
  
      if (response.ok) {
        notification.success({
          message: editingProduct
            ? "Product updated successfully"
            : "Product created successfully",
        });
        fetchProducts();
        setIsModalVisible(false);
      } else {
        const errorData = await response.json();
        console.error("Error en la respuesta del servidor:", errorData);
        throw new Error("Error saving product");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      notification.error({ message: error.message || "Error saving product" });
    }
  };
  
  const handleCancelAdd = () => {
    setIsModalVisible(false);
  };

  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
  };
  
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleParentCategoryChange = (parentId) => {
    setSubCategories(categories.filter((cat) => cat.parent_id === parentId));
    form.setFieldsValue({ category_id: null });
  };

  const columns = [
  {
    title: <span style={{ fontWeight: "bold", color: "#4b6cb7" }}>No.</span>,
    key: "index",
    render: (_, __, index) =>
      (pagination.current - 1) * pagination.pageSize + index + 1,
    width: 60,
    align: "center",
    style: { background: "#f0f7ff" },
  },
  {
    title: (
      <span style={{ fontWeight: "bold", color: "#4b6cb7" }}>Product Name</span>
    ),
    dataIndex: "name",
    key: "name",
    ellipsis: true,
    width: 200,
    render: (text) => (
      <span
        style={{
          fontWeight: "500",
          fontSize: "14px",
          color: "#3a3a3a",
        }}
      >
        {text}
      </span>
    ),
  },
  {
    title: (
      <span style={{ fontWeight: "bold", color: "#4b6cb7" }}>Image</span>
    ),
    key: "image",
    width: 80,
    render: (text, record) => {
      const firstAdditionalImage =
        record.product_images && record.product_images.length > 0
          ? record.product_images[0].image_path
          : null;

      return (
        <Image
          width={50}
          height={50}
          src={
            firstAdditionalImage
              ? `https://washintonbackend.store/${firstAdditionalImage}`
              : "https://via.placeholder.com/50"
          }
          preview={{
            src: firstAdditionalImage
              ? `https://washintonbackend.store/${firstAdditionalImage}`
              : "https://via.placeholder.com/800",
            title: record.name,
          }}
          style={{
            cursor: "pointer",
            objectFit: "contain",
            borderRadius: "5px",
            border: "1px solid #d1d1d1",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        />
      );
    },
  },
  {
    title: (
      <span style={{ fontWeight: "bold", color: "#4b6cb7" }}>Images</span>
    ),
    key: "multipleImages",
    width: 130,
    render: (_, record) => (
<Button
  icon={<PictureOutlined />}
  onClick={() => handleOpenImageModal(record.product_id)}
  style={{
    background: "#356CA0",
    color: "#ffffff",
    fontWeight: "bold",
    border: "none",
    borderRadius: "5px",
    transition: "all 0.3s ease", // Añade una transición suave
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = "#274D73"; // Cambia el fondo al pasar el cursor
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = "#356CA0"; // Vuelve al color original
  }}
>
  Images
</Button>

    ),
  },
  {
    title: <span style={{ fontWeight: "bold", color: "#4b6cb7" }}>Status</span>,
    dataIndex: "status",
    key: "status",
    render: (text) => (
      <Tag
        color={text === "active" ? "green" : "red"}
        style={{
          fontSize: "14px",
          padding: "4px 10px",
          borderRadius: "5px",
        }}
      >
        {text === "active" ? "Active" : "Inactive"}
      </Tag>
    ),
    width: 90,
  },
  {
    title: <span style={{ fontWeight: "bold", color: "#4b6cb7" }}>Brand</span>,
    dataIndex: "brand",
    key: "brand",
    ellipsis: true,
    render: (text) => (
      <Tag
        color="geekblue"
        style={{ fontSize: "14px", padding: "4px 10px", borderRadius: "5px" }}
      >
        {text}
      </Tag>
    ),
    width: 150,
  },
  {
    title: (
      <span style={{ fontWeight: "bold", color: "#4b6cb7" }}>Measure</span>
    ),
    key: "quantity",
    render: (text, record) => {
      const { volume, unit } = record;
      return volume && unit ? (
        <Tag
          color="volcano"
          style={{
            fontSize: "14px",
            padding: "4px 10px",
            borderRadius: "5px",
          }}
        >
          {`${volume}${unit}`}
        </Tag>
      ) : (
        <Tag
          color="default"
          style={{
            fontSize: "14px",
            padding: "4px 10px",
            borderRadius: "5px",
          }}
        >
          N/A
        </Tag>
      );
    },
    width: 100,
  },
  {
    title: <span style={{ fontWeight: "bold", color: "#4b6cb7" }}>SKU</span>,
    dataIndex: "sku",
    key: "sku",
    ellipsis: true,
    render: (text, record) => (
      <Tag
        color="orange"
        style={{ fontSize: "14px", padding: "4px 10px", borderRadius: "5px" }}
      >
        {record.sku}
      </Tag>
    ),
    width: 130,
  },
  {
    title: <span style={{ fontWeight: "bold", color: "#4b6cb7" }}>Price</span>,
    dataIndex: "price",
    key: "price",
    render: (text, record) => (
      <span style={{ fontWeight: "500", fontSize: "14px", color: "#3a3a3a" }}>
        <DollarOutlined style={{ color: "green" }} /> {record.price}
      </span>
    ),
    width: 120,
  },
  {
    title: (
      <span style={{ fontWeight: "bold", color: "#4b6cb7" }}>Category</span>
    ),
    key: "category",
    render: (text, record) => {
      const category = categories.find(
        (cat) => cat.category_id === record.category_id
      );
      return (
        <Tag
          color="purple"
          style={{ fontSize: "14px", padding: "4px 10px", borderRadius: "5px" }}
        >
          {category ? category.name : "Unknown Category"}
        </Tag>
      );
    },
    width: 220,
  },
  {
    title: <span style={{ fontWeight: "bold", color: "#4b6cb7" }}>Type</span>,
    dataIndex: "type",
    key: "type",
    render: (text) => (
      <Tag
        color="blue"
        style={{ fontSize: "14px", padding: "4px 10px", borderRadius: "5px" }}
      >
        {text}
      </Tag>
    ),
    width: 100,
  },
  {
    title: (
      <span style={{ fontWeight: "bold", color: "#4b6cb7" }}>Actions</span>
    ),
    key: "actions",
    render: (_, record) => (
      <Space size="middle">
        <Tooltip title="Edit">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleQuickEdit(record)}
          />
        </Tooltip>
        <Tooltip title="Delete">
          <Button
            danger
            type="link"
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record.product_id, record.name)}
          />
        </Tooltip>
        <Tooltip title="View Details">
          <Button
            onClick={() => handleOpenDetailsModal(record)}
            style={{
              background: "#356CA0",
              color: "#ffffff",
              fontWeight: "bold",
              padding: "8px 20px",
              borderRadius: "5px",
              border: "none",
              transition: "all 0.3s ease",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(90deg, #356CA0 0%, #274D73 100%)";
              e.currentTarget.style.boxShadow =
                "0px 6px 10px rgba(0, 0, 0, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(90deg, #4b6cb7 0%, #182848 100%)";
              e.currentTarget.style.boxShadow =
                "0px 4px 6px rgba(0, 0, 0, 0.1)";
            }}
          >
            Details
          </Button>
        </Tooltip>
      </Space>
    ),
    width: 120,
  },
];


  return (
    <div>
      <Navbar
        title="Products"
        buttonText="Add Product"
        onAddCategory={handleAdd}
        onSearch={setSearchText}
      />
      <div
      style={{
        padding: "20px",
        background: "#f9f9f9",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        overflowX: "auto", // Habilita el desplazamiento horizontal
        marginBottom: "20px",
      }}
    >
      <Table
        dataSource={products.filter(
          (product) =>
            product.name.toLowerCase().includes(searchText.toLowerCase()) ||
            product.description.toLowerCase().includes(searchText.toLowerCase())
        )}
        columns={columns}
        rowKey="product_id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          onChange: (page, pageSize) =>
            setPagination({ current: page, pageSize }),
        }}
      />
      </div>
      <Modal
  title={
    <div
      style={{
        fontSize: "24px",
        fontWeight: "bold",
        textAlign: "center",
        color: "#ffffff",
        padding: "10px 0",
        background: "linear-gradient(90deg, #4b6cb7 0%, #182848 100%)",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      Add Product
    </div>
  }
  visible={isModalVisible}
  onOk={handleOk}
  onCancel={handleCancelAdd}
  centered
  style={{
    borderRadius: "20px",
    overflow: "hidden",
    background: "#f5f7fa",
    boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.1)",
  }}
>
  <Form
    form={form}
    layout="vertical"
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "20px",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Form.Item
      name="name"
      label={<span style={{ fontWeight: "bold", fontSize: "16px" }}>Name</span>}
      rules={[{ required: true }]}
      style={{ flex: "1 1 45%" }}
    >
      <Input
        placeholder="Enter product name"
        style={{
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #d1d1d1",
          boxShadow: "inset 0px 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      />
    </Form.Item>
    <Form.Item
      name="description"
      label={
        <span style={{ fontWeight: "bold", fontSize: "16px" }}>Description</span>
      }
      style={{ flex: "1 1 45%" }}
    >
      <Input.TextArea
        placeholder="Enter product description"
        rows={4}
        style={{
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #d1d1d1",
          boxShadow: "inset 0px 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      />
    </Form.Item>
    <Form.Item
      name="price"
      label={<span style={{ fontWeight: "bold", fontSize: "16px" }}>Price</span>}
      rules={[{ required: true }]}
      style={{ flex: "1 1 30%" }}
    >
      <Input
        type="number"
        min={0}
        step={0.01}
        placeholder="Enter price"
        style={{
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #d1d1d1",
          boxShadow: "inset 0px 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      />
    </Form.Item>
    <Form.Item
      name="brand"
      label={<span style={{ fontWeight: "bold", fontSize: "16px" }}>Brand</span>}
      rules={[{ required: true }]}
      style={{ flex: "1 1 30%" }}
    >
      <Input
        placeholder="Enter brand name"
        style={{
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #d1d1d1",
          boxShadow: "inset 0px 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      />
    </Form.Item>
    <Form.Item
      name="volume"
      label={
        <span style={{ fontWeight: "bold", fontSize: "16px" }}>Volume</span>
      }
      style={{ flex: "1 1 30%" }}
    >
      <Input
        type="number"
        min={0}
        step={0.01}
        placeholder="Enter volume"
        style={{
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #d1d1d1",
          boxShadow: "inset 0px 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      />
    </Form.Item>
    <Form.Item
      name="unit"
      label={<span style={{ fontWeight: "bold", fontSize: "16px" }}>Unit</span>}
      style={{ flex: "1 1 30%" }}
    >
      <Select
        placeholder="Select a unit"
        style={{
          padding: "2px",
          borderRadius: "8px",
          border: "1px solid #d1d1d1",
        }}
      >
        {unitOptions.map((option) => (
          <Option key={option.value} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Select>
    </Form.Item>
    <Form.Item
      name="type"
      label={<span style={{ fontWeight: "bold", fontSize: "16px" }}>Type</span>}
      rules={[{ required: true }]}
      style={{ flex: "1 1 30%" }}
    >
      <Select
        placeholder="Select a type"
        style={{
          padding: "2px",
          borderRadius: "8px",
          border: "1px solid #d1d1d1",
        }}
      >
        {typeOptions.map((type) => (
          <Option key={type} value={type}>
            {type}
          </Option>
        ))}
      </Select>
    </Form.Item>
    <Form.Item
      label={
        <span style={{ fontWeight: "bold", fontSize: "16px" }}>
          Additional Images
        </span>
      }
      style={{ flex: "1 1 45%" }}
    >
      <Upload
        listType="picture"
        multiple
        beforeUpload={() => false}
        onChange={({ fileList }) => setNewImages(fileList)}
        fileList={newImages}
        accept="image/*"
      >
        <Button
          icon={<UploadOutlined />}
          style={{
            background: "#4b6cb7",
            color: "#ffffff",
            fontWeight: "bold",
            borderRadius: "5px",
          }}
        >
          Upload Images
        </Button>
      </Upload>
    </Form.Item>
    <Form.Item
      name="status"
      label={
        <span style={{ fontWeight: "bold", fontSize: "16px" }}>Status</span>
      }
      rules={[{ required: true }]}
      style={{ flex: "1 1 30%" }}
    >
      <Select
        placeholder="Select status"
        style={{
          padding: "2px",
          borderRadius: "8px",
          border: "1px solid #d1d1d1",
        }}
      >
        <Option value="active">Active</Option>
        <Option value="inactive">Inactive</Option>
      </Select>
    </Form.Item>
    <Form.Item
      name="parentCategory"
      label={
        <span style={{ fontWeight: "bold", fontSize: "16px" }}>Category</span>
      }
      rules={[{ required: true, message: "Please select a category" }]}
      style={{ flex: "1 1 45%" }}
    >
      <Select
        placeholder="Select parent category"
        onChange={handleParentCategoryChange}
        style={{
          padding: "2px",
          borderRadius: "8px",
          border: "1px solid #d1d1d1",
        }}
      >
        {parentCategories.map((category) => (
          <Option key={category.category_id} value={category.category_id}>
            {category.name}
          </Option>
        ))}
      </Select>
    </Form.Item>
    <Form.Item
      name="category_id"
      label={
        <span style={{ fontWeight: "bold", fontSize: "16px" }}>Subcategory</span>
      }
      rules={[{ required: true, message: "Please select a subcategory" }]}
      style={{ flex: "1 1 45%" }}
    >
      <Select
        placeholder="Select subcategory"
        style={{
          padding: "2px",
          borderRadius: "8px",
          border: "1px solid #d1d1d1",
        }}
      >
        {subCategories.map((subCategory) => (
          <Option
            key={subCategory.category_id}
            value={subCategory.category_id}
          >
            {subCategory.name}
          </Option>
        ))}
      </Select>
    </Form.Item>
    <Form.Item
      name="supplier_id"
      label={
        <span style={{ fontWeight: "bold", fontSize: "16px" }}>Supplier</span>
      }
      rules={[{ required: true }]}
      style={{ flex: "1 1 45%" }}
    >
      <Select
        showSearch
        placeholder="Select a supplier"
        style={{
          padding: "2px",
          borderRadius: "8px",
          border: "1px solid #d1d1d1",
        }}
      >
        {suppliers.map((supplier) => (
          <Option key={supplier.supplier_id} value={supplier.supplier_id}>
            {supplier.name}
          </Option>
        ))}
      </Select>
    </Form.Item>
  </Form>
</Modal>

      <Modal
  title={
    <div
      style={{
        fontSize: "24px",
        fontWeight: "bold",
        textAlign: "center",
        color: "#ffffff",
        padding: "10px 0",
        background: "linear-gradient(90deg, #4b6cb7 0%, #182848 100%)",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      {selectedProductId
        ? `${products.find(
            (product) => product.product_id === selectedProductId
          )?.name || "Unknown Product"}`
        : "Images"}
    </div>
  }
  visible={isImageModalVisible}
  onCancel={handleImageModalClose}
  footer={null}
  centered
  style={{
    borderRadius: "20px",
    overflow: "hidden",
  }}

>
  <div style={{ textAlign: "center" }}>
    
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "15px",
        justifyContent: "center",
      }}
    >
      {productImages.map((image) => (
        <div
          key={image.id}
          style={{
            background: "#ffffff",
            padding: "10px",
            borderRadius: "10px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow =
              "0px 6px 12px rgba(0, 0, 0, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow =
              "0px 4px 6px rgba(0, 0, 0, 0.1)";
          }}
        >
          <Image
            width={120}
            height={120}
            src={`https://washintonbackend.store/${image.image_path}`}
            fallback="https://via.placeholder.com/120"
            style={{
              borderRadius: "10px",
              objectFit: "cover",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Button
            danger
            onClick={() => handleDeleteImage(image.id)}
            style={{
              marginTop: "10px",
              display: "block",
              width: "100%",
              borderRadius: "5px",
              fontWeight: "bold",
            }}
          >
            Delete
          </Button>
        </div>
      ))}
    </div>
    <div
      style={{
        marginTop: "30px",
        padding: "20px",
        background: "#ffffff",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
      }}
    >
      <Upload
        listType="picture"
        multiple
        beforeUpload={() => false}
        onChange={handleImageUpload}
        fileList={newImages}
      >
        <Button
          icon={<UploadOutlined />}
          style={{
            background: "#4b6cb7",
            color: "#ffffff",
            fontWeight: "bold",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Upload Images
        </Button>
      </Upload>
      <Button
        type="primary"
        onClick={handleAddImages}
        disabled={newImages.length === 0} // Botón habilitado solo si hay imágenes
        style={{
          marginTop: "20px",
          width: "100%",
          padding: "10px 0",
          borderRadius: "5px",
          fontWeight: "bold",
          background: newImages.length > 0
            ? "linear-gradient(90deg, #4b6cb7 0%, #182848 100%)"
            : "#ccc",
          border: "none",
          cursor: newImages.length > 0 ? "pointer" : "not-allowed",
        }}
      >
        Save Images
      </Button>
    </div>
  </div>
</Modal>

<Modal
  title="Quick Edit"
  visible={isEditModalVisible}
  onOk={async () => {
    try {
      // Valida los campos del formulario
      const values = await form.validateFields();

      // Construye el objeto para enviar a la API
      const updatedProduct = {
        price: parseFloat(values.price),
        status: values.status,
      };

      // Llama a la API para actualizar el producto
      const response = await fetch(`${API_URL_PRODUCTS}${editingProduct.product_id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProduct),
      });

      if (!response.ok) {
        throw new Error("Error updating product");
      }

      notification.success({
        message: "Product updated successfully",
      });

      // Recarga la lista de productos
      fetchProducts();
      setIsEditModalVisible(false); // Cierra el modal
    } catch (error) {
      notification.error({
        message: error.message || "Error updating product",
      });
    }
  }}
  onCancel={handleCancelEdit}
>
  <Form
    form={form}
    layout="vertical"
    initialValues={{
      price: editingProduct?.price || "",
      status: editingProduct?.status || "active",
    }}
  >
    <Form.Item
      name="price"
      label="Price"
      rules={[
        { required: true, message: "Please enter the price" },
      ]}
    >
      <Input
        type="number"
        placeholder="Enter product price"
        min={0}
        step={0.01}
        style={{
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #d1d1d1",
          boxShadow: "inset 0px 2px 4px rgba(0, 0, 0, 0.1)",
        }}
      />
    </Form.Item>
    <Form.Item
      name="status"
      label="Status"
      rules={[{ required: true, message: "Please select the status" }]}
    >
      <Select
        placeholder="Select status"
        style={{
          padding: "2px",
          borderRadius: "8px",
          border: "1px solid #d1d1d1",
        }}
      >
        <Option value="active">Active</Option>
        <Option value="inactive">Inactive</Option>
      </Select>
    </Form.Item>
  </Form>
</Modal>
<Modal
  title={
    <div
      style={{
        fontSize: "22px",
        fontWeight: "bold",
        color: "#ffffff",
        textAlign: "center",
        padding: "10px 0",
        background: "linear-gradient(90deg, #4b6cb7 0%, #182848 100%)",
        borderRadius: "10px",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
      }}
    >
      Product Details
    </div>
  }
  visible={isDetailsModalVisible}
  onCancel={handleCloseDetailsModal}
  footer={[
    <Button
      key="close"
      onClick={handleCloseDetailsModal}
      style={{
        background: "linear-gradient(90deg, #356CA0 0%, #274D73 100%)",
        color: "#ffffff",
        border: "none",
        fontWeight: "bold",
        padding: "8px 20px",
        borderRadius: "5px",
      }}
    >
      Close
    </Button>,
  ]}
  centered
  width={1000}
  bodyStyle={{
    background: "#f9f9f9",
    borderRadius: "10px",
    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
    padding: "20px",
  }}
>
  {selectedProductDetails && (
    <div style={{ display: "flex", gap: "20px" }}>
      {/* Lista de imágenes a la izquierda */}
      <div
        style={{
          flex: "1",
          maxWidth: "120px",
          overflowY: "auto",
          borderRight: "1px solid #ddd",
          paddingRight: "10px",
        }}
      >
        {selectedProductDetails.product_images?.map((image, index) => (
          <div
            key={index}
            style={{
              padding: "5px",
              marginBottom: "10px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow =
                "0px 6px 10px rgba(0, 0, 0, 0.2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow =
                "0px 4px 6px rgba(0, 0, 0, 0.1)")
            }
            onClick={() =>
              setSelectedProductDetails((prev) => ({
                ...prev,
                mainImage: `https://washintonbackend.store/${image.image_path}`,
              }))
            }
          >
            <Image
              src={`https://washintonbackend.store/${image.image_path}`}
              alt={`Product image ${index + 1}`}
              width={100}
              height={100}
              preview={false}
              style={{
                borderRadius: "5px",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        ))}
      </div>

      {/* Imagen principal */}
      <div
        style={{
          flex: "2",
          textAlign: "center",
          padding: "10px",
        }}
      >
        <Image
          src={
            selectedProductDetails.mainImage ||
            `https://washintonbackend.store/${selectedProductDetails.product_images?.[0]?.image_path}`
          }
          alt={selectedProductDetails.name}
          style={{
            maxWidth: "100%",
            maxHeight: "400px",
            objectFit: "contain",
            borderRadius: "10px",
            boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.2)",
            cursor: "pointer",
          }}
          preview={{
            src:
              selectedProductDetails.mainImage ||
              `https://washintonbackend.store/${selectedProductDetails.product_images?.[0]?.image_path}`,
          }}
        />
      </div>

      {/* Detalles del producto */}
      <div style={{ flex: "3", padding: "10px 20px" }}>
        <h2
          style={{
            marginBottom: "10px",
            fontSize: "24px",
            fontWeight: "bold",
            color: "#182848",
          }}
        >
          {selectedProductDetails.name}
        </h2>
        <Tag
          color="orange"
          style={{
            fontSize: "14px",
            padding: "5px 10px",
            marginBottom: "15px",
            display: "inline-block",
            borderRadius: "5px",
          }}
        >
          SKU: {selectedProductDetails.sku}
        </Tag>
        <p style={{ fontSize: "18px", marginBottom: "10px" }}>
          <strong>Price:</strong>{" "}
          <span
            style={{
              color: "#4CAF50",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            <DollarOutlined style={{ marginRight: "5px" }} />
            ${selectedProductDetails.price}
          </span>
        </p>
        <p style={{ fontSize: "16px", marginBottom: "10px" }}>
          <strong>Description:</strong>{" "}
          {selectedProductDetails.description || "No description available"}
        </p>
        <p style={{ fontSize: "16px", marginBottom: "10px" }}>
          <strong>Brand:</strong> {selectedProductDetails.brand}
        </p>
        <p style={{ fontSize: "16px", marginBottom: "10px" }}>
          <strong>Category:</strong>{" "}
          {categories.find(
            (cat) => cat.category_id === selectedProductDetails.category_id
          )?.name || "Unknown"}
        </p>
        <p style={{ fontSize: "16px", marginBottom: "10px" }}>
          <strong>Supplier:</strong>{" "}
          {suppliers.find(
            (sup) => sup.supplier_id === selectedProductDetails.supplier_id
          )?.name || "Unknown"}
        </p>
        <p style={{ fontSize: "16px", marginBottom: "10px" }}>
          <strong>Status:</strong>{" "}
          <Tag
            color={selectedProductDetails.status === "active" ? "green" : "red"}
            style={{
              fontSize: "14px",
              padding: "5px 10px",
              borderRadius: "5px",
            }}
          >
            {selectedProductDetails.status}
          </Tag>
        </p>
      </div>
    </div>
  )}
</Modal>


            

    </div>
  );
};

export default ProductPage;
