import React, { useState, useEffect } from 'react';
import { fetchData } from '../../services/services';
import { SupplierData } from '../../services/ApisConfig';
import CustomTable from '../../components/Table';
import CustomForm from '../../components/Form';
import CustomInput from '../../components/Input';
import CustomSelect from '../../components/Select';
import CustomDatePicker from '../../components/DatePicker';


const SuppliersTable = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const columns = [
    {
      title: 'ID',
      dataIndex: 'supplier_id',
      key: 'supplier_id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
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
      <h1>Suppliers</h1>
      <CustomTable columns={columns} dataSource={suppliers} loading={loading} />
      <CustomForm onFinish={handleFormSubmit} formItems={formItems} />
    </div>
  );
};

export default SuppliersTable;