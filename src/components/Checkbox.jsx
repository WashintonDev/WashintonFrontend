import React from 'react';
import { Checkbox } from 'antd';

const CustomCheckbox = ({ checked, onChange, children }) => {
  return (
    <Checkbox checked={checked} onChange={onChange}>
      {children}
    </Checkbox>
  );
};

export default CustomCheckbox;