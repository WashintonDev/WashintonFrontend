import React from 'react';
import { DatePicker } from 'antd';

const CustomDatePicker = ({ value, onChange }) => {
  return (
    <DatePicker value={value} onChange={onChange} />
  );
};

export default CustomDatePicker;