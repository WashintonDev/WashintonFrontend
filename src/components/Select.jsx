import React from 'react';
import { Select } from 'antd';

const { Option } = Select;

const CustomSelect = ({ options, value, onChange, placeholder }) => {
  return (
    <Select value={value} onChange={onChange} placeholder={placeholder}>
      {options.map((option) => (
        <Option key={option.value} value={option.value}>
          {option.label}
        </Option>
      ))}
    </Select>
  );
};

export default CustomSelect;