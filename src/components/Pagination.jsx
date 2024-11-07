import React from 'react';
import { Pagination } from 'antd';

const CustomPagination = ({ current, total, onChange }) => {
  return (
    <Pagination current={current} total={total} onChange={onChange} />
  );
};

export default CustomPagination;