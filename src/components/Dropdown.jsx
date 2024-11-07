import React from 'react';
import { Dropdown, Menu, Button } from 'antd';

const CustomDropdown = ({ overlay, children }) => {
  return (
    <Dropdown overlay={overlay}>
      <Button>{children}</Button>
    </Dropdown>
  );
};

export default CustomDropdown;