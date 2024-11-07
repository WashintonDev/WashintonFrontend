import React from 'react';
import { Table } from 'antd';

const CustomTable = ({ columns, dataSource, loading }) => {
  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      rowKey={(record) => record.id || record.key}
      pagination={{ pageSize: 10 }}
    />
  );
};

export default CustomTable;