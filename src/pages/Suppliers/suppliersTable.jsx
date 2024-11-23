import React, { useState, useEffect } from 'react';
import { fetchData, postData, putData } from '../../services/services';
import { API_URL_SUPPLIERS } from '../../services/ApisConfig';
import CustomTable from '../../components/Table';
import { Button, Tooltip, Space, Modal, Form, Input, Select, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar';

const SuppliersTable = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    const getSuppliers = async () => {
      try {
        const data = await fetchData(API_URL_SUPPLIERS);
        setSuppliers(data);
        setFilteredSuppliers(data); 
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      } finally {
        setLoading(false);
      }
    };

    getSuppliers();
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value) {
      setFilteredSuppliers(
        suppliers.filter((supplier) =>
          supplier.name.toLowerCase().includes(value.toLowerCase())
        )
      );
    } else {
      setFilteredSuppliers(suppliers);
    }
  };

  const handleAdd = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingSupplier(record);
    form.setFieldsValue(record);
    setIsEditModalVisible(true);
  };

  const handleSaveAdd = async (values) => {
    try {
      await postData(API_URL_SUPPLIERS, values);
      message.success('Supplier added successfully!');
      setIsModalVisible(false);
      reloadSuppliers();
    } catch (error) {
      message.error('Error adding supplier!');
      console.error(error);
    }
  };

  const handleSaveEdit = async (values) => {
    try {
      await putData(`${API_URL_SUPPLIERS}/${editingSupplier.supplier_id}`, values);
      message.success('Supplier updated successfully!');
      setIsEditModalVisible(false);
      reloadSuppliers();
    } catch (error) {
      message.error('Error updating supplier!');
      console.error(error);
    }
  };

  const reloadSuppliers = async () => {
    setLoading(true);
    try {
      const data = await fetchData(API_URL_SUPPLIERS);
      setSuppliers(data);
      setFilteredSuppliers(data);
    } catch (error) {
      console.error('Error reloading suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (supplier_id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this supplier?',
      content: 'This action cannot be undone.',
      okText: 'Yes, delete',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await fetch(`${API_URL_SUPPLIERS}/${supplier_id}`, {
            method: 'DELETE',
          });
          if (response.ok) {
            message.success('Supplier deleted successfully!');
            reloadSuppliers();
          } else {
            const error = await response.json();
            message.error(`Error deleting supplier: ${error.message || 'Unknown error'}`);
          }
        } catch (error) {
          message.error('Failed to delete supplier. Please try again.');
          console.error('Error deleting supplier:', error);
        }
      },
    });
  };

  const columns = [
    {
      title: 'No.',
      key: 'index',
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
      width: 60,
    },
    { title: 'Name', dataIndex: 'name', key: 'name', ellipsis: true, width: 250 },
    { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true, width: 250 },
    { title: 'Phone', dataIndex: 'phone', key: 'phone', ellipsis: true, width: 150 },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ padding: 0 }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              danger
              type="link"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.supplier_id)}
              style={{ padding: 0 }}
            />
          </Tooltip>
        </Space>
      ),
      width: 120,
    },
  ];

  return (
    <div>
      <Navbar title="Suppliers" buttonText="Add Supplier" onAddCategory={handleAdd} onSearch={handleSearch} />
      <CustomTable columns={columns} dataSource={filteredSuppliers} loading={loading} pagination={pagination} />

      {/* Modal for Adding Supplier */}
      <Modal
        title="Add Supplier"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveAdd}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input the name!' }]}>
            <Input placeholder="Name" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input the description!' }]}
          >
            <Input placeholder="Description" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please input the email!' }]}>
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true, message: 'Please input the phone!' }]}>
            <Input placeholder="Phone" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select the status!' }]}
          >
            <Select options={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for Editing Supplier */}
      <Modal
        title="Edit Supplier"
        visible={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveEdit}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input the name!' }]}>
            <Input placeholder="Name" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please input the email!' }]}>
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true, message: 'Please input the phone!' }]}>
            <Input placeholder="Phone" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input the description!' }]}
          >
            <Input placeholder="Description" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select the status!' }]}
          >
            <Select options={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SuppliersTable;
