import React from 'react';
import { Table } from 'antd';

const CustomTable = ({ columns, dataSource, loading, pagination = 10 }) => {
  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      rowKey={(record) => record.id || record.key}
      pagination={{ pageSize: pagination }}
    />
  );
};

export default CustomTable;