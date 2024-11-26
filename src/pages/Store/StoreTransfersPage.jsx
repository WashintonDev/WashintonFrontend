import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, message, Tag } from 'antd';
import axios from 'axios';
import { BASE_API_URL } from '../../services/ApisConfig';

const { Option } = Select;

const SalesTransferPage = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_API_URL}store-transfers`);
      setTransfers(response.data);
    } catch (error) {
      message.error('Failed to fetch transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values) => {
    try {
      await axios.post(`${BASE_API_URL}create-transfer`, values);
      message.success('Transfer created successfully');
      fetchTransfers();
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to create transfer');
    }
  };

  const handleViewDetails = async (transfer) => {
    try {
      const response = await axios.get(`${BASE_API_URL}store-transfer-details/${transfer.store_transfer_id}`);
      setSelectedTransfer(response.data);
      setIsModalVisible(true);
    } catch (error) {
      message.error('Failed to fetch transfer details');
    }
  };

  const renderStatusTag = (status) => {
    switch (status) {
      case 'pending':
        return <Tag color="orange">Pending</Tag>;
      case 'received':
        return <Tag color="green">Received</Tag>;
      default:
        return <Tag color="blue">{status}</Tag>;
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'store_transfer_id',
      key: 'store_transfer_id',
    },
    {
      title: 'Store ID',
      dataIndex: 'store_id',
      key: 'store_id',
    },
    {
      title: 'Transfer Name',
      dataIndex: 'store_transfer_name',
      key: 'store_transfer_name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: renderStatusTag,
    },
    {
      title: 'Requested At',
      dataIndex: 'requested_at',
      key: 'requested_at',
    },
    {
      title: 'Received Date',
      dataIndex: 'received_date',
      key: 'received_date',
      render: (text) => text || 'Not Received',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Button type="link" onClick={() => handleViewDetails(record)}>
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Store Transfers</h1>
      <Button type="primary" onClick={() => setIsModalVisible(true)}>
        Create Transfer
      </Button>
      <Table
        columns={columns}
        dataSource={transfers}
        loading={loading}
        rowKey="store_transfer_id"
        style={{ marginTop: 20 }}
      />
      <Modal
        title="Create Transfer"
        visible={isModalVisible && !selectedTransfer}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleCreate}>
          <Form.Item
            name="store_id"
            label="Store ID"
            rules={[{ required: true, message: 'Please input the store ID!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="store_transfer_name"
            label="Transfer Name"
            rules={[{ required: true, message: 'Please input the transfer name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select the status!' }]}
          >
            <Select>
              <Option value="pending">Pending</Option>
              <Option value="received">Received</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="requested_at"
            label="Requested At"
            rules={[{ required: true, message: 'Please select the requested date!' }]}
          >
            <DatePicker showTime />
          </Form.Item>
          <Form.Item
            name="received_date"
            label="Received Date"
          >
            <DatePicker showTime />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Transfer Details"
        visible={isModalVisible && selectedTransfer}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedTransfer(null);
        }}
        footer={null}
      >
        {selectedTransfer && (
          <div>
            <p><strong>Store ID:</strong> {selectedTransfer.store_id}</p>
            <p><strong>Transfer Name:</strong> {selectedTransfer.store_transfer_name}</p>
            <p><strong>Status:</strong> {renderStatusTag(selectedTransfer.status)}</p>
            <p><strong>Requested At:</strong> {selectedTransfer.requested_at}</p>
            <p><strong>Received Date:</strong> {selectedTransfer.received_date || 'Not Received'}</p>
            <h3>Details:</h3>
            <Table
              columns={[
                { title: 'Product ID', dataIndex: 'product_id', key: 'product_id' },
                { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
                { title: 'Status', dataIndex: 'status', key: 'status' },
              ]}
              dataSource={selectedTransfer.details}
              rowKey="product_id"
              pagination={false}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SalesTransferPage;