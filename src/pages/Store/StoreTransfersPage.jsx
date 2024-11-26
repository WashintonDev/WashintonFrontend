import React, { useState, useEffect } from "react";
import {
  Table,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  message,
  Spin,
  notification,
} from "antd";
import Navbar from '../../components/Navbar';
import axios from "axios";
import {
  API_URL_STORE_TRANSFER,
  API_URL_PRODUCTS,
  API_URL_CREATE_STORE_TRANSFER,
  API_URL_STORES,
  API_URL_STORE_TRANSFER_DETAIL,
  API_URL_INVENTORIES,
} from "../../services/ApisConfig";

const { Option } = Select;

const StoreTransferPage = () => {
  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [transferDetails, setTransferDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [form] = Form.useForm();

  // Fetch data functions
  const fetchData = async (url, setter, errorMessage) => {
    try {
      const { data } = await axios.get(url);
      setter(data);
    } catch (error) {
      notification.error({ message: errorMessage });
    }
  };

  const fetchStoreTransfers = () =>
    fetchData(
      API_URL_STORE_TRANSFER,
      setTransfers,
      "Error fetching store transfers"
    );

  const fetchProducts = () =>
    fetchData(API_URL_PRODUCTS, setProducts, "Error fetching products");

  const fetchStores = () =>
    fetchData(API_URL_STORES, setStores, "Error fetching stores");

  const fetchTransferDetails = async (transferId) => {
    try {
      const { data } = await axios.get(API_URL_STORE_TRANSFER_DETAIL);
      const filteredData = data.filter(detail => detail.store_transfer_id === transferId);
      setTransferDetails(filteredData);
    } catch (error) {
      message.error("Error fetching transfer details");
    }
  };
  
  const fetchInventories = async () => {
    try {
      const { data } = await axios.get(API_URL_INVENTORIES);
      setInventories(data);
    } catch (error) {
      notification.error({ message: "Error fetching inventories" });
    }
  };

  // Calculate available stock for a product
  const getAvailableStock = (productId) => {
    const mainInventory = inventories.find(
      (inv) => inv.product_id === productId && inv.warehouse_id === 1
    );
    const reservedStock = inventories
      .filter((inv) => inv.product_id === productId && inv.store_id)
      .reduce((acc, inv) => acc + inv.Reserved_Stock, 0);

    return mainInventory
      ? mainInventory.stock - mainInventory.Reserved_Stock - reservedStock
      : 0;
  };

  // Handle Modal Submit
  const handleCreateTransfer = async (values) => {
    const payload = {
      store_id: values.store_id,
      store_transfer_name: values.store_transfer_name,
      status: "pending",
      requested_at: new Date().toISOString(),
      received_date: values.received_date.format("YYYY-MM-DDTHH:mm:ss"),
      details: values.details.map((detail) => ({
        product_id: detail.product_id,
        quantity: detail.quantity,
        status: "active",
      })),
    };

    try {
      setLoading(true);
      await axios.post(API_URL_CREATE_STORE_TRANSFER, payload);
      message.success("Transfer created successfully");
      setIsModalVisible(false);
      form.resetFields();
      fetchStoreTransfers();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Please try again later";
      message.error(`Error creating store transfer: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchStoreTransfers();
    fetchProducts();
    fetchStores();
    fetchInventories();
  }, []);

  // Table columns
  const columns = [
    { title: "ID", dataIndex: "store_transfer_id", key: "store_transfer_id" },
    { title: "Name", dataIndex: "store_transfer_name", key: "store_transfer_name" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Requested At", dataIndex: "requested_at", key: "requested_at" },
    { title: "Created At", dataIndex: "created_at", key: "created_at" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedTransfer(record);
            fetchTransferDetails(record.store_transfer_id);
            setIsDetailsModalVisible(true);
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  const detailColumns = [
    { title: "Product ID", dataIndex: "product_id", key: "product_id" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Created At", dataIndex: "created_at", key: "created_at" },
  ];

  return (
    <div>
      <Navbar title="Store Transfers" showSearch={false} showAdd={false} />
      <Button type="primary" onClick={() => setIsModalVisible(true)}>
        Create New Transfer
      </Button>
      <Spin spinning={tableLoading}>
        <Table
          columns={columns}
          dataSource={transfers}
          rowKey="store_transfer_id"
          style={{ marginTop: 20 }}
          pagination={{ pageSize: 10 }}
        />
      </Spin>

      {/* Create Transfer Modal */}
      <Modal
        title="Create Store Transfer"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateTransfer}>
          <Form.Item
            label="Store"
            name="store_id"
            rules={[{ required: true, message: "Please select a store" }]}
          >
            <Select placeholder="Select Store">
              {stores.map((store) => (
                <Option key={store.store_id} value={store.store_id}>
                  {store.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Transfer Name"
            name="store_transfer_name"
            rules={[
              { required: true, message: "Please enter the transfer name" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Received Date"
            name="received_date"
            rules={[
              { required: true, message: "Please select the received date" },
            ]}
          >
            <DatePicker showTime />
          </Form.Item>

          <Form.List name="details">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} style={{ display: "flex", marginBottom: 8 }}>
                    <Form.Item
                      {...restField}
                      name={[name, "product_id"]}
                      rules={[
                        { required: true, message: "Please select a product" },
                      ]}
                      style={{ flex: 2, marginRight: 8 }}
                    >
                      <Select placeholder="Select Product">
                        {products.map((product) => (
                          <Option
                            key={product.product_id}
                            value={product.product_id}
                          >
                            {product.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "quantity"]}
                      rules={[
                        { required: true, message: "Enter quantity" },
                        {
                          validator: (_, value, callback) => {
                            const productId = form.getFieldValue([
                              "details",
                              name,
                              "product_id",
                            ]);
                            const availableStock = getAvailableStock(productId);
                            if (value > availableStock) {
                              return Promise.reject(
                                new Error(
                                  `Quantity exceeds available stock (${availableStock})`
                                )
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                      style={{ flex: 1, marginRight: 8 }}
                    >
                      <Input
                        type="number"
                        placeholder="Quantity"
                        min={1}
                      />
                    </Form.Item>
                    <Button type="link" danger onClick={() => remove(name)}>
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  Add Product
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ marginTop: "20px" }}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Details Modal */}
      <Modal
        title="Store Transfer Details"
        open={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        footer={null}
      >
        {selectedTransfer ? (
          <div>
            <p>
              <strong>ID:</strong> {selectedTransfer.store_transfer_id}
            </p>
            <p>
              <strong>Name:</strong> {selectedTransfer.store_transfer_name}
            </p>
            <p>
              <strong>Status:</strong> {selectedTransfer.status}
            </p>
            <p>
              <strong>Requested At:</strong> {selectedTransfer.requested_at}
            </p>
            <p>
              <strong>Created At:</strong> {selectedTransfer.created_at}
            </p>
            <h3>Transfer Details:</h3>
            <Table
              columns={detailColumns}
              dataSource={transferDetails}
              rowKey="transfer_detail_id"
              pagination={{ pageSize: 5 }}
            />
          </div>
        ) : (
          <Spin />
        )}
      </Modal>
    </div>
  );
};

export default StoreTransferPage;