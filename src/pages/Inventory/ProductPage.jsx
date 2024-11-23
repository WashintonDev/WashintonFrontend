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
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [file, setFile] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [removeImage, setRemoveImage] = useState(false);

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
      console.log(data); // Verifica que 'productImages' esté presente en cada producto
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
    setFile([]); // Esto asegura que esté vacío al agregar un nuevo producto
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
  
      // Si es una edición, enviar solo price y status
      if (editingProduct) {
        filteredValues = {
          price: values.price,
          status: values.status,
        };
      } else {
        // En el caso de Add Product, eliminar campos innecesarios
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
  
      // Agregar la imagen si existe
      if (file.length > 0 && file[0].originFileObj) {
        formData.append("image", file[0].originFileObj);
      }
  
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
  

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleParentCategoryChange = (parentId) => {
    setSubCategories(categories.filter((cat) => cat.parent_id === parentId));
    form.setFieldsValue({ category_id: null });
  };

  const columns = [
    {
      title: "No.",
      key: "index",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
      width: 60,
    },
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      width: 300,
    },
    {
  title: "Image",
  key: "image",
  width: 100,
  render: (text, record) => {
    // Obtén la primera imagen de productImages si existe
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
        }}
      />
    );
  },
},

      
      
    {
      title: "Multiple Images",
      key: "multipleImages",
      width: 170,
      render: (_, record) => (
        <Button
          icon={<PictureOutlined />}
          onClick={() => handleOpenImageModal(record.product_id)}
        >
          Manage Images
        </Button>
      ),
    },
    {
      title: "Brand",
      dataIndex: "brand",
      key: "brand",
      ellipsis: true,
      render: (text) => <Tag color="geekblue">{text}</Tag>,
      width: 150,
    },
    {
      title: "Quantity",
      key: "quantity",
      render: (text, record) => {
        const { volume, unit } = record;
        return volume && unit ? (
          <Tag color="volcano">{`${volume}${unit}`}</Tag>
        ) : (
          <Tag color="default">N/A</Tag>
        );
      },
      width: 150,
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      ellipsis: true,
      render: (text, record) => <Tag color="orange">{record.sku}</Tag>,
      width: 130,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (text, record) => (
        <span>
          <DollarOutlined style={{ color: "green" }} /> {record.price}
        </span>
      ),
      width: 150,
    },
    {
      title: "Category",
      key: "category",
      render: (text, record) => {
        const category = categories.find(
          (cat) => cat.category_id === record.category_id
        );
        return (
          <Tag color="purple">
            {category ? category.name : "Unknown Category"}
          </Tag>
        );
      },
      width: 200,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (text) => <Tag color="blue">{text}</Tag>,
      width: 200,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              danger
              type="link"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.product_id)}
            />
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
      />
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
      <Modal
        title={editingProduct ? "Edit Product" : "Add Product"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true }]}>
            <Input type="number" min={0} step={0.01} />
          </Form.Item>
          <Form.Item name="brand" label="Brand" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="volume" label="Volume">
            <Input
              type="number"
              min={0}
              step={0.01}
              placeholder="Enter volume or leave empty"
            />
          </Form.Item>
          <Form.Item name="unit" label="Unit">
            <Select placeholder="Select a unit or leave empty">
              {unitOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select placeholder="Select a type">
              {typeOptions.map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Image">
            <Upload
              listType="picture"
              fileList={file}
              beforeUpload={() => false} // Evita la carga automática
              onChange={handleFileChange}
              onPreview={handlePreview}
              accept="image/*"
              maxCount={1} // Limitar a un solo archivo
            >
              {file.length < 1 && (
                <Button icon={<UploadOutlined />}>Upload Image</Button>
              )}
            </Upload>
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Category"
            name="parentCategory"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select
              placeholder="Select parent category"
              onChange={handleParentCategoryChange}
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
            label="Subcategory"
            rules={[{ required: true, message: "Please select a subcategory" }]}
          >
            <Select placeholder="Select subcategory">
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
            label="Supplier"
            rules={[{ required: true }]}
          >
            <Select showSearch placeholder="Select a supplier">
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
  title="Manage Product Images"
  visible={isImageModalVisible}
  onCancel={handleImageModalClose}
  footer={null}
>
  <div>
    {/* Imagen principal del producto */}
    {selectedProductId && products.length > 0 && (
      <div style={{ marginBottom: "20px" }}>
        <h3>Main Image</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {products.find((p) => p.product_id === selectedProductId)?.image ? (
            <>
              <Image
                width={100}
                src={`https://washintonbackend.store/${products.find(
                  (p) => p.product_id === selectedProductId
                )?.image}`}
                fallback="https://via.placeholder.com/100"
              />
              <Button
                danger
                onClick={async () => {
                  try {
                    const product = products.find(
                      (p) => p.product_id === selectedProductId
                    );
                    if (product) {
                      const response = await fetch(
                        `${API_URL_PRODUCTS}${product.product_id}/`,
                        {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ image: "" }),
                        }
                      );
                      if (response.ok) {
                        notification.success({
                          message: "Main image deleted successfully",
                        });
                        fetchProducts(); // Actualizar la lista de productos
                      } else {
                        throw new Error("Failed to delete main image");
                      }
                    }
                  } catch (error) {
                    notification.error({ message: error.message });
                  }
                }}
              >
                Delete Main Image
              </Button>
            </>
          ) : (
            <Upload
  listType="picture"
  beforeUpload={(file) => {
    const formData = new FormData();
    formData.append("image", file);

    const product = products.find((p) => p.product_id === selectedProductId);
    if (product) {
      fetch(`${API_URL_PRODUCTS}${product.product_id}/`, {
        method: "PATCH",
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            notification.success({
              message: "Main image uploaded successfully",
            });
            fetchProducts(); // Actualizar los productos
          } else {
            throw new Error("Failed to upload main image");
          }
        })
        .catch((error) => {
          notification.error({ message: error.message });
        });
    }

    return false; // Cancela la carga automática de Ant Design
  }}
  maxCount={1}
>
  <Button icon={<UploadOutlined />}>Upload Main Image</Button>
</Upload>

          )}
        </div>
      </div>
    )}

    {/* Otras imágenes del producto */}
    <h3>Additional Images</h3>
    <div>
      {productImages.map((image) => (
        <div
          key={image.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <Image
            width={100}
            src={`https://washintonbackend.store/${image.image_path}`}
            fallback="https://via.placeholder.com/100"
          />
          <Button danger onClick={() => handleDeleteImage(image.id)}>
            Delete
          </Button>
        </div>
      ))}
    </div>

    {/* Subir nuevas imágenes */}
    <Upload
      listType="picture"
      multiple
      beforeUpload={() => false}
      onChange={handleImageUpload}
      fileList={newImages}
    >
      <Button icon={<UploadOutlined />}>Upload Images</Button>
    </Upload>
    <Button
      type="primary"
      onClick={handleAddImages}
      style={{ marginTop: "10px" }}
    >
      Save Images
    </Button>
  </div>
</Modal>

            

    </div>
  );
};

export default ProductPage;
