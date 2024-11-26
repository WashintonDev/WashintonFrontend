import React, { useState, useEffect } from "react";
import { Table, Modal, Form, Input, Select, DatePicker, Button, message, Spin } from "antd";
import axios from "axios";
import {
  API_URL_STORE_TRANSFER,
  API_URL_PRODUCTS,
  API_URL_CREATE_STORE_TRANSFER,
  API_URL_STORES,
  API_URL_STORE_TRANSFER_DETAIL
} from '../../services/ApisConfig';

const { Option } = Select;

const StoreTransferPage = () => {
  const [transfers, setTransfers] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [transferDetails, setTransferDetails] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  // Fetch store transfers
  const fetchStoreTransfers = async () => {
    setTableLoading(true);
    try {
      const { data } = await axios.get(API_URL_STORE_TRANSFER);
      setTransfers(data);
    } catch (error) {
      message.error("Error fetching store transfers");
    } finally {
      setTableLoading(false);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(API_URL_PRODUCTS);
      setProducts(data);
    } catch (error) {
      message.error("Error fetching products");
    }
  };

  // Fetch stores
  const fetchStores = async () => {
    try {
      const { data } = await axios.get(API_URL_STORES);
      setStores(data);
    } catch (error) {
      message.error("Error fetching stores");
    }
  };

  // Fetch transfer details
  const fetchTransferDetails = async (transferId) => {
    try {
      const { data } = await axios.get(`${API_URL_STORE_TRANSFER_DETAIL}?store_transfer_id=${transferId}`);
      setTransferDetails(data);
    } catch (error) {
      message.error("Error fetching transfer details");
    }
  };

  // Handle Modal Submit
  const handleCreateTransfer = async (values) => {
    const payload = {
      store_id: values.store_id,
      store_transfer_name: values.store_transfer_name,
      status: "pending",
      requested_at: new Date().toISOString(), // Set requested_at to current timestamp
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
      message.error(
        `Error creating store transfer: ${
          error.response?.data?.message || "Please try again"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreTransfers();
    fetchProducts();
    fetchStores();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "store_transfer_id",
      key: "store_transfer_id",
    },
    {
      title: "Name",
      dataIndex: "store_transfer_name",
      key: "store_transfer_name",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Requested At",
      dataIndex: "requested_at",
      key: "requested_at",
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
    },
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
    {
      title: "Product ID",
      dataIndex: "product_id",
      key: "product_id",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
    },
  ];

  return (
    <div>
      <h1>Store Transfers</h1>
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

      <Modal
        title="Create Store Transfer"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTransfer}
        >
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
            rules={[{ required: true, message: "Please enter the transfer name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Received Date"
            name="received_date"
            rules={[{ required: true, message: "Please select the received date" }]}
          >
            <DatePicker showTime />
          </Form.Item>

          <Form.List name="details">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }) => (
                  <div key={key} style={{ display: "flex", marginBottom: 8 }}>
                    <Form.Item
                      {...restField}
                      name={[name, "product_id"]}
                      fieldKey={[fieldKey, "product_id"]}
                      rules={[{ required: true, message: "Select a product" }]}
                    >
                      <Select
                        placeholder="Select Product"
                        style={{ width: "200px" }}
                      >
                        {products.map((product) => (
                          <Option key={product.id} value={product.id}>
                            {product.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, "quantity"]}
                      fieldKey={[fieldKey, "quantity"]}
                      rules={[
                        { required: true, message: "Enter quantity" },
                        { type: "number", min: 1, message: "Quantity must be at least 1" }
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="Quantity"
                        min={1}
                      />
                    </Form.Item>

                    <Button
                      type="link"
                      danger
                      onClick={() => remove(name)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()}>
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

      <Modal
        title="Store Transfer Details"
        open={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        footer={null}
      >
        {selectedTransfer ? (
          <div>
            <p><strong>ID:</strong> {selectedTransfer.store_transfer_id}</p>
            <p><strong>Name:</strong> {selectedTransfer.store_transfer_name}</p>
            <p><strong>Status:</strong> {selectedTransfer.status}</p>
            <p><strong>Requested At:</strong> {selectedTransfer.requested_at}</p>
            <p><strong>Created At:</strong> {selectedTransfer.created_at}</p>
            <h3>Transfer Details:</h3>
            <Table
              columns={detailColumns}
              dataSource={transferDetails.filter(detail => detail.store_transfer_id === selectedTransfer.store_transfer_id)}
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