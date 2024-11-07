import React from 'react';
import { Radio } from 'antd';

const CustomRadioGroup = ({ options, value, onChange }) => {
  return (
    <Radio.Group value={value} onChange={onChange}>
      {options.map((option) => (
        <Radio key={option.value} value={option.value}>
          {option.label}
        </Radio>
      ))}
    </Radio.Group>
  );
};

export default CustomRadioGroup;