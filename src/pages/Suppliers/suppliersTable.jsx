import React, { useState, useEffect } from 'react';
import { fetchData } from '../../services/services';
import { SupplierData } from '../../services/ApisConfig';
import CustomTable from '../../components/Table';
import CustomForm from '../../components/Form';
import CustomInput from '../../components/Input';
import CustomSelect from '../../components/Select';
import CustomDatePicker from '../../components/DatePicker';
import CustomTag from '../../components/Tag';
import CustomPagination from '../../components/Pagination';
import CustomSpace from '../../components/Space';
import { Button, Tooltip, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import Navbar from '../../components/Navbar';

const SuppliersTable = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const endpointUrl = SupplierData;

  useEffect(() => {
    const getSuppliers = async () => {
      try {
        const data = await fetchData(endpointUrl);
        setSuppliers(data);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      } finally {
        setLoading(false);
      }
    };

    getSuppliers();
  }, [endpointUrl]);

  const handleFormSubmit = (values) => {
    console.log('Form submitted with values:', values);
  };

  const handleEdit = (record) => {
    console.log('Edit record:', record);
  };

  const handleDelete = (supplier_id) => {
    console.log('Delete supplier with ID:', supplier_id);
  };

  const handleAdd = () => {
    setEditingSupplier(null);
    form.resetFields();
    setIsModalVisible(true);
};

const handleSearch = (value) => {
  setSearchText(value);
};

  const columns = [
    {
      title: 'No.',
      key: 'index',
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
      width: 60,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: 250,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
      render: (text, record) => (
        <CustomTag color="">{record.email}</CustomTag>
      ),
      width: 250,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      ellipsis: true,
      render: (text, record) => (
        <CustomTag color="blue">{record.phone}</CustomTag>
      ),
      width: 150,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit" placement="bottom">
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
              style={{ padding: 0 }}
            />
          </Tooltip>
          <Tooltip title="Delete" placement="bottom">
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

  const formItems = [
    {
      name: 'name',
      label: 'Name',
      rules: [{ required: true, message: 'Please input the name!' }],
      component: <CustomInput placeholder="Name" />,
    },
    {
      name: 'description',
      label: 'Description',
      rules: [{ required: true, message: 'Please input the description!' }],
      component: <CustomInput placeholder="Description" />,
    },
    {
      name: 'email',
      label: 'Email',
      rules: [{ required: true, message: 'Please input the email!' }],
      component: <CustomInput placeholder="Email" />,
    },
    {
      name: 'phone',
      label: 'Phone',
      rules: [{ required: true, message: 'Please input the phone!' }],
      component: <CustomInput placeholder="Phone" />,
    },
    {
      name: 'status',
      label: 'Status',
      rules: [{ required: true, message: 'Please select the status!' }],
      component: (
        <CustomSelect
          placeholder="Select Status"
          options={[
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ]}
        />
      ),
    },
    {
      name: 'contract_expiration_date',
      label: 'Contract Expiration Date',
      rules: [{ required: true, message: 'Please select the date!' }],
      component: <CustomDatePicker />,
    },
  ];

  return (
    <div>
      <Navbar 
        title="Suppliers" 
        buttonText="Add Supplier" 
        onAddCategory={handleAdd} 
        onSearch={handleSearch}
    />
      <CustomTable columns={columns} dataSource={suppliers} loading={loading} pagination={pagination} />
      <CustomForm onFinish={handleFormSubmit} formItems={formItems} />
    </div>
  );
};

export default SuppliersTable;